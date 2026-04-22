import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function AdminPanel() {
  const navegar = useNavigate();
  const [stats, setStats] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(()=>{ axios.get('/api/cursos/estadisticas').then(r=>setStats(r.data)).finally(()=>setCargando(false)); },[]);

  const kpis = stats ? [
    { icon:'📚', label:'Cursos',        val:stats.total_cursos,      color:'var(--green)',  bg:'rgba(152,202,63,.1)', ruta:'/admin/cursos' },
    { icon:'👥', label:'Usuarios',       val:stats.total_usuarios,    color:'#60a5fa',      bg:'rgba(59,130,246,.1)',  ruta:'/admin/usuarios' },
    { icon:'📋', label:'Inscripciones',  val:stats.total_inscritos,   color:'#fbbf24',      bg:'rgba(234,179,8,.1)',   ruta:'/admin/reportes' },
    { icon:'✅', label:'Completados',   val:stats.total_completados, color:'#a78bfa',      bg:'rgba(124,58,237,.1)', ruta:'/admin/reportes' },
  ] : [];

  const acciones = [
    { icon:'➕', label:'Nuevo curso',     color:'var(--green)',  ruta:'/admin/cursos' },
    { icon:'👨‍🏫', label:'Nuevo profesor', color:'#60a5fa',       ruta:'/admin/profesores' },
    { icon:'📈', label:'Ver reportes',    color:'#fbbf24',      ruta:'/admin/reportes' },
    { icon:'👥', label:'Ver usuarios',    color:'#a78bfa',      ruta:'/admin/usuarios' },
  ];

  return (
    <div style={{ padding:'32px 28px', maxWidth:1200, margin:'0 auto' }}>

      {/* Header */}
      <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} style={{ marginBottom:32 }}>
        <p style={{ fontSize:11, fontWeight:700, color:'var(--green)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:4 }}>PANEL DE CONTROL</p>
        <h1 style={{ fontSize:30, fontWeight:900, letterSpacing:'-0.03em' }}>Dashboard</h1>
        <p style={{ color:'var(--txt3)', fontSize:15, marginTop:4 }}>Resumen general de EduTech</p>
      </motion.div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16, marginBottom:36 }}>
        {cargando
          ? [...Array(4)].map((_,i)=><div key={i} className="shimmer" style={{ height:100 }}/>)
          : kpis.map((k,i)=>(
            <motion.div key={i} initial={{opacity:0,scale:.9}} animate={{opacity:1,scale:1}} transition={{delay:i*.06}}
              whileHover={{y:-3,cursor:'pointer'}} onClick={()=>navegar(k.ruta)}
              style={{ background:k.bg, border:`1px solid ${k.color}20`, borderRadius:18, padding:'20px 24px', display:'flex', alignItems:'center', gap:16, transition:'all .2s' }}>
              <div style={{ fontSize:32 }}>{k.icon}</div>
              <div>
                <p style={{ fontSize:32, fontWeight:900, color:k.color, lineHeight:1 }}>{k.val}</p>
                <p style={{ fontSize:12, color:'var(--txt3)', marginTop:3 }}>{k.label}</p>
              </div>
            </motion.div>
          ))
        }
      </div>

      {/* Acciones rápidas */}
      <div style={{ marginBottom:36 }}>
        <h2 style={{ fontSize:16, fontWeight:800, marginBottom:16, letterSpacing:'-0.01em' }}>⚡ Acciones rápidas</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:14 }}>
          {acciones.map((a,i)=>(
            <motion.div key={i} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:.2+i*.06}}
              whileHover={{y:-3}} onClick={()=>navegar(a.ruta)}
              style={{ background:'var(--card)', border:`1px solid ${a.color}20`, borderRadius:16, padding:'18px 20px', cursor:'pointer', transition:'all .2s' }}>
              <div style={{ fontSize:28, marginBottom:10 }}>{a.icon}</div>
              <p style={{ fontWeight:700, fontSize:14, color:a.color }}>{a.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tabla cursos populares */}
      {stats?.cursos_populares?.length>0 && (
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:.3}}
          style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:20, padding:24 }}>
          <h2 style={{ fontSize:16, fontWeight:800, marginBottom:16 }}>🔥 Cursos más populares</h2>
          <table className="tabla">
            <thead><tr><th>Curso</th><th>Inscritos</th><th>Calificación</th></tr></thead>
            <tbody>
              {stats.cursos_populares.map((c,i)=>(
                <tr key={i}>
                  <td style={{ fontWeight:600 }}>{c.nombre}</td>
                  <td><span className="badge badge-green">👥 {c.inscritos}</span></td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                      <span style={{ color:'#fbbf24' }}>★</span>
                      <span style={{ fontWeight:700 }}>{parseFloat(c.promedio).toFixed(1)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}
