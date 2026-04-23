import bd from '../config/bd.js';
import fs from 'fs';
import path from 'path';

// ── Obtener todos los cursos ──────────────────────────
export async function obtenerCursos(req, res) {
  try {
    const [cursos] = await bd.execute(`
      SELECT c.*, p.nombre AS nombre_profesor, p.especialidad,
             cat.nombre AS nombre_categoria, cat.color AS color_categoria, cat.icono AS icono_categoria,
             COALESCE(AVG(cal.estrellas), 0) AS calificacion_promedio,
             COUNT(DISTINCT cal.id) AS total_calificaciones,
             COUNT(DISTINCT i.id) AS total_inscritos,
             COUNT(DISTINCT l.id) AS total_lecciones
      FROM cursos c
      LEFT JOIN profesores p   ON p.id = c.profesor_id
      LEFT JOIN categorias cat ON cat.id = c.categoria_id
      LEFT JOIN calificaciones cal ON cal.curso_id = c.id
      LEFT JOIN inscripciones i ON i.curso_id = c.id
      LEFT JOIN lecciones l ON l.curso_id = c.id AND l.esta_activa = TRUE
      WHERE c.esta_activo = TRUE
      GROUP BY c.id
      ORDER BY c.creado_en DESC
    `);
    res.json({ cursos });
  } catch (e) {
    console.error('obtenerCursos:', e.message);
    res.status(500).json({ mensaje: 'Error al obtener cursos' });
  }
}

// ── Obtener un curso con lecciones ────────────────────
export async function obtenerCurso(req, res) {
  try {
    const { id } = req.params;
    const [c] = await bd.execute(`
      SELECT c.*, p.nombre AS nombre_profesor, p.especialidad, p.avatar_url AS avatar_profesor, p.bio AS bio_profesor,
             cat.nombre AS nombre_categoria, cat.color AS color_categoria, cat.icono AS icono_categoria,
             COALESCE(AVG(cal.estrellas), 0) AS calificacion_promedio,
             COUNT(DISTINCT cal.id) AS total_calificaciones,
             COUNT(DISTINCT i.id) AS total_inscritos
      FROM cursos c
      LEFT JOIN profesores p ON p.id = c.profesor_id
      LEFT JOIN categorias cat ON cat.id = c.categoria_id
      LEFT JOIN calificaciones cal ON cal.curso_id = c.id
      LEFT JOIN inscripciones i ON i.curso_id = c.id
      WHERE c.id = ? AND c.esta_activo = TRUE
      GROUP BY c.id
    `, [id]);
    if (!c.length) return res.status(404).json({ mensaje: 'Curso no encontrado' });

    const [lecciones] = await bd.execute(
      'SELECT * FROM lecciones WHERE curso_id = ? AND esta_activa = TRUE ORDER BY orden ASC', [id]
    );
    const [calificaciones] = await bd.execute(`
      SELECT cal.estrellas, cal.comentario, cal.creado_en, u.nombre AS nombre_usuario, u.avatar_url
      FROM calificaciones cal JOIN usuarios u ON u.id = cal.usuario_id
      WHERE cal.curso_id = ? ORDER BY cal.creado_en DESC LIMIT 20
    `, [id]);

    res.json({ curso: c[0], lecciones, calificaciones });
  } catch (e) {
    console.error('obtenerCurso:', e.message);
    res.status(500).json({ mensaje: 'Error al obtener curso' });
  }
}

// ── Crear curso (admin) ───────────────────────────────
export async function crearCurso(req, res) {
  try {
    const { nombre, descripcion, profesor_id, categoria_id, nivel } = req.body;
    if (!nombre?.trim()) return res.status(400).json({ mensaje: 'El nombre es requerido' });
    const imagen_url = req.file ? `/uploads/cursos/${req.file.filename}` : null;
    const [r] = await bd.execute(
      'INSERT INTO cursos (nombre, descripcion, profesor_id, categoria_id, nivel, imagen_url) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre.trim(), descripcion || null, profesor_id || null, categoria_id || null, nivel || 'basico', imagen_url]
    );
    res.status(201).json({ id: r.insertId, mensaje: 'Curso creado correctamente' });
  } catch (e) {
    console.error('crearCurso:', e.message);
    res.status(500).json({ mensaje: 'Error al crear curso' });
  }
}

// ── Actualizar curso (admin) ──────────────────────────
export async function actualizarCurso(req, res) {
  try {
    const { id } = req.params;
    const { nombre, descripcion, profesor_id, categoria_id, nivel } = req.body;
    const imagen_url = req.file ? `/uploads/cursos/${req.file.filename}` : null;
    let query = 'UPDATE cursos SET nombre=?, descripcion=?, profesor_id=?, categoria_id=?, nivel=?';
    let params = [nombre, descripcion || null, profesor_id || null, categoria_id || null, nivel || 'basico'];
    if (imagen_url) { query += ', imagen_url=?'; params.push(imagen_url); }
    query += ' WHERE id=?';
    params.push(id);
    await bd.execute(query, params);
    res.json({ mensaje: 'Curso actualizado' });
  } catch (e) { res.status(500).json({ mensaje: 'Error al actualizar curso' }); }
}

// ── Eliminar curso (admin) ────────────────────────────
export async function eliminarCurso(req, res) {
  try {
    await bd.execute('UPDATE cursos SET esta_activo = FALSE WHERE id = ?', [req.params.id]);
    res.json({ mensaje: 'Curso eliminado' });
  } catch (e) { res.status(500).json({ mensaje: 'Error al eliminar curso' }); }
}

// ── Lecciones ─────────────────────────────────────────
export async function crearLeccion(req, res) {
  try {
    const { curso_id, titulo, descripcion, orden, video_url_externa } = req.body;
    // Prioridad: URL externa > archivo subido
    const video_url = video_url_externa?.trim()
      ? video_url_externa.trim()
      : req.file ? `/uploads/videos/${req.file.filename}` : null;

    const duracion_seg = parseInt(req.body.duracion_seg) || 120;

    const [r] = await bd.execute(
      'INSERT INTO lecciones (curso_id, titulo, descripcion, video_url, duracion_seg, orden) VALUES (?, ?, ?, ?, ?, ?)',
      [curso_id, titulo, descripcion || null, video_url, duracion_seg, orden || 1]
    );

    // Actualizar duración total del curso
    await bd.execute(`
      UPDATE cursos SET duracion_horas = (
        SELECT ROUND(SUM(duracion_seg) / 3600, 1) FROM lecciones WHERE curso_id = ? AND esta_activa = TRUE
      ) WHERE id = ?
    `, [curso_id, curso_id]);

    res.status(201).json({ id: r.insertId, mensaje: 'Leccion creada' });
  } catch (e) {
    console.error('crearLeccion:', e.message);
    res.status(500).json({ mensaje: 'Error al crear leccion' });
  }
}

export async function actualizarLeccion(req, res) {
  try {
    const { titulo, descripcion, orden, video_url_externa } = req.body;
    const duracion_seg = parseInt(req.body.duracion_seg) || undefined;
    // Prioridad: URL externa > archivo subido
    const video_url = video_url_externa?.trim()
      ? video_url_externa.trim()
      : req.file ? `/uploads/videos/${req.file.filename}` : null;
    let query = 'UPDATE lecciones SET titulo=?, descripcion=?, orden=?';
    let params = [titulo, descripcion || null, orden || 1];
    if (duracion_seg) { query += ', duracion_seg=?'; params.push(duracion_seg); }
    if (video_url) { query += ', video_url=?'; params.push(video_url); }
    query += ' WHERE id=?'; params.push(req.params.id);
    await bd.execute(query, params);
    res.json({ mensaje: 'Leccion actualizada' });
  } catch (e) { res.status(500).json({ mensaje: 'Error al actualizar leccion' }); }
}

export async function eliminarLeccion(req, res) {
  try {
    await bd.execute('UPDATE lecciones SET esta_activa = FALSE WHERE id = ?', [req.params.id]);
    res.json({ mensaje: 'Leccion eliminada' });
  } catch (e) { res.status(500).json({ mensaje: 'Error al eliminar leccion' }); }
}

// ── Profesores ────────────────────────────────────────
export async function obtenerProfesores(req, res) {
  try {
    const [profesores] = await bd.execute(`
      SELECT p.*, COUNT(c.id) AS total_cursos
      FROM profesores p LEFT JOIN cursos c ON c.profesor_id = p.id AND c.esta_activo = TRUE
      WHERE p.esta_activo = TRUE GROUP BY p.id ORDER BY p.nombre
    `);
    res.json({ profesores });
  } catch (e) { res.status(500).json({ mensaje: 'Error al obtener profesores' }); }
}

export async function crearProfesor(req, res) {
  try {
    const { nombre, correo, especialidad, bio } = req.body;
    if (!nombre?.trim() || !correo?.trim() || !especialidad?.trim())
      return res.status(400).json({ mensaje: 'Nombre, correo y especialidad son requeridos' });
    const avatar_url = req.file ? `/uploads/avatares/${req.file.filename}` : null;
    const [r] = await bd.execute(
      'INSERT INTO profesores (nombre, correo, especialidad, bio, avatar_url) VALUES (?, ?, ?, ?, ?)',
      [nombre.trim(), correo.toLowerCase().trim(), especialidad.trim(), bio || null, avatar_url]
    );
    res.status(201).json({ id: r.insertId, mensaje: 'Profesor creado' });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ mensaje: 'El correo ya esta registrado' });
    res.status(500).json({ mensaje: 'Error al crear profesor' });
  }
}

export async function actualizarProfesor(req, res) {
  try {
    const { nombre, correo, especialidad, bio } = req.body;
    const avatar_url = req.file ? `/uploads/avatares/${req.file.filename}` : null;
    let query = 'UPDATE profesores SET nombre=?, correo=?, especialidad=?, bio=?';
    let params = [nombre, correo, especialidad, bio || null];
    if (avatar_url) { query += ', avatar_url=?'; params.push(avatar_url); }
    query += ' WHERE id=?'; params.push(req.params.id);
    await bd.execute(query, params);
    res.json({ mensaje: 'Profesor actualizado' });
  } catch (e) { res.status(500).json({ mensaje: 'Error al actualizar profesor' }); }
}

export async function eliminarProfesor(req, res) {
  try {
    await bd.execute('UPDATE profesores SET esta_activo = FALSE WHERE id = ?', [req.params.id]);
    res.json({ mensaje: 'Profesor eliminado' });
  } catch (e) { res.status(500).json({ mensaje: 'Error al eliminar profesor' }); }
}

// ── Categorias ────────────────────────────────────────
export async function obtenerCategorias(req, res) {
  try {
    const [categorias] = await bd.execute('SELECT * FROM categorias ORDER BY nombre');
    res.json({ categorias });
  } catch (e) { res.status(500).json({ mensaje: 'Error al obtener categorias' }); }
}

// ── Estadisticas admin ────────────────────────────────
export async function obtenerEstadisticas(req, res) {
  try {
    const [[{ total_cursos }]]   = await bd.execute('SELECT COUNT(*) AS total_cursos FROM cursos WHERE esta_activo=TRUE');
    const [[{ total_usuarios }]] = await bd.execute("SELECT COUNT(*) AS total_usuarios FROM usuarios WHERE rol='cliente'");
    const [[{ total_inscritos }]]= await bd.execute('SELECT COUNT(*) AS total_inscritos FROM inscripciones');
    const [[{ total_completados}]]= await bd.execute('SELECT COUNT(*) AS total_completados FROM inscripciones WHERE completado=TRUE');
    const [cursos_populares] = await bd.execute(`
      SELECT c.nombre, c.imagen_url, COUNT(i.id) AS inscritos,
             COALESCE(AVG(cal.estrellas),0) AS promedio
      FROM cursos c
      LEFT JOIN inscripciones i ON i.curso_id = c.id
      LEFT JOIN calificaciones cal ON cal.curso_id = c.id
      WHERE c.esta_activo = TRUE
      GROUP BY c.id ORDER BY inscritos DESC LIMIT 6
    `);
    const [visualizaciones] = await bd.execute(`
      SELECT l.titulo, c.nombre AS curso, COUNT(pl.id) AS vistas
      FROM progreso_lecciones pl
      JOIN lecciones l ON l.id = pl.leccion_id
      JOIN cursos c ON c.id = l.curso_id
      GROUP BY l.id ORDER BY vistas DESC LIMIT 10
    `);
    res.json({ total_cursos, total_usuarios, total_inscritos, total_completados, cursos_populares, visualizaciones });
  } catch (e) {
    console.error('estadisticas:', e.message);
    res.status(500).json({ mensaje: 'Error al obtener estadisticas' });
  }
}