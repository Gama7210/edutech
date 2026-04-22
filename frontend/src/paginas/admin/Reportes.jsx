import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function AdminReportes() {
  const [stats, setStats] = useState(null);
  const [cursos, setCursos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([axios.get('/api/cursos/estadisticas'), axios.get('/api/cursos')])
      .then(([r1, r2]) => { setStats(r1.data); setCursos(r2.data.cursos || []); })
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return (
    <div style={{ padding: 32 }}>
      {[...Array(3)].map((_, i) => <div key={i} className="shimmer" style={{ height: 100, borderRadius: 16, marginBottom: 16 }} />)}
    </div>
  );

  const tasaComplecion = stats.total_inscritos > 0
    ? Math.round((stats.total_completados / stats.total_inscritos) * 100)
    : 0;

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1100, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 4 }}>📈 Reportes y estadísticas</h1>
        <p style={{ color: 'var(--text-muted)' }}>Rendimiento general de la plataforma</p>
      </motion.div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { icon: '📚', label: 'Cursos activos',    val: stats.total_cursos,     color: '#6366f1' },
          { icon: '👥', label: 'Usuarios',           val: stats.total_usuarios,   color: '#10b981' },
          { icon: '📋', label: 'Inscripciones',      val: stats.total_inscritos,  color: '#f59e0b' },
          { icon: '✅', label: 'Completados',        val: stats.total_completados,color: '#ec4899' },
          { icon: '📊', label: 'Tasa de completado', val: `${tasaComplecion}%`,   color: '#0ea5e9' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * .06 }}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 22px' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
            <p style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{s.val}</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Cursos más populares */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2 }}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>🔥 Cursos más populares</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(stats.cursos_populares || []).map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `${['#6366f1','#10b981','#f59e0b','#ef4444','#ec4899'][i]}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: ['#6366f1','#10b981','#f59e0b','#ef4444','#ec4899'][i], flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500 }} className="truncar">{c.nombre}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>👥 {c.inscritos} · ⭐ {parseFloat(c.promedio).toFixed(1)}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .25 }}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>👁️ Lecciones más vistas</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(stats.visualizaciones || []).slice(0, 6).map((v, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16 }}>📹</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500 }} className="truncar">{v.titulo}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v.curso} · {v.vistas} vistas</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Tabla calificaciones por curso */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .3 }}
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>⭐ Calificaciones por curso</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="tabla">
            <thead>
              <tr><th>Curso</th><th>Nivel</th><th>Inscritos</th><th>Calificación promedio</th><th>Total reseñas</th></tr>
            </thead>
            <tbody>
              {cursos.map((c, i) => (
                <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * .03 }}>
                  <td style={{ fontWeight: 500 }}>{c.nombre}</td>
                  <td>
                    <span className="badge" style={{ background: c.nivel === 'basico' ? 'rgba(16,185,129,.15)' : c.nivel === 'intermedio' ? 'rgba(245,158,11,.15)' : 'rgba(239,68,68,.15)', color: c.nivel === 'basico' ? '#10b981' : c.nivel === 'intermedio' ? '#f59e0b' : '#ef4444' }}>
                      {c.nivel}
                    </span>
                  </td>
                  <td>{c.total_inscritos}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ display: 'flex', gap: 1 }}>
                        {[...Array(5)].map((_, j) => (
                          <span key={j} style={{ fontSize: 12, color: j < Math.round(c.calificacion_promedio) ? '#f59e0b' : 'var(--border)' }}>★</span>
                        ))}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{parseFloat(c.calificacion_promedio).toFixed(1)}</span>
                    </div>
                  </td>
                  <td>{c.total_calificaciones}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
