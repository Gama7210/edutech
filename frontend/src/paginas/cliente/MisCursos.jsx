import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function MisCursos() {
  const navegar = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    axios.get('/api/mis-cursos')
      .then(r => setCursos(r.data.cursos || []))
      .finally(() => setCargando(false));
  }, []);

  const filtrados = cursos.filter(c => {
    if (filtro === 'progreso') return !c.completado;
    if (filtro === 'completados') return c.completado;
    return true;
  });

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1100, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 6 }}>▶️ Mis cursos</h1>
        <p style={{ color: 'var(--text-muted)' }}>{cursos.length} curso{cursos.length !== 1 ? 's' : ''} inscritos</p>
      </motion.div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[
          { val: 'todos',      label: 'Todos',       n: cursos.length },
          { val: 'progreso',   label: 'En progreso', n: cursos.filter(c => !c.completado).length },
          { val: 'completados',label: 'Completados', n: cursos.filter(c => c.completado).length },
        ].map(f => (
          <button key={f.val} onClick={() => setFiltro(f.val)}
            className={`btn ${filtro === f.val ? 'btn-primary' : 'btn-ghost'} btn-sm`}>
            {f.label} ({f.n})
          </button>
        ))}
      </div>

      {cargando ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {[...Array(3)].map((_, i) => <div key={i} className="shimmer" style={{ height: 200, borderRadius: 16 }} />)}
        </div>
      ) : filtrados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📚</div>
          <p style={{ fontWeight: 700, marginBottom: 8 }}>
            {filtro === 'todos' ? 'No estás inscrito en ningún curso' : 'No hay cursos en esta categoría'}
          </p>
          <button onClick={() => navegar('/cursos')} className="btn btn-primary" style={{ marginTop: 12 }}>
            Explorar cursos
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {filtrados.map((c, i) => {
            const pct = c.total_lecciones > 0 ? Math.round((c.lecciones_completadas / c.total_lecciones) * 100) : 0;
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .06 }}
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', cursor: 'pointer' }}
                whileHover={{ y: -3, boxShadow: 'var(--shadow-lg)' }}
                onClick={() => navegar(`/cursos/${c.id}`)}>
                <div style={{ height: 120, background: c.imagen_url ? `url(${c.imagen_url}) center/cover` : `linear-gradient(135deg,${c.color || '#6366f1'},#7c3aed)`, position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.3)' }} />
                  {c.completado && (
                    <div style={{ position: 'absolute', top: 10, right: 10, background: 'var(--success)', color: '#fff', borderRadius: 99, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>
                      ✅ Completado
                    </div>
                  )}
                </div>
                <div style={{ padding: 16 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }} className="truncar">{c.nombre}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 12 }}>👨‍🏫 {c.nombre_profesor}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.lecciones_completadas}/{c.total_lecciones} lecciones</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: pct === 100 ? 'var(--success)' : 'var(--accent)' }}>{pct}%</span>
                  </div>
                  <div className="barra-progreso">
                    <div className="barra-progreso-fill" style={{ width: `${pct}%`, background: pct === 100 ? 'var(--success)' : undefined }} />
                  </div>
                  {c.completado && (
                    <button onClick={e => { e.stopPropagation(); navegar(`/cursos/${c.id}/cuestionario`); }}
                      className="btn btn-primary btn-sm" style={{ width: '100%', marginTop: 12 }}>
                      📋 Ver cuestionario
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
