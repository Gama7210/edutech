import express      from 'express';
import cors         from 'cors';
import path         from 'path';
import fs           from 'fs';
import { fileURLToPath } from 'url';
import rateLimit    from 'express-rate-limit';
import multer       from 'multer';
import { v4 as uuid } from 'uuid';
import dotenv       from 'dotenv';
dotenv.config();

// Crear carpetas necesarias
['uploads/videos','uploads/cursos','uploads/avatares','uploads/pdfs'].forEach(dir => {
  if (!fs.existsSync(dir)) { fs.mkdirSync(dir, { recursive: true }); console.log('📁 Carpeta creada:', dir); }
});

import { verificarToken, soloAdmin } from './middlewares/auth.js';
import {
  registrar, iniciarSesion, obtenerPerfil, actualizarPerfil,
  cambiarContrasena, solicitarRecuperacion, restablecerContrasena, obtenerUsuarios,
} from './controllers/authController.js';
import {
  obtenerCursos, obtenerCurso, crearCurso, actualizarCurso, eliminarCurso,
  crearLeccion, actualizarLeccion, eliminarLeccion,
  obtenerProfesores, crearProfesor, actualizarProfesor, eliminarProfesor,
  obtenerCategorias, obtenerEstadisticas,
} from './controllers/cursosController.js';
import {
  inscribirse, misCursos, completarLeccion, obtenerProgreso,
  obtenerCuestionario, enviarRespuestas, calificarCurso, misCertificados,
} from './controllers/progresoController.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.set('trust proxy', 1);
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5174', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

// ── Multer ────────────────────────────────────────────
const almacen = multer.diskStorage({
  destination: (req, file, cb) => {
    let dir = 'uploads/avatares';
    if (file.fieldname === 'video')  dir = 'uploads/videos';
    if (file.fieldname === 'imagen') dir = 'uploads/cursos';
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, uuid() + path.extname(file.originalname)),
});
const subida = multer({
  storage: almacen,
  limits: { fileSize: 1024 * 1024 * 1024 }, // 1GB para videos de alta calidad
});

// ── AUTH ──────────────────────────────────────────────
app.post('/api/auth/registrar',          registrar);
app.post('/api/auth/iniciar-sesion',     iniciarSesion);
app.post('/api/auth/recuperar',          solicitarRecuperacion);
app.post('/api/auth/restablecer',        restablecerContrasena);
app.get ('/api/auth/perfil',             verificarToken, obtenerPerfil);
app.put ('/api/auth/perfil',             verificarToken, subida.single('avatar'), actualizarPerfil);
app.post('/api/auth/cambiar-contrasena', verificarToken, cambiarContrasena);
app.get ('/api/auth/usuarios',           verificarToken, soloAdmin, obtenerUsuarios);

// ── CURSOS ────────────────────────────────────────────
app.get   ('/api/cursos',              verificarToken, obtenerCursos);
app.post  ('/api/cursos',              verificarToken, soloAdmin, subida.single('imagen'), crearCurso);
app.get   ('/api/cursos/estadisticas', verificarToken, soloAdmin, obtenerEstadisticas);
app.get   ('/api/cursos/:id',          verificarToken, obtenerCurso);
app.put   ('/api/cursos/:id',          verificarToken, soloAdmin, subida.single('imagen'), actualizarCurso);
app.delete('/api/cursos/:id',          verificarToken, soloAdmin, eliminarCurso);

// ── LECCIONES ─────────────────────────────────────────
app.post  ('/api/lecciones',     verificarToken, soloAdmin, subida.single('video'), crearLeccion);
app.put   ('/api/lecciones/:id', verificarToken, soloAdmin, subida.single('video'), actualizarLeccion);
app.delete('/api/lecciones/:id', verificarToken, soloAdmin, eliminarLeccion);

// ── PROFESORES ────────────────────────────────────────
app.get   ('/api/profesores',     verificarToken, obtenerProfesores);
app.post  ('/api/profesores',     verificarToken, soloAdmin, subida.single('avatar'), crearProfesor);
app.put   ('/api/profesores/:id', verificarToken, soloAdmin, subida.single('avatar'), actualizarProfesor);
app.delete('/api/profesores/:id', verificarToken, soloAdmin, eliminarProfesor);

// ── CATEGORIAS ────────────────────────────────────────
app.get('/api/categorias', verificarToken, obtenerCategorias);

// ── INSCRIPCIONES Y PROGRESO ──────────────────────────
app.post('/api/inscripciones',              verificarToken, inscribirse);
app.get ('/api/mis-cursos',                 verificarToken, misCursos);
app.post('/api/progreso/leccion',           verificarToken, completarLeccion);
app.get ('/api/progreso/:curso_id',         verificarToken, obtenerProgreso);

// ── CUESTIONARIOS ─────────────────────────────────────
app.get ('/api/cuestionario/:curso_id',     verificarToken, obtenerCuestionario);
app.post('/api/cuestionario/respuestas',    verificarToken, enviarRespuestas);

// ── CALIFICACIONES ────────────────────────────────────
app.post('/api/calificaciones',             verificarToken, calificarCurso);

// ── CERTIFICADOS ──────────────────────────────────────
app.get('/api/mis-certificados',            verificarToken, misCertificados);


// ── PREGUNTAS Y OPCIONES ──────────────────────────────
app.get ('/api/preguntas/:curso_id', verificarToken, async (req, res) => {
  try {
    const [preguntas] = await (await import('./config/bd.js')).default.execute(
      'SELECT * FROM preguntas WHERE curso_id = ? ORDER BY orden', [req.params.curso_id]
    );
    for (const p of preguntas) {
      const [opciones] = await (await import('./config/bd.js')).default.execute(
        'SELECT * FROM opciones_respuesta WHERE pregunta_id = ? ORDER BY orden', [p.id]
      );
      p.opciones = opciones;
    }
    res.json({ preguntas });
  } catch(e) { res.status(500).json({ mensaje: 'Error' }); }
});

app.post('/api/preguntas', verificarToken, soloAdmin, async (req, res) => {
  try {
    const { curso_id, texto, orden } = req.body;
    const bd = (await import('./config/bd.js')).default;
    // Eliminar preguntas anteriores si es la primera del lote
    if (orden === 1) {
      const [preg] = await bd.execute('SELECT id FROM preguntas WHERE curso_id = ?', [curso_id]);
      for (const p of preg) {
        await bd.execute('DELETE FROM opciones_respuesta WHERE pregunta_id = ?', [p.id]);
      }
      await bd.execute('DELETE FROM preguntas WHERE curso_id = ?', [curso_id]);
    }
    const [r] = await bd.execute('INSERT INTO preguntas (curso_id, texto, orden) VALUES (?, ?, ?)', [curso_id, texto, orden]);
    res.status(201).json({ id: r.insertId });
  } catch(e) { res.status(500).json({ mensaje: 'Error al crear pregunta' }); }
});

app.post('/api/opciones', verificarToken, soloAdmin, async (req, res) => {
  try {
    const { pregunta_id, texto, es_correcta, orden } = req.body;
    const bd = (await import('./config/bd.js')).default;
    const [r] = await bd.execute('INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (?, ?, ?, ?)', [pregunta_id, texto, es_correcta ? 1 : 0, orden]);
    res.status(201).json({ id: r.insertId });
  } catch(e) { res.status(500).json({ mensaje: 'Error al crear opcion' }); }
});

app.get('/api/salud', (_, res) => res.json({ ok: true, app: 'EduTech' }));

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ mensaje: err.message || 'Error interno' });
});

const PUERTO = process.env.PORT || 4001;
app.listen(PUERTO, () => console.log(`🎓 EduTech corriendo en http://localhost:${PUERTO}`));

// NOTA: agregar estas rutas antes del app.listen