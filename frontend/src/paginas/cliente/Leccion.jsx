import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// Alumno debe ver al menos el 95% del video para continuar
const UMBRAL = 95;

// Detectar si la URL es de YouTube y extraer el ID
function getYoutubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

export default function Leccion() {
  const { id, leccion_id } = useParams();
  const navegar = useNavigate();
  const videoRef = useRef(null);
  const completadoRef = useRef(false);

  const [lecciones, setLecciones] = useState([]);
  const [leccion, setLeccion] = useState(null);
  const [progreso, setProgreso] = useState([]);
  const [completada, setCompletada] = useState(false);
  const [completando, setCompletando] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [videoPct, setVideoPct] = useState(0);
  const [curso, setCurso] = useState(null);
  const [aviso, setAviso] = useState(false);

  useEffect(() => {
    completadoRef.current = false;
    setCompletada(false);
    setVideoPct(0);
    setAviso(false);
    setError('');
    setCargando(true);

    Promise.all([
      axios.get(`/api/cursos/${id}`),
      axios.get(`/api/progreso/${id}`),
    ]).then(([r1, r2]) => {
      const ls = r1.data.lecciones || [];
      setLecciones(ls);
      setCurso(r1.data.curso);
      const prog = r2.data.progreso || [];
      setProgreso(prog);
      const l = ls.find(l => String(l.id) === String(leccion_id));
      setLeccion(l || null);
      const yaComp = prog.find(p => String(p.id) === String(leccion_id))?.completada || false;
      setCompletada(yaComp);
      completadoRef.current = yaComp;
    }).finally(() => setCargando(false));
  }, [id, leccion_id]);

  // Actualiza porcentaje y dispara completar al llegar al umbral
  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const pct = (v.currentTime / v.duration) * 100;
    setVideoPct(pct);
    if (pct >= UMBRAL && !completadoRef.current) marcarCompletada();
  };

  const marcarCompletada = async () => {
    if (completadoRef.current || completando) return;
    completadoRef.current = true;
    setCompletando(true);
    try {
      const seg = videoRef.current ? Math.round(videoRef.current.currentTime) : 0;
      const { data } = await axios.post('/api/progreso/leccion', {
        leccion_id: parseInt(leccion_id), segundos_vistos: seg,
      });
      setCompletada(true);
      // Si era el último video → navegar automáticamente al cuestionario
      if (data.curso_completado) {
        setTimeout(() => navegar(`/cursos/${id}/cuestionario`), 2000);
      }
    } catch (e) {
      completadoRef.current = false;
      setError(e.response?.data?.mensaje || 'Error al registrar progreso');
    } finally { setCompletando(false); }
  };

  const irSiguiente = () => {
    if (!completada) {
      setAviso(true);
      setTimeout(() => setAviso(false), 3000);
      // Hacer scroll al video
      videoRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    const sig = lecciones[idx + 1];
    if (sig) navegar(`/cursos/${id}/leccion/${sig.id}`);
  };

  const idx = lecciones.findIndex(l => String(l.id) === String(leccion_id));
  const siguiente = lecciones[idx + 1];
  const esFinal = !siguiente && completada;

  if (cargando) return (
    <div style={{ padding: 32 }}>
      <div className="shimmer" style={{ height: 420, borderRadius: 16 }} />
    </div>
  );
  if (!leccion) return (
    <div style={{ padding: 32, textAlign: 'center', color: 'var(--txt3)' }}>Lección no encontrada</div>
  );

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>

      {/* ── COLUMNA PRINCIPAL ── */}
      <div>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, fontSize: 13 }}>
          <button onClick={() => navegar(`/cursos/${id}`)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--green)', fontFamily: 'inherit', fontSize: 13, fontWeight: 700 }}>
            {curso?.nombre}
          </button>
          <span style={{ color: 'var(--txt3)' }}>›</span>
          <span style={{ color: 'var(--txt3)' }}>Lección {idx + 1} de {lecciones.length}</span>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 18, letterSpacing: '-0.02em' }}>{leccion.titulo}</h1>

        {/* VIDEO */}
        <div className="video-wrap" style={{ marginBottom: 14, boxShadow: 'var(--shadow2)' }}>
          {leccion.video_url ? (
            (() => {
              const ytId = getYoutubeId(leccion.video_url);
              if (ytId) {
                // YouTube — usar iframe
                return (
                  <iframe
                    key={ytId}
                    src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={leccion.titulo}
                  />
                );
              }
              // Video normal MP4
              return (
                <video
                  ref={videoRef}
                  controls
                  onTimeUpdate={onTimeUpdate}
                  onEnded={marcarCompletada}
                  controlsList="nodownload"
                  style={{ width: '100%', height: '100%' }}
                >
                  <source src={leccion.video_url} />
                </video>
              );
            })()
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--card2)', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: 48 }}>📹</span>
              <p style={{ color: 'var(--txt3)' }}>Video no disponible aún</p>
            </div>
          )}
        </div>

        {/* BARRA PROGRESO VIDEO — solo para MP4, no YouTube */}
        {leccion.video_url && !getYoutubeId(leccion.video_url) && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: completada ? 'var(--green)' : 'var(--txt3)' }}>
                {completada
                  ? '✅ Video completado — puedes continuar'
                  : `⏳ Ve el video completo para continuar (${Math.round(videoPct)}%)`}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: videoPct >= UMBRAL ? 'var(--green)' : '#fbbf24' }}>
                {Math.round(videoPct)}%
              </span>
            </div>
            <div className="progress" style={{ height: 8 }}>
              <div className="progress-fill" style={{
                width: `${videoPct}%`,
                background: videoPct >= UMBRAL
                  ? 'linear-gradient(90deg,var(--green),var(--green2))'
                  : 'linear-gradient(90deg,#f59e0b,#fbbf24)',
                transition: 'width .3s, background .5s',
              }} />
            </div>
          </div>
        )}

        {/* Para YouTube — botón manual de completar */}
        {leccion.video_url && getYoutubeId(leccion.video_url) && !completada && (
          <div style={{ marginBottom: 18, padding: '14px 16px', background: 'rgba(152,202,63,.06)', border: '1px solid rgba(152,202,63,.2)', borderRadius: 12 }}>
            <p style={{ fontSize: 13, color: 'var(--txt2)', marginBottom: 10 }}>
              📺 Ve el video completo de YouTube y luego marca la lección como completada para continuar.
            </p>
            <button onClick={marcarCompletada} disabled={completando} className="btn btn-green" style={{ width: '100%' }}>
              {completando ? 'Registrando...' : '✅ Ya vi el video — marcar como completada'}
            </button>
          </div>
        )}

        {/* AVISO si intenta saltar */}
        <AnimatePresence>
          {aviso && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ padding: '13px 16px', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 12, color: '#f87171', fontSize: 14, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              🔒 Debes terminar de ver este video antes de pasar al siguiente
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cargando / completando */}
        {completando && (
          <div style={{ padding: '12px 16px', background: 'rgba(152,202,63,.08)', border: '1px solid rgba(152,202,63,.2)', borderRadius: 12, color: 'var(--green)', fontSize: 14, fontWeight: 600, marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 16, height: 16, border: '2px solid rgba(152,202,63,.3)', borderTopColor: 'var(--green)', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
            Registrando progreso...
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 12, color: '#f87171', fontSize: 14, marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}

        {/* BANNER FINAL → cuestionario */}
        {esFinal && (
          <motion.div initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ padding: '24px', background: 'linear-gradient(135deg,rgba(152,202,63,.12),rgba(152,202,63,.04))', border: '1px solid rgba(152,202,63,.3)', borderRadius: 18, marginBottom: 18, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
            <p style={{ fontWeight: 900, fontSize: 18, color: 'var(--green)', marginBottom: 4 }}>¡Completaste todas las lecciones!</p>
            <p style={{ color: 'var(--txt3)', fontSize: 14, marginBottom: 18 }}>Aprueba el cuestionario para obtener tu certificado</p>
            <button onClick={() => navegar(`/cursos/${id}/cuestionario`)} className="btn btn-green btn-lg" style={{ width: '100%' }}>
              📋 Ir al cuestionario final →
            </button>
          </motion.div>
        )}

        {/* Descripción */}
        {leccion.descripcion && (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px', marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>📝 Descripción</p>
            <p style={{ color: 'var(--txt2)', lineHeight: 1.7, fontSize: 14 }}>{leccion.descripcion}</p>
          </div>
        )}

        {/* Botón siguiente */}
        {siguiente && (
          <motion.button whileTap={{ scale: .97 }} onClick={irSiguiente}
            className={completada ? 'btn btn-green' : 'btn btn-ghost'}
            style={{ width: '100%' }}>
            {completada
              ? 'Siguiente lección →'
              : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  🔒 Siguiente lección
                  <span style={{ fontSize: 11, opacity: .7 }}>(termina el video primero)</span>
                </span>
            }
          </motion.button>
        )}
      </div>

      {/* ── SIDEBAR LECCIONES ── */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, position: 'sticky', top: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 14 }}>
          📚 Lecciones del curso
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {lecciones.map((l, i) => {
            const p = progreso.find(p => String(p.id) === String(l.id));
            const isActual = String(l.id) === String(leccion_id);
            const comp = p?.completada || false;
            const anterior_comp = i === 0 || progreso.find(p => String(p.id) === String(lecciones[i-1]?.id))?.completada;
            const bloq = !isActual && !comp && !anterior_comp;

            return (
              <button key={l.id}
                onClick={() => {
                  if (bloq) { setAviso(true); setTimeout(() => setAviso(false), 3000); return; }
                  navegar(`/cursos/${id}/leccion/${l.id}`);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  borderRadius: 10, border: `1px solid ${isActual ? 'rgba(152,202,63,.3)' : 'transparent'}`,
                  cursor: bloq ? 'not-allowed' : 'pointer',
                  textAlign: 'left', fontFamily: 'inherit', transition: 'all .15s',
                  background: isActual ? 'rgba(152,202,63,.1)' : comp ? 'rgba(152,202,63,.05)' : 'var(--bg)',
                  opacity: bloq ? .4 : 1, color: 'var(--txt)',
                }}>
                <span style={{
                  width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0, fontSize: bloq ? 13 : 12, fontWeight: 800,
                  background: isActual ? 'var(--green)' : comp ? 'rgba(152,202,63,.2)' : 'var(--card2)',
                  color: isActual ? '#0e1800' : comp ? 'var(--green)' : 'var(--txt3)',
                }}>
                  {bloq ? '🔒' : comp ? '✓' : i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: isActual ? 700 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {l.titulo}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 2 }}>
                    ⏱️ {Math.floor(l.duracion_seg / 60)}:{String(l.duracion_seg % 60).padStart(2, '0')} min
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Nota informativa */}
        <div style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(152,202,63,.06)', border: '1px solid rgba(152,202,63,.12)', borderRadius: 10 }}>
          <p style={{ fontSize: 11, color: 'var(--txt3)', lineHeight: 1.6 }}>
            🔒 Cada video debe verse completo para desbloquear el siguiente. Al terminar todas las lecciones irás automáticamente al cuestionario.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 300px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}