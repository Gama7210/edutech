import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const NIVEL = { basico:['#98ca3f','Básico'], intermedio:['#eab308','Intermedio'], avanzado:['#ef4444','Avanzado'] };

export default function TarjetaCurso({ curso:c, delay=0 }) {
  const navegar = useNavigate();
  const [color, label] = NIVEL[c.nivel] || ['#98ca3f','Básico'];
  const stars = Math.round(parseFloat(c.calificacion_promedio)||0);

  return (
    <motion.div
      initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay}}
      whileHover={{y:-5,transition:{duration:.2}}}
      onClick={()=>navegar(`/cursos/${c.id}`)}
      style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:18, overflow:'hidden', cursor:'pointer', transition:'border-color .2s,box-shadow .2s' }}
      onMouseEnter={e=>{ e.currentTarget.style.borderColor='rgba(152,202,63,.3)'; e.currentTarget.style.boxShadow='0 0 0 1px rgba(152,202,63,.08),var(--shadow2)'; }}
      onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.boxShadow='none'; }}>

      {/* Portada */}
      <div style={{ height:170, position:'relative', overflow:'hidden' }}>
        {c.imagen_url
          ? <img src={c.imagen_url} alt={c.nombre} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .4s' }}
              onMouseEnter={e=>e.target.style.transform='scale(1.06)'}
              onMouseLeave={e=>e.target.style.transform='scale(1)'} />
          : <div style={{ width:'100%', height:'100%', background:`linear-gradient(135deg,${c.color_categoria||'#1a2e00'},#0d1117)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:56 }}>
              {c.icono_categoria||'📚'}
            </div>
        }
        {/* Overlay */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(15,26,0,.85) 0%, transparent 55%)' }}/>
        {/* Nivel */}
        <div style={{ position:'absolute', top:12, right:12 }}>
          <span className="badge" style={{ background:'rgba(0,0,0,.6)', color, backdropFilter:'blur(8px)', border:`1px solid ${color}40` }}>
            {label}
          </span>
        </div>
        {/* Categoría */}
        <div style={{ position:'absolute', bottom:10, left:14 }}>
          <span style={{ fontSize:11, color:'rgba(255,255,255,.7)', fontWeight:600, background:'rgba(0,0,0,.4)', padding:'3px 8px', borderRadius:99, backdropFilter:'blur(6px)' }}>
            {c.icono_categoria} {c.nombre_categoria}
          </span>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding:'16px 18px 18px' }}>
        <h3 style={{ fontSize:15, fontWeight:800, marginBottom:5, lineHeight:1.35, letterSpacing:'-0.01em' }} className="truncar">
          {c.nombre}
        </h3>
        <p style={{ fontSize:12, color:'var(--txt3)', marginBottom:12, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', lineHeight:1.5 }}>
          {c.descripcion}
        </p>

        {/* Profesor */}
        <p style={{ fontSize:12, color:'var(--txt2)', marginBottom:12, display:'flex', alignItems:'center', gap:5 }}>
          <span style={{ width:20, height:20, borderRadius:'50%', background:'var(--green3)', border:'1px solid rgba(152,202,63,.3)', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:10 }}>👨‍🏫</span>
          {c.nombre_profesor || 'Sin profesor'}
        </p>

        {/* Rating y stats */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:3 }}>
            {[...Array(5)].map((_,i)=>(
              <span key={i} style={{ fontSize:12, color:i<stars?'#fbbf24':'var(--border2)' }}>★</span>
            ))}
            <span style={{ fontSize:11, color:'var(--txt3)', marginLeft:4 }}>({c.total_calificaciones})</span>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <span style={{ fontSize:11, color:'var(--txt3)' }}>👥 {c.total_inscritos}</span>
            <span style={{ fontSize:11, color:'var(--txt3)' }}>⏱️ {c.duracion_horas}h</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
