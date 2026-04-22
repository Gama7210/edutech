import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function Restablecer() {
  const { token } = useParams();
  const navegar = useNavigate();
  const [form, setForm] = useState({ nueva: '', confirmar: '' });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);

  const enviar = async e => {
    e.preventDefault();
    if (form.nueva !== form.confirmar) { setError('Las contraseñas no coinciden'); return; }
    setCargando(true); setError('');
    try {
      await axios.post('/api/auth/restablecer', { token, nueva_contrasena: form.nueva });
      setOk(true);
      setTimeout(() => navegar('/login'), 2500);
    } catch (e) {
      setError(e.response?.data?.mensaje || 'Token inválido o expirado');
    } finally { setCargando(false); }
  };

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: 24 }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🔑</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Nueva contraseña</h1>
        </div>

        {ok ? (
          <div style={{ textAlign: 'center', padding: 32, background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.3)', borderRadius: 16 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <p style={{ color: 'var(--success)', fontWeight: 600 }}>¡Contraseña actualizada!</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8 }}>Redirigiendo al inicio de sesión...</p>
          </div>
        ) : (
          <form onSubmit={enviar} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="input-group">
              <label className="input-label">Nueva contraseña</label>
              <input type="password" value={form.nueva} onChange={e => setForm(f => ({ ...f, nueva: e.target.value }))}
                required minLength={6} placeholder="••••••••" className="input" style={{ fontSize: 16 }} />
            </div>
            <div className="input-group">
              <label className="input-label">Confirmar contraseña</label>
              <input type="password" value={form.confirmar} onChange={e => setForm(f => ({ ...f, confirmar: e.target.value }))}
                required placeholder="••••••••" className="input" style={{ fontSize: 16 }} />
            </div>
            {error && <p style={{ color: 'var(--danger)', fontSize: 14 }}>⚠️ {error}</p>}
            <button type="submit" disabled={cargando} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              {cargando ? 'Guardando...' : '🔐 Guardar contraseña'}
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
