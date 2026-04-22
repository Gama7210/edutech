import jwt from 'jsonwebtoken';

export function verificarToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ mensaje: 'Token requerido' });
  try {
    req.usuario = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ mensaje: 'Token invalido o expirado' });
  }
}

export function soloAdmin(req, res, next) {
  if (req.usuario?.rol !== 'admin') return res.status(403).json({ mensaje: 'Acceso solo para administradores' });
  next();
}
