import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const LETRAS = ['A','B','C','D'];

function PreguntaEditor({ pregunta, idx, onChange, onEliminar }) {
  return (
    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
      style={{ background:'var(--card2)', border:'1px solid var(--border2)', borderRadius:16, padding:20, marginBottom:14 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:'linear-gradient(135deg,var(--green),var(--purple))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:'#fff' }}>
            {idx+1}
          </div>
          <span style={{ fontSize:13, fontWeight:700, color:'var(--txt2)', textTransform:'uppercase', letterSpacing:'.06em' }}>Pregunta {idx+1}</span>
        </div>
        <button onClick={()=>onEliminar(idx)} className="btn btn-red btn-sm">🗑️ Eliminar</button>
      </div>

      <textarea
        value={pregunta.texto}
        onChange={e=>onChange(idx,'texto',e.target.value)}
        placeholder="Escribe la pregunta aquí..."
        className="input"
        style={{ minHeight:70, resize:'vertical', marginBottom:14, fontSize:14, lineHeight:1.5 }}
      />

      <p style={{ fontSize:11, fontWeight:700, color:'var(--txt3)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>
        Opciones — haz clic en el círculo para marcar la correcta:
      </p>

      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {pregunta.opciones.map((op,oi)=>(
          <div key={oi} style={{ display:'flex', alignItems:'center', gap:10 }}>
            {/* Radio correcta */}
            <button type="button" onClick={()=>onChange(idx,'correcta',oi)}
              style={{ width:28, height:28, borderRadius:'50%', flexShrink:0, cursor:'pointer', border:`2px solid ${op.es_correcta?'var(--green)':'var(--border2)'}`, background:op.es_correcta?'var(--green)':'transparent', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s', boxShadow:op.es_correcta?'var(--glow)':'' }}>
              {op.es_correcta && <span style={{ fontSize:14, fontWeight:900, color:'#0e1800' }}>✓</span>}
            </button>
            {/* Letra */}
            <span style={{ width:22, height:22, borderRadius:6, background:'var(--card)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'var(--txt2)', flexShrink:0 }}>{LETRAS[oi]}</span>
            {/* Input */}
            <input
              value={op.texto}
              onChange={e=>onChange(idx,'opcion',oi,e.target.value)}
              placeholder={`Opción ${LETRAS[oi]}`}
              className="input"
              style={{ flex:1, padding:'9px 14px', fontSize:14, borderColor:op.es_correcta?'rgba(152,202,63,.3)':undefined }}
            />
          </div>
        ))}
      </div>

      {/* Indicador correcta */}
      {pregunta.opciones.some(o=>o.es_correcta) && (
        <p style={{ fontSize:12, color:'var(--green)', marginTop:10, fontWeight:600 }}>
          ✅ Respuesta correcta: {LETRAS[pregunta.opciones.findIndex(o=>o.es_correcta)]}
        </p>
      )}
    </motion.div>
  );
}

export default function AdminCuestionario({ cursoId, cursoNombre, onCerrar }) {
  const [preguntas, setPreguntas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState(null);
  const [ok, setOk] = useState(false);

  useEffect(()=>{
    axios.get(`/api/preguntas/${cursoId}`)
      .then(r=>{
        const ps = r.data.preguntas || [];
        if (ps.length===0) {
          // Inicializar con 5 preguntas vacías
          setPreguntas(Array.from({length:5},(_,i)=>({
            texto:'', orden:i+1,
            opciones:[
              {texto:'',es_correcta:true},
              {texto:'',es_correcta:false},
              {texto:'',es_correcta:false},
              {texto:'',es_correcta:false},
            ]
          })));
        } else {
          setPreguntas(ps.map(p=>({
            id:p.id, texto:p.texto, orden:p.orden,
            opciones:p.opciones||[
              {texto:'',es_correcta:true},{texto:'',es_correcta:false},
              {texto:'',es_correcta:false},{texto:'',es_correcta:false}
            ]
          })));
        }
      })
      .catch(()=>setPreguntas([]))
      .finally(()=>setCargando(false));
  },[cursoId]);

  const cambiarPregunta = (idx, campo, val, subIdx=null) => {
    setPreguntas(prev=>prev.map((p,i)=>{
      if (i!==idx) return p;
      if (campo==='texto') return {...p,texto:val};
      if (campo==='correcta') return {...p,opciones:p.opciones.map((o,j)=>({...o,es_correcta:j===val}))};
      if (campo==='opcion') return {...p,opciones:p.opciones.map((o,j)=>j===subIdx?{...o,texto:val}:o)};
      return p;
    }));
  };

  const agregarPregunta = () => {
    if (preguntas.length>=15) return;
    setPreguntas(p=>[...p,{
      texto:'', orden:p.length+1,
      opciones:[{texto:'',es_correcta:true},{texto:'',es_correcta:false},{texto:'',es_correcta:false},{texto:'',es_correcta:false}]
    }]);
  };

  const eliminarPregunta = idx => setPreguntas(p=>p.filter((_,i)=>i!==idx).map((p,i)=>({...p,orden:i+1})));

  const guardar = async () => {
    const validas = preguntas.filter(p=>p.texto.trim() && p.opciones.every(o=>o.texto.trim()) && p.opciones.some(o=>o.es_correcta));
    if (validas.length<3) { setMsg({ok:false,txt:'Necesitas al menos 3 preguntas completas con opciones y respuesta correcta'}); return; }
    setGuardando(true); setMsg(null);
    try {
      // Limpiar preguntas anteriores e insertar nuevas
      for (const [pi, preg] of validas.entries()) {
        const { data } = await axios.post('/api/preguntas', { curso_id:cursoId, texto:preg.texto, orden:pi+1 });
        for (const [oi,op] of preg.opciones.entries()) {
          if (!op.texto.trim()) continue;
          await axios.post('/api/opciones', { pregunta_id:data.id, texto:op.texto, es_correcta:op.es_correcta, orden:oi+1 });
        }
      }
      setMsg({ok:true,txt:`✅ ${validas.length} preguntas guardadas correctamente`});
      setOk(true);
      setTimeout(onCerrar, 2000);
    } catch(e) { setMsg({ok:false,txt:e.response?.data?.mensaje||'Error al guardar'}); }
    finally { setGuardando(false); }
  };

  return (
    <div className="overlay" onClick={onCerrar}>
      <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}}
        onClick={e=>e.stopPropagation()}
        style={{ background:'var(--card)', border:'1px solid var(--border2)', borderRadius:22, width:'100%', maxWidth:680, maxHeight:'92vh', display:'flex', flexDirection:'column', boxShadow:'var(--shadow2)' }}>

        {/* Header */}
        <div style={{ padding:'24px 28px 18px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
            <div>
              <p style={{ fontSize:11, fontWeight:700, color:'var(--green)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:4 }}>📋 Cuestionario</p>
              <h2 style={{ fontSize:20, fontWeight:900, letterSpacing:'-0.02em' }} className="truncar">{cursoNombre}</h2>
              <p style={{ color:'var(--txt3)', fontSize:13, marginTop:4 }}>{preguntas.length}/15 preguntas · mínimo 3 para activar</p>
            </div>
            <button onClick={onCerrar} className="btn btn-ghost btn-icon">✕</button>
          </div>

          {/* Progress */}
          <div style={{ marginTop:14 }}>
            <div className="progress" style={{ height:7 }}>
              <div className="progress-fill" style={{ width:`${(preguntas.filter(p=>p.texto.trim()&&p.opciones.every(o=>o.texto.trim())&&p.opciones.some(o=>o.es_correcta)).length/15)*100}%` }}/>
            </div>
            <p style={{ fontSize:11, color:'var(--txt3)', marginTop:5 }}>
              {preguntas.filter(p=>p.texto.trim()&&p.opciones.every(o=>o.texto.trim())&&p.opciones.some(o=>o.es_correcta)).length} preguntas completas
            </p>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:'auto', padding:'20px 28px' }}>
          {cargando ? (
            <div style={{ textAlign:'center', padding:40 }}>
              <div style={{ width:36, height:36, border:'3px solid var(--border2)', borderTopColor:'var(--green)', borderRadius:'50%', animation:'spin .8s linear infinite', margin:'0 auto 12px' }}/>
              <p style={{ color:'var(--txt3)' }}>Cargando cuestionario...</p>
            </div>
          ) : ok ? (
            <div style={{ textAlign:'center', padding:48 }}>
              <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',stiffness:300,damping:15}}>
                <div style={{ fontSize:64, marginBottom:12 }}>✅</div>
              </motion.div>
              <p style={{ fontWeight:800, fontSize:18, color:'var(--green)' }}>¡Cuestionario guardado!</p>
            </div>
          ) : (
            <>
              {preguntas.map((p,i)=>(
                <PreguntaEditor key={i} pregunta={p} idx={i} onChange={cambiarPregunta} onEliminar={eliminarPregunta}/>
              ))}

              {preguntas.length<15 && (
                <motion.button whileTap={{scale:.97}} onClick={agregarPregunta}
                  className="btn btn-ghost" style={{ width:'100%', marginBottom:8, border:'1px dashed var(--border2)', padding:'14px' }}>
                  ➕ Agregar pregunta ({preguntas.length}/15)
                </motion.button>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!ok && (
          <div style={{ padding:'16px 28px 24px', borderTop:'1px solid var(--border)', flexShrink:0 }}>
            {msg && (
              <motion.p initial={{opacity:0}} animate={{opacity:1}}
                style={{ fontSize:13, fontWeight:600, marginBottom:12, color:msg.ok?'var(--green)':'var(--red)' }}>
                {msg.txt}
              </motion.p>
            )}
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={onCerrar} className="btn btn-ghost" style={{ flex:1 }}>Cancelar</button>
              <motion.button whileTap={{scale:.97}} onClick={guardar} disabled={guardando} className="btn btn-green" style={{ flex:2 }}>
                {guardando
                  ? <><div style={{ width:16,height:16,border:'2px solid rgba(0,0,0,.3)',borderTopColor:'#0e1800',borderRadius:'50%',animation:'spin .7s linear infinite' }}/>Guardando...</>
                  : '💾 Guardar cuestionario'}
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
