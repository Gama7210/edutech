import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import axios from 'axios';

export default function Resultados() {
  const { id } = useParams();
  const { state } = useLocation();
  const navegar = useNavigate();
  const [stars, setStars] = useState(0);
  const [comentario, setComentario] = useState('');
  const [calificando, setCalificando] = useState(false);
  const [calificado, setCalificado] = useState(false);

  if (!state) { navegar(`/cursos/${id}`); return null; }
  const { calificacion, correctas, total, aprobado, pdf_resultados, certificado_url, resultados, curso_nombre } = state;

  const calificar = async () => {
    if (!stars||!comentario.trim()) return;
    setCalificando(true);
    try { await axios.post('/api/calificaciones',{curso_id:id,estrellas:stars,comentario}); setCalificado(true); }
    catch(e){ alert(e.response?.data?.mensaje||'Error'); }
    finally { setCalificando(false); }
  };

  return (
    <div style={{ maxWidth:700, margin:'0 auto', padding:'32px 20px' }}>

      {/* Resultado hero */}
      <motion.div initial={{opacity:0,scale:.9}} animate={{opacity:1,scale:1}}
        style={{ textAlign:'center', padding:'36px 28px', background:aprobado?'linear-gradient(135deg,rgba(152,202,63,.1),rgba(152,202,63,.05))':'linear-gradient(135deg,rgba(239,68,68,.1),rgba(239,68,68,.05))', border:`2px solid ${aprobado?'rgba(152,202,63,.3)':'rgba(239,68,68,.3)'}`, borderRadius:24, marginBottom:24 }}>
        <motion.div initial={{scale:0}} animate={{scale:1}} transition={{delay:.2,type:'spring',stiffness:300,damping:15}}
          style={{ fontSize:72, marginBottom:12 }}>{aprobado?'🎉':'😔'}</motion.div>
        <h1 style={{ fontSize:30,fontWeight:900,letterSpacing:'-0.03em',color:aprobado?'var(--green)':'var(--red)',marginBottom:6 }}>
          {aprobado?'¡Aprobado!':'No aprobado'}
        </h1>
        <p style={{ color:'var(--txt3)', marginBottom:20, fontSize:15 }}>{curso_nombre}</p>
        <motion.div initial={{scale:0}} animate={{scale:1}} transition={{delay:.4,type:'spring'}}
          style={{ fontSize:64,fontWeight:900,color:aprobado?'var(--green)':'var(--red)',lineHeight:1 }}>
          {calificacion}%
        </motion.div>
        <p style={{ color:'var(--txt3)', marginTop:8, fontSize:14 }}>
          {correctas} de {total} respuestas correctas
          {!aprobado && <><br/><span style={{ fontSize:12 }}>Necesitas al menos 70% para aprobar</span></>}
        </p>
      </motion.div>

      {/* Descargas */}
      <div style={{ display:'flex', gap:12, marginBottom:24, flexWrap:'wrap' }}>
        {pdf_resultados && (
          <button onClick={()=>{ const w=window.open(); w.document.write(`<iframe src="${pdf_resultados}" style="width:100%;height:100vh;border:none"></iframe>`); }}
            className="btn btn-ghost" style={{ flex:1 }}>
            📄 Ver resultados (PDF)
          </button>
        )}
        {certificado_url && (
          <button onClick={()=>{ const w=window.open(); w.document.write(`<iframe src="${certificado_url}" style="width:100%;height:100vh;border:none"></iframe>`); }}
            className="btn btn-green" style={{ flex:1 }}>
            🏆 Ver certificado (PDF)
          </button>
        )}
      </div>

      {/* Detalle respuestas */}
      <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:.2}}
        style={{ background:'var(--card)',border:'1px solid var(--border)',borderRadius:20,padding:24,marginBottom:24 }}>
        <h2 style={{ fontSize:16,fontWeight:800,marginBottom:16,letterSpacing:'-0.01em' }}>📋 Detalle de respuestas</h2>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {resultados?.map((r,i)=>(
            <div key={i} style={{ padding:'14px 16px',borderRadius:14,background:r.es_correcta?'rgba(152,202,63,.07)':'rgba(239,68,68,.07)',border:`1px solid ${r.es_correcta?'rgba(152,202,63,.2)':'rgba(239,68,68,.2)'}` }}>
              <div style={{ display:'flex',gap:10,marginBottom:6,alignItems:'flex-start' }}>
                <span style={{ fontSize:16,flexShrink:0 }}>{r.es_correcta?'✅':'❌'}</span>
                <p style={{ fontWeight:700,fontSize:14,lineHeight:1.4 }}>{r.pregunta}</p>
              </div>
              <p style={{ fontSize:13,color:'var(--txt3)',marginLeft:26 }}>Tu respuesta: <span style={{ color:r.es_correcta?'var(--green)':'var(--red)',fontWeight:600 }}>{r.respuesta_usuario}</span></p>
              {!r.es_correcta && <p style={{ fontSize:13,color:'var(--green)',marginLeft:26,fontWeight:600 }}>Correcta: {r.respuesta_correcta}</p>}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Calificar curso */}
      {aprobado && (
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:.3}}
          style={{ background:'var(--card)',border:'1px solid var(--border)',borderRadius:20,padding:24,marginBottom:24 }}>
          <h2 style={{ fontSize:16,fontWeight:800,marginBottom:4,letterSpacing:'-0.01em' }}>⭐ ¿Qué te pareció el curso?</h2>
          <p style={{ color:'var(--txt3)',fontSize:13,marginBottom:18 }}>Tu opinión (obligatoria) ayuda a otros estudiantes</p>

          {calificado ? (
            <div style={{ textAlign:'center',padding:'20px 0' }}>
              <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',stiffness:300,damping:15}}>
                <div style={{ fontSize:48,marginBottom:8 }}>🙏</div>
              </motion.div>
              <p style={{ fontWeight:700,color:'var(--green)' }}>¡Gracias por tu calificación!</p>
            </div>
          ) : (
            <>
              <div style={{ display:'flex', gap:6, justifyContent:'center', marginBottom:18 }}>
                {[1,2,3,4,5].map(n=>(
                  <motion.button key={n} whileTap={{scale:.85}} onClick={()=>setStars(n)}
                    style={{ fontSize:36,background:'none',border:'none',cursor:'pointer',transition:'transform .15s,filter .15s',transform:n<=stars?'scale(1.25)':'scale(1)',filter:n<=stars?'brightness(1.1)':'none' }}>
                    {n<=stars?'⭐':'☆'}
                  </motion.button>
                ))}
              </div>
              <textarea value={comentario} onChange={e=>setComentario(e.target.value)}
                placeholder="Escribe tu comentario sobre el curso (obligatorio)..."
                className="input" style={{ minHeight:100,resize:'vertical',marginBottom:12 }}/>
              <button onClick={calificar} disabled={!stars||!comentario.trim()||calificando}
                className="btn btn-green" style={{ width:'100%' }}>
                {calificando?'Enviando...':'⭐ Enviar calificación'}
              </button>
            </>
          )}
        </motion.div>
      )}

      <div style={{ display:'flex', gap:12 }}>
        <button onClick={()=>navegar('/mis-cursos')} className="btn btn-ghost" style={{ flex:1 }}>Mis cursos</button>
        <button onClick={()=>navegar('/cursos')} className="btn btn-green" style={{ flex:1 }}>Explorar más</button>
      </div>
    </div>
  );
}