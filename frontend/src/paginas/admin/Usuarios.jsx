// ── Usuarios.jsx ──────────────────────────────────────
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [buscar, setBuscar] = useState('');

  useEffect(() => {
    axios.get('/api/auth/usuarios').then(r => setUsuarios(r.data.usuarios || [])).finally(() => setCargando(false));
  }, []);

  const filtrados = usuarios.filter(u =>
    !buscar || u.nombre.toLowerCase().includes(buscar.toLowerCase()) || u.correo.toLowerCase().includes(buscar.toLowerCase())
  );

  const clientes = usuarios.filter(u => u.rol === 'cliente');
  const admins   = usuarios.filter(u => u.rol === 'admin');

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1000, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 4 }}>👥 Usuarios</h1>
        <p style={{ color: 'var(--text-muted)' }}>{clientes.length} clientes · {admins.length} admins</p>
      </motion.div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { icon: '👥', label: 'Total',    val: usuarios.length,   color: '#6366f1' },
          { icon: '🎓', label: 'Clientes', val: clientes.length,   color: '#10b981' },
          { icon: '👑', label: 'Admins',   val: admins.length,     color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>{s.icon}</span>
            <div>
              <p style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.val}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <input value={buscar} onChange={e => setBuscar(e.target.value)} placeholder="🔍 Buscar usuarios..."
        className="input" style={{ maxWidth: 400, marginBottom: 20 }} />

      {cargando ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[...Array(5)].map((_, i) => <div key={i} className="shimmer" style={{ height: 60, borderRadius: 10 }} />)}
        </div>
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="tabla">
              <thead>
                <tr><th>Usuario</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Registro</th></tr>
              </thead>
              <tbody>
                {filtrados.map((u, i) => (
                  <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * .03 }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                          {u.nombre?.[0]?.toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 500 }}>{u.nombre}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{u.correo}</td>
                    <td>
                      <span className={`badge ${u.rol === 'admin' ? 'badge-warning' : 'badge-primary'}`}>
                        {u.rol === 'admin' ? '👑 Admin' : '🎓 Cliente'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.esta_activo ? 'badge-success' : 'badge-danger'}`}>
                        {u.esta_activo ? '✅ Activo' : '❌ Inactivo'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      {new Date(u.creado_en).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
