import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../contexto/ContextoAuth.jsx';
import TarjetaCurso from '../../componentes/TarjetaCurso.jsx';

export default function Inicio() {
  const { usuario } = useAuth();
  const navegar = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [mis, setMis] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(()=>{
    Promise.all([axios.get('/api/cursos'), axios.get('/api/mis-cursos')])
      .then(([r1,r2])=>{ setCursos(r1.data.cursos||[]); setMis(r2.data.cursos||[]); })
      .finally(()=>setCargando(false));
  },[]);

  const hora = new Date().getHours();
  const saludo = hora<12 ? 'Buenos días' : hora<18 ? 'Buenas tardes' : 'Buenas noches';
  const nombre = usuario?.nombre?.split(' ')[0] || '';
  const enProgreso = mis.filter(c=>!c.completado);
  const completados = mis.filter(c=>c.completado);

  return (
    <div style={{ padding:'32px 28px', maxWidth:1200, margin:'0 auto' }}>

      {/* Hero */}
      <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}}
        style={{ marginBottom:36, padding:'32px 36px', borderRadius:22, background:'linear-gradient(135deg,#0f1a00 0%,#1a2e00 50%,#0d1117 100%)', border:'1px solid rgba(152,202,63,.15)', position:'relative', overflow:'hidden' }}>
        {/* Deco */}
        <div style={{ position:'absolute', right:-40, top:-40, width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle,rgba(152,202,63,.15) 0%,transparent 70%)' }}/>
        <div style={{ position:'absolute', right:80, bottom:-60, width:150, height:150, borderRadius:'50%', background:'radial-gradient(circle,rgba(124,58,237,.15) 0%,transparent 70%)' }}/>
        <div style={{ position:'relative' }}>
          <p style={{ color:'var(--green)', fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', marginBottom:6 }}>
            {saludo} 👋
          </p>
          <h1 style={{ fontSize:32, fontWeight:900, letterSpacing:'-0.03em', marginBottom:10, lineHeight:1.1 }}>
            ¡Hola, <span style={{ color:'var(--green)' }}>{nombre}</span>!
          </h1>
          <p style={{ color:'rgba(255,255,255,.6)', fontSize:16 }}>
            {enProgreso.length>0 ? `Tienes ${enProgreso.length} curso${enProgreso.length>1?'s':''} en progreso. ¡Sigue así!` : '¿Listo para aprender algo nuevo hoy?'}
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:14, marginBottom:36 }}>
        {[
          { icon:'📚', label:'Inscritos',    val:mis.length,          color:'var(--green)',  bg:'rgba(152,202,63,.1)' },
          { icon:'▶️',  label:'En progreso',  val:enProgreso.length,   color:'#fbbf24',      bg:'rgba(234,179,8,.1)' },
          { icon:'✅', label:'Completados',  val:completados.length,  color:'#60a5fa',      bg:'rgba(59,130,246,.1)' },
          { icon:'🏆', label:'Certificados', val:completados.length,  color:'#f87171',      bg:'rgba(239,68,68,.1)' },
        ].map((s,i)=>(
          <motion.div key={i} initial={{opacity:0,scale:.9}} animate={{opacity:1,scale:1}} transition={{delay:.05*i}}
            style={{ background:s.bg, border:`1px solid ${s.color}25`, borderRadius:16, padding:'18px 20px', display:'flex', alignItems:'center', gap:14 }}>
            <span style={{ fontSize:26 }}>{s.icon}</span>
            <div>
              <p style={{ fontSize:28, fontWeight:900, color:s.color, lineHeight:1 }}>{s.val}</p>
              <p style={{ fontSize:12, color:'var(--txt3)', marginTop:3 }}>{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* En progreso */}
      {enProgreso.length>0 && (
        <section style={{ marginBottom:40 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
            <h2 style={{ fontSize:19, fontWeight:800, letterSpacing:'-0.01em' }}>▶️ Continuar aprendiendo</h2>
            <button onClick={()=>navegar('/mis-cursos')} className="btn btn-ghost btn-sm">Ver todos</button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:18 }}>
            {enProgreso.slice(0,3).map((c,i)=>{
              const pct = c.total_lecciones>0 ? Math.round((c.lecciones_completadas/c.total_lecciones)*100) : 0;
              return (
                <motion.div key={c.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*.07}}
                  onClick={()=>navegar(`/cursos/${c.id}`)}
                  style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden', cursor:'pointer' }}
                  whileHover={{y:-3,borderColor:'rgba(152,202,63,.3)',boxShadow:'var(--shadow2)'}}>
                  <div style={{ height:130, background:c.imagen_url?`url(${c.imagen_url}) center/cover`:`linear-gradient(135deg,${c.color||'#1a2e00'},#0d1117)`, position:'relative' }}>
                    <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,.7),transparent)' }}/>
                    <div style={{ position:'absolute', bottom:12, left:14, right:14 }}>
                      <p style={{ color:'#fff', fontWeight:800, fontSize:14, lineHeight:1.3 }} className="truncar">{c.nombre}</p>
                    </div>
                  </div>
                  <div style={{ padding:'14px 16px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7 }}>
                      <span style={{ color:'var(--txt3)', fontSize:12 }}>{c.lecciones_completadas}/{c.total_lecciones} lecciones</span>
                      <span style={{ color:'var(--green)', fontWeight:800, fontSize:13 }}>{pct}%</span>
                    </div>
                    <div className="progress"><div className="progress-fill" style={{ width:`${pct}%` }}/></div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Catálogo */}
      <section>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
          <h2 style={{ fontSize:19, fontWeight:800, letterSpacing:'-0.01em' }}>🎓 Cursos disponibles</h2>
          <button onClick={()=>navegar('/cursos')} className="btn btn-ghost btn-sm">Ver todos</button>
        </div>
        {cargando
          ? <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:18 }}>
              {[...Array(6)].map((_,i)=><div key={i} className="shimmer" style={{ height:290 }}/>)}
            </div>
          : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:18 }}>
              {cursos.slice(0,6).map((c,i)=><TarjetaCurso key={c.id} curso={c} delay={i*.05}/>)}
            </div>
        }
      </section>
    </div>
  );
}
