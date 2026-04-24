import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const LETRAS = ['A','B','C','D'];

export default function Cuestionario() {
  const { id } = useParams();
  const navegar = useNavigate();
  const [preguntas, setPreguntas] = useState([]);
  const [respuestas, setRespuestas] = useState({});
  const [actual, setActual] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [faseEnvio, setFaseEnvio] = useState(0); // 0=nada 1=enviando 2=validando 3=calculando 4=listo
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [curso, setCurso] = useState(null);

  useEffect(()=>{
    Promise.all([axios.get(`/api/cuestionario/${id}`), axios.get(`/api/cursos/${id}`)])
      .then(([r1,r2])=>{ setPreguntas(r1.data.preguntas||[]); setCurso(r2.data.curso); })
      .catch(e=>setError(e.response?.data?.mensaje||'Error al cargar'))
      .finally(()=>setCargando(false));
  },[id]);

  const seleccionar = (pId, oId) => setRespuestas(r=>({...r,[pId]:oId}));

  const enviar = async () => {
    if (Object.keys(respuestas).length<preguntas.length) { setError('Responde todas las preguntas'); return; }
    setEnviando(true); setFaseEnvio(1); setError('');
    try {
      // Animacion de fases mientras espera respuesta del servidor
      const t1 = setTimeout(() => setFaseEnvio(2), 800);
      const t2 = setTimeout(() => setFaseEnvio(3), 1800);
      const { data } = await axios.post('/api/cuestionario/respuestas', { curso_id:id, respuestas:preguntas.map(p=>({ pregunta_id:p.id, opcion_elegida_id:respuestas[p.id] })) });
      clearTimeout(t1); clearTimeout(t2);
      setFaseEnvio(4);
      setTimeout(() => navegar(`/cursos/${id}/resultados`, { state:{ ...data, curso_nombre:curso?.nombre } }), 1200);
    } catch(e) { setError(e.response?.data?.mensaje||'Error al enviar'); setEnviando(false); setFaseEnvio(0); }
  };

  const fases = [
    { icon: '📤', texto: 'Enviando respuestas...', color: '#60a5fa' },
    { icon: '🔍', texto: 'Validando respuestas...', color: '#fbbf24' },
    { icon: '🧮', texto: 'Calculando calificacion...', color: '#a78bfa' },
    { icon: '✅', texto: '¡Listo!', color: 'var(--green)' },
  ];

  if (enviando) return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:24 }}>
      <motion.div
        initial={{ opacity:0, scale:.9 }}
        animate={{ opacity:1, scale:1 }}
        style={{ textAlign:'center', maxWidth:400, width:'100%' }}>

        {/* Circulo animado con icono */}
        <div style={{ position:'relative', width:120, height:120, margin:'0 auto 32px' }}>
          {/* Anillo giratorio */}
          <svg style={{ position:'absolute', inset:0, animation:'spin 1.5s linear infinite' }} viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(152,202,63,.15)" strokeWidth="8"/>
            <circle cx="60" cy="60" r="54" fill="none" stroke="var(--green)" strokeWidth="8"
              strokeDasharray="80 260" strokeLinecap="round"/>
          </svg>
          {/* Segundo anillo */}
          <svg style={{ position:'absolute', inset:0, animation:'spin 2.5s linear infinite reverse' }} viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="42" fill="none" stroke="rgba(167,139,250,.2)" strokeWidth="4"/>
            <circle cx="60" cy="60" r="42" fill="none" stroke="#a78bfa" strokeWidth="4"
              strokeDasharray="40 224" strokeLinecap="round"/>
          </svg>
          {/* Icono central */}
          <AnimatePresence mode="wait">
            <motion.div key={faseEnvio}
              initial={{ scale:.5, opacity:0 }}
              animate={{ scale:1, opacity:1 }}
              exit={{ scale:.5, opacity:0 }}
              transition={{ duration:.3 }}
              style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:40 }}>
              {faseEnvio > 0 ? fases[faseEnvio-1]?.icon : '📤'}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Texto de fase */}
        <AnimatePresence mode="wait">
          <motion.p key={faseEnvio}
            initial={{ opacity:0, y:10 }}
            animate={{ opacity:1, y:0 }}
            exit={{ opacity:0, y:-10 }}
            transition={{ duration:.3 }}
            style={{ fontSize:22, fontWeight:800, color: faseEnvio>0 ? fases[faseEnvio-1]?.color : 'var(--green)', marginBottom:8, letterSpacing:'-0.02em' }}>
            {faseEnvio>0 ? fases[faseEnvio-1]?.texto : 'Procesando...'}
          </motion.p>
        </AnimatePresence>
        <p style={{ color:'var(--txt3)', fontSize:14 }}>Por favor espera un momento</p>

        {/* Pasos */}
        <div style={{ display:'flex', justifyContent:'center', gap:10, marginTop:32 }}>
          {fases.map((f,i)=>(
            <motion.div key={i}
              animate={{ scale: faseEnvio===i+1 ? 1.3 : 1, opacity: faseEnvio>i ? 1 : 0.3 }}
              style={{ width:10, height:10, borderRadius:'50%',
                background: faseEnvio>i ? fases[i].color : 'var(--border2)' }}/>
          ))}
        </div>

        {/* Barra de progreso */}
        <div style={{ marginTop:24, height:4, background:'var(--border2)', borderRadius:99, overflow:'hidden' }}>
          <motion.div
            animate={{ width: `${Math.min((faseEnvio/4)*100, 100)}%` }}
            transition={{ duration:.6, ease:'easeInOut' }}
            style={{ height:'100%', background:'linear-gradient(90deg,var(--green),#7ac520)', borderRadius:99 }}/>
        </div>
      </motion.div>
    </div>
  );

  if (cargando) return (
    <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:40,height:40,border:'3px solid var(--border2)',borderTopColor:'var(--green)',borderRadius:'50%',animation:'spin .8s linear infinite',margin:'0 auto 12px' }}/>
        <p style={{ color:'var(--txt3)' }}>Cargando cuestionario...</p>
      </div>
    </div>
  );

  if (error && preguntas.length===0) return (
    <div style={{ padding:32, textAlign:'center', maxWidth:500, margin:'0 auto', paddingTop:80 }}>
      <div style={{ fontSize:56,marginBottom:16 }}>🔒</div>
      <p style={{ fontWeight:800,fontSize:18,marginBottom:8 }}>No disponible</p>
      <p style={{ color:'var(--txt3)',marginBottom:20 }}>{error}</p>
      <button onClick={()=>navegar(`/cursos/${id}`)} className="btn btn-green">Volver al curso</button>
    </div>
  );

  const preg = preguntas[actual];
  const totalResp = Object.keys(respuestas).length;
  const pct = (totalResp/preguntas.length)*100;

  return (
    <div style={{ maxWidth:720, margin:'0 auto', padding:'28px 20px' }}>

      {/* Header */}
      <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} style={{ marginBottom:28 }}>
        <p style={{ fontSize:11,fontWeight:700,color:'var(--green)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:4 }}>📋 CUESTIONARIO FINAL</p>
        <h1 style={{ fontSize:22,fontWeight:900,letterSpacing:'-0.02em',marginBottom:14 }} className="truncar">{curso?.nombre}</h1>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7 }}>
          <span style={{ fontSize:13,color:'var(--txt3)' }}>{totalResp}/{preguntas.length} respondidas</span>
          <span style={{ fontSize:13,color:'var(--green)',fontWeight:700 }}>{Math.round(pct)}%</span>
        </div>
        <div className="progress" style={{ height:7 }}>
          <div className="progress-fill" style={{ width:`${pct}%` }}/>
        </div>
      </motion.div>

      {/* Mini-nav preguntas */}
      <div style={{ display:'flex', gap:6, marginBottom:22, flexWrap:'wrap' }}>
        {preguntas.map((p,i)=>(
          <button key={p.id} onClick={()=>setActual(i)}
            style={{ width:34,height:34,borderRadius:8,border:'none',cursor:'pointer',fontWeight:700,fontSize:12,fontFamily:'inherit',transition:'all .15s',
              background:i===actual?'var(--green)':respuestas[p.id]?'rgba(152,202,63,.2)':'var(--card2)',
              color:i===actual?'#0e1800':respuestas[p.id]?'var(--green)':'var(--txt3)',
              boxShadow:i===actual?'var(--glow)':'',
              outline:`1px solid ${i===actual?'transparent':respuestas[p.id]?'rgba(152,202,63,.4)':'var(--border2)'}`,
            }}>
            {i+1}
          </button>
        ))}
      </div>

      {/* Pregunta */}
      <AnimatePresence mode="wait">
        <motion.div key={actual} initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30}}
          style={{ background:'var(--card)',border:'1px solid var(--border)',borderRadius:20,padding:28,marginBottom:22 }}>
          <p style={{ fontSize:11,fontWeight:700,color:'var(--txt3)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:12 }}>
            Pregunta {actual+1} de {preguntas.length}
          </p>
          <p style={{ fontSize:18,fontWeight:800,lineHeight:1.5,marginBottom:26,letterSpacing:'-0.01em' }}>{preg?.texto}</p>

          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {preg?.opciones?.map((op,i)=>{
              const sel = respuestas[preg.id]===op.id;
              return (
                <motion.button key={op.id} whileTap={{scale:.98}} onClick={()=>seleccionar(preg.id,op.id)}
                  style={{ display:'flex',alignItems:'center',gap:14,padding:'14px 18px',borderRadius:14,
                    border:`2px solid ${sel?'var(--green)':'var(--border2)'}`,
                    background:sel?'rgba(152,202,63,.08)':'var(--card2)',
                    cursor:'pointer',textAlign:'left',transition:'all .15s',fontFamily:'inherit',color:'var(--txt)',
                    boxShadow:sel?'0 0 0 1px rgba(152,202,63,.15)':'',
                  }}>
                  <span style={{ width:34,height:34,borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
                    background:sel?'var(--green)':'var(--bg)',
                    color:sel?'#0e1800':'var(--txt3)',fontWeight:800,fontSize:13,
                    border:`1px solid ${sel?'transparent':'var(--border2)'}`,
                    transition:'all .15s',
                  }}>{LETRAS[i]}</span>
                  <span style={{ fontSize:15,fontWeight:sel?700:400 }}>{op.texto}</span>
                  {sel && <span style={{ marginLeft:'auto',color:'var(--green)',fontSize:18 }}>✓</span>}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navegación */}
      <div style={{ display:'flex', gap:10, marginBottom:16 }}>
        <button onClick={()=>setActual(a=>Math.max(0,a-1))} disabled={actual===0} className="btn btn-ghost" style={{ flex:1 }}>← Anterior</button>
        {actual<preguntas.length-1
          ? <button onClick={()=>setActual(a=>a+1)} className="btn btn-green" style={{ flex:1 }}>Siguiente →</button>
          : <motion.button whileTap={{scale:.97}} onClick={enviar} disabled={enviando||totalResp<preguntas.length}
              className="btn btn-green" style={{ flex:2 }}>
              {enviando?'📤 Enviando...':'🎯 Enviar respuestas'}
            </motion.button>
        }
      </div>

      {error && <p style={{ color:'var(--red)',fontSize:13,textAlign:'center' }}>⚠️ {error}</p>}
    </div>
  );
}