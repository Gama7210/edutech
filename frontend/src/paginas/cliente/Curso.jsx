import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const nivelColor = { basico: '#10b981', intermedio: '#f59e0b', avanzado: '#ef4444' };

export default function Curso() {
  const { id } = useParams();
  const navegar = useNavigate();
  const [datos, setDatos] = useState(null);
  const [progreso, setProgreso] = useState([]);
  const [inscrito, setInscrito] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [inscribiendo, setInscribiendo] = useState(false);

  useEffect(() => {
    Promise.all([
      axios.get(`/api/cursos/${id}`),
      axios.get(`/api/progreso/${id}`).catch(() => ({ data: { progreso: [], completado: false } })),
      axios.get('/api/mis-cursos').catch(() => ({ data: { cursos: [] } })),
    ]).then(([r1, r2, r3]) => {
      setDatos(r1.data);
      setProgreso(r2.data.progreso || []);
      setInscrito(r3.data.cursos?.some(c => String(c.id) === String(id)) || false);
    }).finally(() => setCargando(false));
  }, [id]);

  const inscribirse = async () => {
    setInscribiendo(true);
    try {
      await axios.post('/api/inscripciones', { curso_id: id });
      setInscrito(true);
    } catch (e) {
      alert(e.response?.data?.mensaje || 'Error al inscribirse');
    } finally { setInscribiendo(false); }
  };

  const continuarCurso = () => {
    const pendiente = progreso.find(l => !l.completada);
    if (pendiente) navegar(`/cursos/${id}/leccion/${pendiente.id}`);
    else if (progreso[0]) navegar(`/cursos/${id}/leccion/${progreso[0].id}`);
  };

  if (cargando) return (
    <div style={{ padding: 32 }}>
      <div className="shimmer" style={{ height: 300, borderRadius: 16, marginBottom: 24 }} />
      <div className="shimmer" style={{ height: 200, borderRadius: 16 }} />
    </div>
  );

  if (!datos) return <div style={{ padding: 32, textAlign: 'center' }}>Curso no encontrado</div>;

  const { curso, lecciones, calificaciones } = datos;
  const completadas = progreso.filter(l => l.completada).length;
  const porcentaje = lecciones.length > 0 ? Math.round((completadas / lecciones.length) * 100) : 0;
  const cursoCompleto = completadas >= lecciones.length && lecciones.length > 0;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
      {/* Botón volver */}
      <button onClick={() => navegar('/cursos')} className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>
        ← Volver
      </button>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ height: 240, position: 'relative' }}>
          {curso.imagen_url
            ? <img src={curso.imagen_url} alt={curso.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${curso.color_categoria || '#6366f1'}, #7c3aed)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80 }}>
                {curso.icono_categoria || '📚'}
              </div>
          }
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.8) 0%, transparent 50%)' }} />
          <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              <span className="badge" style={{ background: 'rgba(0,0,0,.5)', color: '#fff', backdropFilter: 'blur(8px)' }}>
                {curso.icono_categoria} {curso.nombre_categoria}
              </span>
              <span className="badge" style={{ background: `${nivelColor[curso.nivel]}30`, color: nivelColor[curso.nivel] }}>
                {curso.nivel}
              </span>
            </div>
            <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 900, marginBottom: 6 }}>{curso.nombre}</h1>
            <p style={{ color: 'rgba(255,255,255,.8)', fontSize: 14 }}>👨‍🏫 {curso.nombre_profesor}</p>
          </div>
        </div>

        <div style={{ padding: 24 }}>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>{curso.descripcion}</p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 20 }}>
            {[
              { icon: '⭐', val: parseFloat(curso.calificacion_promedio || 0).toFixed(1), label: 'Calificación' },
              { icon: '👥', val: curso.total_inscritos, label: 'Inscritos' },
              { icon: '📹', val: lecciones.length, label: 'Lecciones' },
              { icon: '⏱️', val: `${curso.duracion_horas}h`, label: 'Duración' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>{s.icon} {s.val}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Progreso si inscrito */}
          {inscrito && lecciones.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>Tu progreso</span>
                <span style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 700 }}>{porcentaje}%</span>
              </div>
              <div className="barra-progreso" style={{ height: 10 }}>
                <div className="barra-progreso-fill" style={{ width: `${porcentaje}%` }} />
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                {completadas} de {lecciones.length} lecciones completadas
              </p>
            </div>
          )}

          {/* Botón acción */}
          {!inscrito ? (
            <button onClick={inscribirse} disabled={inscribiendo} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              {inscribiendo ? 'Inscribiendo...' : '🚀 Inscribirme al curso'}
            </button>
          ) : cursoCompleto ? (
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => navegar(`/cursos/${id}/cuestionario`)} className="btn btn-primary btn-lg" style={{ flex: 1 }}>
                📋 Hacer cuestionario final
              </button>
            </div>
          ) : (
            <button onClick={continuarCurso} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              ▶️ {completadas === 0 ? 'Comenzar curso' : 'Continuar aprendiendo'}
            </button>
          )}
        </div>
      </motion.div>

      {/* Lecciones */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .15 }}
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📹 Contenido del curso</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {lecciones.map((l, i) => {
            const prog = progreso.find(p => p.id === l.id);
            const completada = prog?.completada || false;
            const bloqueada = inscrito && i > 0 && !progreso.find(p => p.id === lecciones[i - 1]?.id)?.completada;

            return (
              <motion.div key={l.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * .04 }}
                onClick={() => inscrito && !bloqueada && navegar(`/cursos/${id}/leccion/${l.id}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                  borderRadius: 12, border: '1px solid var(--border)',
                  cursor: inscrito && !bloqueada ? 'pointer' : 'default',
                  background: completada ? 'rgba(16,185,129,.05)' : 'var(--bg-primary)',
                  opacity: bloqueada ? .5 : 1,
                  transition: 'all .15s',
                }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: completada ? '#10b981' : 'var(--bg-hover)', color: completada ? '#fff' : 'var(--text-muted)', fontWeight: 700, fontSize: 14 }}>
                  {completada ? '✓' : bloqueada ? '🔒' : i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 500, fontSize: 14 }} className="truncar">{l.titulo}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    ⏱️ {Math.floor(l.duracion_seg / 60)}:{String(l.duracion_seg % 60).padStart(2, '0')} min
                  </p>
                </div>
                {completada && <span style={{ color: '#10b981', fontSize: 18 }}>✅</span>}
                {!completada && inscrito && !bloqueada && <span style={{ color: 'var(--text-muted)', fontSize: 18 }}>▶</span>}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Calificaciones */}
      {calificaciones.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2 }}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>⭐ Opiniones del curso</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {calificaciones.map((c, i) => (
              <div key={i} style={{ padding: 16, background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div className="avatar" style={{ width: 36, height: 36, fontSize: 14, background: 'var(--accent)', color: '#fff' }}>
                    {c.nombre_usuario?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{c.nombre_usuario}</p>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {[...Array(5)].map((_, j) => (
                        <span key={j} style={{ fontSize: 13, color: j < c.estrellas ? '#f59e0b' : 'var(--border)' }}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{c.comentario}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
