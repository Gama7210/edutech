import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bd from '../config/bd.js';

const correo = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

function generarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, correo: usuario.correo, rol: usuario.rol, nombre: usuario.nombre },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// ── Registro ──────────────────────────────────────────
export async function registrar(req, res) {
  try {
    const { nombre, correo: email, contrasena } = req.body;
    if (!nombre?.trim() || !email?.trim() || !contrasena)
      return res.status(400).json({ mensaje: 'Todos los campos son requeridos' });

    const [existe] = await bd.execute('SELECT id FROM usuarios WHERE correo = ?', [email]);
    if (existe.length) return res.status(409).json({ mensaje: 'El correo ya esta registrado' });

    const hash = await bcrypt.hash(contrasena, 12);
    const [r] = await bd.execute(
      'INSERT INTO usuarios (nombre, correo, contrasena_hash) VALUES (?, ?, ?)',
      [nombre.trim(), email.toLowerCase().trim(), hash]
    );

    const usuario = { id: r.insertId, nombre: nombre.trim(), correo: email.toLowerCase().trim(), rol: 'cliente' };
    res.status(201).json({ token: generarToken(usuario), usuario });
  } catch (e) {
    console.error('registrar:', e.message);
    res.status(500).json({ mensaje: 'Error al registrar' });
  }
}

// ── Login ─────────────────────────────────────────────
export async function iniciarSesion(req, res) {
  try {
    const { correo: email, contrasena } = req.body;
    const [u] = await bd.execute(
      'SELECT id, nombre, correo, contrasena_hash, rol, avatar_url, tema FROM usuarios WHERE correo = ? AND esta_activo = TRUE',
      [email?.toLowerCase().trim()]
    );
    if (!u.length) return res.status(401).json({ mensaje: 'Correo o contrasena incorrectos' });
    if (!await bcrypt.compare(contrasena, u[0].contrasena_hash))
      return res.status(401).json({ mensaje: 'Correo o contrasena incorrectos' });

    await bd.execute('UPDATE usuarios SET actualizado_en = NOW() WHERE id = ?', [u[0].id]);
    const { contrasena_hash, ...usuario } = u[0];
    res.json({ token: generarToken(usuario), usuario });
  } catch (e) {
    console.error('login:', e.message);
    res.status(500).json({ mensaje: 'Error al iniciar sesion' });
  }
}

// ── Perfil ────────────────────────────────────────────
export async function obtenerPerfil(req, res) {
  try {
    const [u] = await bd.execute(
      'SELECT id, nombre, correo, avatar_url, tema, rol, creado_en FROM usuarios WHERE id = ?',
      [req.usuario.id]
    );
    if (!u.length) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json({ usuario: u[0] });
  } catch (e) { res.status(500).json({ mensaje: 'Error al obtener perfil' }); }
}

// ── Actualizar perfil ─────────────────────────────────
export async function actualizarPerfil(req, res) {
  try {
    const { nombre, tema } = req.body;

    let query = 'UPDATE usuarios SET nombre = ?, tema = ?';
    let params = [nombre || req.usuario.nombre, tema || 'oscuro'];

    // Guardar foto como base64 en BD (Render no tiene almacenamiento persistente)
    if (req.file) {
      const base64 = `data:${req.file.mimetype};base64,${req.file.buffer?.toString('base64') || ''}`;
      // Leer el archivo del disco si buffer no está disponible
      let avatar_data = base64;
      if (!req.file.buffer) {
        const fs = await import('fs');
        const buf = fs.readFileSync(req.file.path);
        avatar_data = `data:${req.file.mimetype};base64,${buf.toString('base64')}`;
        // Borrar archivo temporal
        try { fs.unlinkSync(req.file.path); } catch(e) {}
      }
      query += ', avatar_url = ?';
      params.push(avatar_data);
    }

    query += ' WHERE id = ?';
    params.push(req.usuario.id);

    await bd.execute(query, params);
    const [u] = await bd.execute('SELECT id, nombre, correo, avatar_url, tema, rol FROM usuarios WHERE id = ?', [req.usuario.id]);
    res.json({ usuario: u[0] });
  } catch (e) {
    console.error('actualizarPerfil:', e.message);
    res.status(500).json({ mensaje: 'Error al actualizar perfil' });
  }
}

// ── Cambiar contrasena ────────────────────────────────
export async function cambiarContrasena(req, res) {
  try {
    const { contrasena_actual, nueva_contrasena } = req.body;
    const [u] = await bd.execute('SELECT contrasena_hash FROM usuarios WHERE id = ?', [req.usuario.id]);
    if (!await bcrypt.compare(contrasena_actual, u[0].contrasena_hash))
      return res.status(401).json({ mensaje: 'Contrasena actual incorrecta' });
    const hash = await bcrypt.hash(nueva_contrasena, 12);
    await bd.execute('UPDATE usuarios SET contrasena_hash = ? WHERE id = ?', [hash, req.usuario.id]);
    res.json({ mensaje: 'Contrasena actualizada correctamente' });
  } catch (e) { res.status(500).json({ mensaje: 'Error al cambiar contrasena' }); }
}

// ── Recuperar contrasena ──────────────────────────────
export async function solicitarRecuperacion(req, res) {
  try {
    const { correo: email } = req.body;
    const [u] = await bd.execute('SELECT id, nombre FROM usuarios WHERE correo = ?', [email]);
    if (!u.length) return res.json({ mensaje: 'Si el correo existe, recibiras un enlace' });

    const token = crypto.randomBytes(32).toString('hex');
    const expira = new Date(Date.now() + 3600000);
    await bd.execute('DELETE FROM recuperacion_contrasena WHERE usuario_id = ?', [u[0].id]);
    await bd.execute('INSERT INTO recuperacion_contrasena (usuario_id, token, expira_en) VALUES (?, ?, ?)',
      [u[0].id, token, expira]);

    const link = `${process.env.CLIENT_URL}/restablecer/${token}`;
    await correo.sendMail({
      from: `"EduTech" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Recuperacion de contrasena — EduTech',
      html: `<div style="font-family:Arial;max-width:500px;margin:0 auto;padding:32px;background:#0f172a;color:#fff;border-radius:12px">
        <h2 style="color:#6366f1">🎓 EduTech</h2>
        <p>Hola <strong>${u[0].nombre}</strong>,</p>
        <p>Recibimos una solicitud para restablecer tu contrasena.</p>
        <a href="${link}" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">Restablecer contrasena</a>
        <p style="color:#94a3b8;font-size:13px">Este enlace expira en 1 hora.</p>
      </div>`,
    });
    res.json({ mensaje: 'Si el correo existe, recibiras un enlace' });
  } catch (e) { res.status(500).json({ mensaje: 'Error al enviar correo' }); }
}

// ── Restablecer contrasena ────────────────────────────
export async function restablecerContrasena(req, res) {
  try {
    const { token, nueva_contrasena } = req.body;
    const [r] = await bd.execute(
      'SELECT usuario_id FROM recuperacion_contrasena WHERE token = ? AND expira_en > NOW() AND usado = FALSE',
      [token]
    );
    if (!r.length) return res.status(400).json({ mensaje: 'Token invalido o expirado' });
    const hash = await bcrypt.hash(nueva_contrasena, 12);
    await bd.execute('UPDATE usuarios SET contrasena_hash = ? WHERE id = ?', [hash, r[0].usuario_id]);
    await bd.execute('UPDATE recuperacion_contrasena SET usado = TRUE WHERE token = ?', [token]);
    res.json({ mensaje: 'Contrasena restablecida correctamente' });
  } catch (e) { res.status(500).json({ mensaje: 'Error al restablecer contrasena' }); }
}

// ── Obtener usuarios (admin) ──────────────────────────
export async function obtenerUsuarios(req, res) {
  try {
    const [usuarios] = await bd.execute(
      'SELECT id, nombre, correo, rol, esta_activo, creado_en FROM usuarios ORDER BY creado_en DESC'
    );
    res.json({ usuarios });
  } catch (e) { res.status(500).json({ mensaje: 'Error al obtener usuarios' }); }
}