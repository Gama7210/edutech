import bd from '../config/bd.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';

// ── Inscribirse a un curso ────────────────────────────
export async function inscribirse(req, res) {
  try {
    const { curso_id } = req.body;
    const [existe] = await bd.execute(
      'SELECT id FROM inscripciones WHERE usuario_id = ? AND curso_id = ?',
      [req.usuario.id, curso_id]
    );
    if (existe.length) return res.json({ mensaje: 'Ya estas inscrito en este curso', inscrito: true });

    await bd.execute('INSERT INTO inscripciones (usuario_id, curso_id) VALUES (?, ?)',
      [req.usuario.id, curso_id]);
    res.status(201).json({ mensaje: 'Inscripcion exitosa', inscrito: true });
  } catch (e) {
    console.error('inscribirse:', e.message);
    res.status(500).json({ mensaje: 'Error al inscribirse' });
  }
}

// ── Mis cursos inscritos ──────────────────────────────
export async function misCursos(req, res) {
  try {
    const [cursos] = await bd.execute(`
      SELECT c.id, c.nombre, c.descripcion, c.imagen_url, c.nivel,
             p.nombre AS nombre_profesor, cat.nombre AS nombre_categoria, cat.color,
             i.completado, i.fecha_inscripcion, i.fecha_completado,
             COUNT(DISTINCT l.id) AS total_lecciones,
             COUNT(DISTINCT pl.id) AS lecciones_completadas
      FROM inscripciones i
      JOIN cursos c ON c.id = i.curso_id
      LEFT JOIN profesores p ON p.id = c.profesor_id
      LEFT JOIN categorias cat ON cat.id = c.categoria_id
      LEFT JOIN lecciones l ON l.curso_id = c.id AND l.esta_activa = TRUE
      LEFT JOIN progreso_lecciones pl ON pl.leccion_id = l.id AND pl.usuario_id = ? AND pl.completada = TRUE
      WHERE i.usuario_id = ?
      GROUP BY c.id, i.id
      ORDER BY i.fecha_inscripcion DESC
    `, [req.usuario.id, req.usuario.id]);
    res.json({ cursos });
  } catch (e) {
    console.error('misCursos:', e.message);
    res.status(500).json({ mensaje: 'Error al obtener cursos' });
  }
}

// ── Marcar leccion como completada ────────────────────
export async function completarLeccion(req, res) {
  try {
    const { leccion_id, segundos_vistos } = req.body;

    // Verificar que la leccion anterior este completada (no puede saltarse)
    const [leccion] = await bd.execute('SELECT curso_id, orden FROM lecciones WHERE id = ?', [leccion_id]);
    if (!leccion.length) return res.status(404).json({ mensaje: 'Leccion no encontrada' });

    if (leccion[0].orden > 1) {
      const [anterior] = await bd.execute(
        'SELECT id FROM lecciones WHERE curso_id = ? AND orden = ?',
        [leccion[0].curso_id, leccion[0].orden - 1]
      );
      if (anterior.length) {
        const [progAnterior] = await bd.execute(
          'SELECT id FROM progreso_lecciones WHERE usuario_id = ? AND leccion_id = ? AND completada = TRUE',
          [req.usuario.id, anterior[0].id]
        );
        if (!progAnterior.length)
          return res.status(400).json({ mensaje: 'Debes completar la leccion anterior primero' });
      }
    }

    await bd.execute(`
      INSERT INTO progreso_lecciones (usuario_id, leccion_id, completada, segundos_vistos, fecha_completada)
      VALUES (?, ?, TRUE, ?, NOW())
      ON DUPLICATE KEY UPDATE completada=TRUE, segundos_vistos=VALUES(segundos_vistos), fecha_completada=NOW()
    `, [req.usuario.id, leccion_id, segundos_vistos || 0]);

    // Verificar si completó todas las lecciones del curso
    const [totalLecciones] = await bd.execute(
      'SELECT COUNT(*) AS total FROM lecciones WHERE curso_id = ? AND esta_activa = TRUE',
      [leccion[0].curso_id]
    );
    const [completadas] = await bd.execute(`
      SELECT COUNT(*) AS total FROM progreso_lecciones pl
      JOIN lecciones l ON l.id = pl.leccion_id
      WHERE pl.usuario_id = ? AND l.curso_id = ? AND pl.completada = TRUE
    `, [req.usuario.id, leccion[0].curso_id]);

    const cursoCompleto = totalLecciones[0].total > 0 &&
      completadas[0].total >= totalLecciones[0].total;

    if (cursoCompleto) {
      await bd.execute(
        'UPDATE inscripciones SET completado = TRUE, fecha_completado = NOW() WHERE usuario_id = ? AND curso_id = ?',
        [req.usuario.id, leccion[0].curso_id]
      );
    }

    res.json({ mensaje: 'Leccion completada', curso_completado: cursoCompleto });
  } catch (e) {
    console.error('completarLeccion:', e.message);
    res.status(500).json({ mensaje: 'Error al completar leccion' });
  }
}

// ── Obtener progreso de un curso ──────────────────────
export async function obtenerProgreso(req, res) {
  try {
    const { curso_id } = req.params;
    const [progreso] = await bd.execute(`
      SELECT l.id, l.titulo, l.orden, l.duracion_seg, l.video_url,
             pl.completada, pl.segundos_vistos
      FROM lecciones l
      LEFT JOIN progreso_lecciones pl ON pl.leccion_id = l.id AND pl.usuario_id = ?
      WHERE l.curso_id = ? AND l.esta_activa = TRUE
      ORDER BY l.orden ASC
    `, [req.usuario.id, curso_id]);

    const [inscripcion] = await bd.execute(
      'SELECT completado FROM inscripciones WHERE usuario_id = ? AND curso_id = ?',
      [req.usuario.id, curso_id]
    );

    res.json({ progreso, completado: inscripcion[0]?.completado || false });
  } catch (e) {
    console.error('obtenerProgreso:', e.message);
    res.status(500).json({ mensaje: 'Error al obtener progreso' });
  }
}

// ── Obtener preguntas del cuestionario ────────────────
export async function obtenerCuestionario(req, res) {
  try {
    const { curso_id } = req.params;

    // Verificar que el curso esté completado
    const [insc] = await bd.execute(
      'SELECT completado FROM inscripciones WHERE usuario_id = ? AND curso_id = ?',
      [req.usuario.id, curso_id]
    );
    if (!insc.length || !insc[0].completado)
      return res.status(403).json({ mensaje: 'Debes completar todas las lecciones primero' });

    const [preguntas] = await bd.execute(
      'SELECT id, texto, orden FROM preguntas WHERE curso_id = ? ORDER BY orden ASC', [curso_id]
    );
    for (const p of preguntas) {
      const [opciones] = await bd.execute(
        'SELECT id, texto, orden FROM opciones_respuesta WHERE pregunta_id = ? ORDER BY orden ASC', [p.id]
      );
      p.opciones = opciones;
    }
    res.json({ preguntas });
  } catch (e) {
    console.error('obtenerCuestionario:', e.message);
    res.status(500).json({ mensaje: 'Error al obtener cuestionario' });
  }
}

// ── Enviar respuestas y generar PDF ───────────────────
export async function enviarRespuestas(req, res) {
  try {
    const { curso_id, respuestas } = req.body;
    // respuestas: [{ pregunta_id, opcion_elegida_id }]

    // Verificar respuestas
    let correctas = 0;
    const resultados = [];

    for (const r of respuestas) {
      const [opcion] = await bd.execute(
        'SELECT es_correcta, texto FROM opciones_respuesta WHERE id = ?', [r.opcion_elegida_id]
      );
      const [pregunta] = await bd.execute('SELECT texto FROM preguntas WHERE id = ?', [r.pregunta_id]);
      const [opcionCorrecta] = await bd.execute(
        'SELECT texto FROM opciones_respuesta WHERE pregunta_id = ? AND es_correcta = TRUE', [r.pregunta_id]
      );

      const esCorrecta = opcion[0]?.es_correcta || false;
      if (esCorrecta) correctas++;

      resultados.push({
        pregunta: pregunta[0]?.texto || '',
        respuesta_usuario: opcion[0]?.texto || '',
        respuesta_correcta: opcionCorrecta[0]?.texto || '',
        es_correcta: esCorrecta,
      });
    }

    const total = respuestas.length;
    const calificacion = total > 0 ? Math.round((correctas / total) * 100) : 0;

    // Guardar intento
    const [intento] = await bd.execute(
      'INSERT INTO intentos_cuestionario (usuario_id, curso_id, calificacion, total_preguntas, correctas) VALUES (?, ?, ?, ?, ?)',
      [req.usuario.id, curso_id, calificacion, total, correctas]
    );

    for (const r of respuestas) {
      const [op] = await bd.execute('SELECT es_correcta FROM opciones_respuesta WHERE id = ?', [r.opcion_elegida_id]);
      await bd.execute(
        'INSERT INTO respuestas_usuario (intento_id, pregunta_id, opcion_elegida_id, es_correcta) VALUES (?, ?, ?, ?)',
        [intento.insertId, r.pregunta_id, r.opcion_elegida_id, op[0]?.es_correcta || false]
      );
    }

    // Obtener datos del usuario y curso
    const [usuario] = await bd.execute('SELECT nombre FROM usuarios WHERE id = ?', [req.usuario.id]);
    const [curso] = await bd.execute('SELECT nombre FROM cursos WHERE id = ?', [curso_id]);

    // Generar PDF de resultados
    const pdfResultados = await generarPDFResultados({
      usuario: usuario[0].nombre,
      curso: curso[0].nombre,
      calificacion,
      correctas,
      total,
      resultados,
    });

    await bd.execute('UPDATE intentos_cuestionario SET pdf_url = ? WHERE id = ?',
      [pdfResultados, intento.insertId]);

    // Generar certificado si aprueba (calificacion >= 70)
    let certificado_url = null;
    if (calificacion >= 70) {
      const folio = `EDT-${Date.now()}-${req.usuario.id}`;
      certificado_url = await generarCertificado({
        usuario: usuario[0].nombre,
        curso: curso[0].nombre,
        calificacion,
        folio,
        fecha: new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }),
      });

      await bd.execute(`
        INSERT INTO certificados (usuario_id, curso_id, folio, pdf_url, calificacion)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE folio=VALUES(folio), pdf_url=VALUES(pdf_url), calificacion=VALUES(calificacion)
      `, [req.usuario.id, curso_id, folio, certificado_url, calificacion]);
    }

    res.json({
      calificacion,
      correctas,
      total,
      aprobado: calificacion >= 70,
      pdf_resultados: pdfResultados,
      certificado_url,
      resultados,
    });
  } catch (e) {
    console.error('enviarRespuestas:', e.message);
    res.status(500).json({ mensaje: 'Error al procesar respuestas' });
  }
}

// ── Calificar curso ───────────────────────────────────
export async function calificarCurso(req, res) {
  try {
    const { curso_id, estrellas, comentario } = req.body;
    if (!estrellas || estrellas < 1 || estrellas > 5)
      return res.status(400).json({ mensaje: 'La calificacion debe ser entre 1 y 5 estrellas' });
    if (!comentario?.trim())
      return res.status(400).json({ mensaje: 'El comentario es obligatorio' });

    await bd.execute(`
      INSERT INTO calificaciones (usuario_id, curso_id, estrellas, comentario)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE estrellas=VALUES(estrellas), comentario=VALUES(comentario)
    `, [req.usuario.id, curso_id, estrellas, comentario.trim()]);

    res.json({ mensaje: 'Calificacion guardada correctamente' });
  } catch (e) {
    console.error('calificarCurso:', e.message);
    res.status(500).json({ mensaje: 'Error al calificar curso' });
  }
}

// ── Mis certificados ──────────────────────────────────
export async function misCertificados(req, res) {
  try {
    const [certificados] = await bd.execute(`
      SELECT cert.*, c.nombre AS nombre_curso, c.imagen_url AS imagen_curso,
             p.nombre AS nombre_profesor
      FROM certificados cert
      JOIN cursos c ON c.id = cert.curso_id
      LEFT JOIN profesores p ON p.id = c.profesor_id
      WHERE cert.usuario_id = ?
      ORDER BY cert.fecha_emision DESC
    `, [req.usuario.id]);
    res.json({ certificados });
  } catch (e) { res.status(500).json({ mensaje: 'Error al obtener certificados' }); }
}

// ── GENERAR PDF DE RESULTADOS ─────────────────────────
async function generarPDFResultados({ usuario, curso, calificacion, correctas, total, resultados }) {
  return new Promise((resolve, reject) => {
    const nombre_archivo = `resultados_${uuid()}.pdf`;
    const ruta = path.join(process.cwd(), 'uploads', 'pdfs', nombre_archivo);
    fs.mkdirSync(path.dirname(ruta), { recursive: true });

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = fs.createWriteStream(ruta);
    doc.pipe(stream);

    // Fondo
    doc.rect(0, 0, 595, 842).fill('#0f172a');

    // Header
    doc.rect(0, 0, 595, 120).fill('#6366f1');
    doc.fillColor('#ffffff').fontSize(28).font('Helvetica-Bold')
       .text('EduTech', 50, 30);
    doc.fontSize(14).font('Helvetica')
       .text('Resultados del Cuestionario', 50, 65);

    // Info
    doc.fillColor('#e2e8f0').fontSize(13).font('Helvetica-Bold')
       .text(`Alumno: ${usuario}`, 50, 140);
    doc.fontSize(12).font('Helvetica')
       .text(`Curso: ${curso}`, 50, 162)
       .text(`Fecha: ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}`, 50, 180);

    // Calificacion
    const color_cal = calificacion >= 70 ? '#10b981' : '#ef4444';
    doc.roundedRect(370, 135, 175, 60, 8).fill(color_cal);
    doc.fillColor('#ffffff').fontSize(32).font('Helvetica-Bold')
       .text(`${calificacion}%`, 370, 148, { width: 175, align: 'center' });
    doc.fontSize(11).font('Helvetica')
       .text(`${correctas} de ${total} correctas`, 370, 182, { width: 175, align: 'center' });

    doc.moveTo(50, 215).lineTo(545, 215).strokeColor('#334155').lineWidth(1).stroke();

    // Resultados
    let y = 230;
    resultados.forEach((r, i) => {
      if (y > 750) { doc.addPage(); doc.rect(0, 0, 595, 842).fill('#0f172a'); y = 50; }
      const bg = r.es_correcta ? '#064e3b' : '#450a0a';
      const icon = r.es_correcta ? '✓' : '✗';
      const iconColor = r.es_correcta ? '#10b981' : '#ef4444';

      doc.roundedRect(50, y, 495, 70, 6).fill(bg);
      doc.fillColor(iconColor).fontSize(18).font('Helvetica-Bold')
         .text(icon, 60, y + 25);
      doc.fillColor('#e2e8f0').fontSize(11).font('Helvetica-Bold')
         .text(`${i + 1}. ${r.pregunta}`, 85, y + 8, { width: 450 });
      doc.fillColor('#94a3b8').fontSize(10).font('Helvetica')
         .text(`Tu respuesta: ${r.respuesta_usuario}`, 85, y + 30, { width: 200 });
      if (!r.es_correcta) {
        doc.fillColor('#10b981').fontSize(10)
           .text(`Correcta: ${r.respuesta_correcta}`, 290, y + 30, { width: 240 });
      }
      y += 80;
    });

    // Footer
    doc.fillColor('#475569').fontSize(10).font('Helvetica')
       .text('EduTech — Plataforma de Educacion en Linea', 50, 800, { align: 'center', width: 495 });

    doc.end();
    stream.on('finish', () => resolve(`/uploads/pdfs/${nombre_archivo}`));
    stream.on('error', reject);
  });
}

// ── GENERAR CERTIFICADO PDF ───────────────────────────
async function generarCertificado({ usuario, curso, calificacion, folio, fecha }) {
  return new Promise((resolve, reject) => {
    const nombre_archivo = `certificado_${uuid()}.pdf`;
    const ruta = path.join(process.cwd(), 'uploads', 'pdfs', nombre_archivo);
    fs.mkdirSync(path.dirname(ruta), { recursive: true });

    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 });
    const stream = fs.createWriteStream(ruta);
    doc.pipe(stream);

    const W = 841, H = 595;

    // Fondo degradado
    doc.rect(0, 0, W, H).fill('#0f172a');
    doc.rect(0, 0, W, 8).fill('#6366f1');
    doc.rect(0, H - 8, W, 8).fill('#6366f1');
    doc.rect(0, 0, 8, H).fill('#6366f1');
    doc.rect(W - 8, 0, 8, H).fill('#6366f1');

    // Decoracion
    doc.circle(100, 100, 150).fillOpacity(0.05).fill('#6366f1').fillOpacity(1);
    doc.circle(W - 100, H - 100, 150).fillOpacity(0.05).fill('#6366f1').fillOpacity(1);

    // Logo/titulo
    doc.fillColor('#6366f1').fontSize(42).font('Helvetica-Bold')
       .text('EduTech', 0, 60, { align: 'center', width: W });
    doc.fillColor('#94a3b8').fontSize(14).font('Helvetica')
       .text('PLATAFORMA DE EDUCACION EN LINEA', 0, 110, { align: 'center', width: W, characterSpacing: 3 });

    // Linea decorativa
    doc.moveTo(200, 140).lineTo(W - 200, 140).strokeColor('#6366f1').lineWidth(2).stroke();

    // Texto principal
    doc.fillColor('#94a3b8').fontSize(16).font('Helvetica')
       .text('Este certificado se otorga a', 0, 165, { align: 'center', width: W });
    doc.fillColor('#ffffff').fontSize(38).font('Helvetica-Bold')
       .text(usuario, 0, 195, { align: 'center', width: W });

    doc.moveTo(200, 248).lineTo(W - 200, 248).strokeColor('#334155').lineWidth(1).stroke();

    doc.fillColor('#94a3b8').fontSize(14).font('Helvetica')
       .text('Por haber completado satisfactoriamente el curso', 0, 265, { align: 'center', width: W });
    doc.fillColor('#6366f1').fontSize(26).font('Helvetica-Bold')
       .text(curso, 0, 295, { align: 'center', width: W });

    // Calificacion
    doc.roundedRect(W / 2 - 80, 340, 160, 55, 8).fill('#1e293b');
    doc.fillColor('#10b981').fontSize(28).font('Helvetica-Bold')
       .text(`${calificacion}%`, W / 2 - 80, 352, { width: 160, align: 'center' });
    doc.fillColor('#64748b').fontSize(11)
       .text('Calificacion Final', W / 2 - 80, 380, { width: 160, align: 'center' });

    // Fecha y folio
    doc.fillColor('#475569').fontSize(12).font('Helvetica')
       .text(`Fecha de emision: ${fecha}`, 80, 435)
       .text(`Folio: ${folio}`, 80, 455);

    // Firma
    doc.moveTo(W - 250, 450).lineTo(W - 80, 450).strokeColor('#475569').lineWidth(1).stroke();
    doc.fillColor('#94a3b8').fontSize(12)
       .text('Director Academico', W - 250, 458, { width: 170, align: 'center' });
    doc.fillColor('#64748b').fontSize(10)
       .text('EduTech', W - 250, 473, { width: 170, align: 'center' });

    doc.end();
    stream.on('finish', () => resolve(`/uploads/pdfs/${nombre_archivo}`));
    stream.on('error', reject);
  });
}
