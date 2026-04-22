import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function Recuperar() {
  const [correo, setCorreo] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const enviar = async e => {
    e.preventDefault();
    setCargando(true); setError('');
    try {
      await axios.post('/api/auth/recuperar', { correo });
      setEnviado(true);
    } catch { setError('Error al enviar el correo'); }
    finally { setCargando(false); }
  };

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: 24 }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🔐</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Recuperar contraseña</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>

        {enviado ? (
          <motion.div initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: 'center', padding: 32, background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.3)', borderRadius: 16 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📧</div>
            <p style={{ color: 'var(--success)', fontWeight: 600, marginBottom: 8 }}>¡Correo enviado!</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Revisa tu bandeja de entrada y sigue las instrucciones.</p>
            <Link to="/login" className="btn btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>
              Volver al inicio
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={enviar} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="input-group">
              <label className="input-label">Correo electrónico</label>
              <input type="email" value={correo} onChange={e => setCorreo(e.target.value)} required
                placeholder="tu@correo.com" className="input" style={{ fontSize: 16 }} />
            </div>
            {error && <p style={{ color: 'var(--danger)', fontSize: 14 }}>⚠️ {error}</p>}
            <button type="submit" disabled={cargando} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              {cargando ? 'Enviando...' : '📨 Enviar enlace'}
            </button>
            <Link to="/login" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, textDecoration: 'none' }}>
              ← Volver al inicio de sesión
            </Link>
          </form>
        )}
      </motion.div>
    </div>
  );
}
