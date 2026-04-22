import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexto/ContextoAuth.jsx';
import axios from 'axios';

export default function Auth({ modo = 'login' }) {
  const [form, setForm] = useState({ nombre:'', correo:'', contrasena:'', confirmar:'' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [verPass, setVerPass] = useState(false);
  const { iniciarSesion } = useAuth();
  const navegar = useNavigate();
  const esLogin = modo === 'login';

  const cambiar = e => setForm(f=>({...f,[e.target.name]:e.target.value}));

  const enviar = async e => {
    e.preventDefault(); setError('');
    if (!esLogin && form.contrasena !== form.confirmar) { setError('Las contraseñas no coinciden'); return; }
    setCargando(true);
    try {
      if (esLogin) { await iniciarSesion(form.correo, form.contrasena); navegar('/'); }
      else {
        const { data } = await axios.post('/api/auth/registrar', { nombre:form.nombre, correo:form.correo, contrasena:form.contrasena });
        localStorage.setItem('edu_token', data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        navegar('/'); window.location.reload();
      }
    } catch(e) { setError(e.response?.data?.mensaje || 'Error al procesar'); }
    finally { setCargando(false); }
  };

  const features = [
    { icon:'🎯', t:'Cursos de ISC estructurados' },
    { icon:'📹', t:'Videos en secuencia progresiva' },
    { icon:'📋', t:'Cuestionarios y exámenes' },
    { icon:'🏆', t:'Certificados al completar' },
  ];

  return (
    <div style={{ minHeight:'100dvh', display:'flex', background:'var(--bg)', overflow:'auto' }}>

      {/* Panel izquierdo decorativo */}
      <div style={{ flex:1, minWidth:420, display:'none', position:'relative', overflow:'hidden', background:'linear-gradient(135deg,#0f1a00 0%,#1a2e00 40%,#0d1117 100%)' }} className="auth-left">
        {/* Círculos decorativos */}
        {[[300,'-15%','5%',0],[200,'60%','15%',1],[350,'-10%','55%',2],[180,'70%','60%',3],[250,'30%','80%',4]].map(([s,l,t,i])=>(
          <div key={i} style={{ position:'absolute', width:s, height:s, borderRadius:'50%', left:l, top:t, background:`radial-gradient(circle,rgba(152,202,63,0.${[6,4,3,2,5][i]}) 0%,transparent 70%)`, animation:`float ${[7,9,6,8,10][i]}s ease-in-out infinite`, animationDelay:`${i*0.8}s` }}/>
        ))}

        <div style={{ position:'relative', zIndex:1, padding:'48px 48px', height:'100%', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:56 }}>
              <div style={{ width:44, height:44, borderRadius:12, background:'linear-gradient(135deg,var(--green),var(--purple))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>🎓</div>
              <span style={{ fontWeight:900, fontSize:22, color:'#fff' }}>
                <span style={{ color:'var(--green)' }}>Edu</span>Tech
              </span>
            </div>
            <h1 style={{ fontSize:42, fontWeight:900, color:'#fff', lineHeight:1.1, marginBottom:16, letterSpacing:'-0.03em' }}>
              Aprende sin<br/><span style={{ color:'var(--green)' }}>límites</span>
            </h1>
            <p style={{ color:'rgba(255,255,255,.6)', fontSize:17, lineHeight:1.6, maxWidth:380 }}>
              La plataforma educativa diseñada para Ingeniería en Sistemas Computacionales
            </p>
          </div>
          <div>
            {features.map((f,i)=>(
              <motion.div key={i} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:.3+i*.1}}
                style={{ display:'flex', alignItems:'center', gap:14, marginBottom:18 }}>
                <div style={{ width:38, height:38, borderRadius:10, background:'rgba(152,202,63,.15)', border:'1px solid rgba(152,202,63,.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{f.icon}</div>
                <span style={{ color:'rgba(255,255,255,.8)', fontSize:15 }}>{f.t}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho — form */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'32px 24px', overflowY:'auto', background:'var(--bg)' }}>
        <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} style={{ width:'100%', maxWidth:420 }}>

          {/* Logo móvil */}
          <div style={{ textAlign:'center', marginBottom:36 }}>
            <div style={{ width:56, height:56, borderRadius:16, background:'linear-gradient(135deg,var(--green),var(--purple))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, margin:'0 auto 14px' }}>🎓</div>
            <h1 style={{ fontSize:26, fontWeight:900, letterSpacing:'-0.02em' }}>
              {esLogin ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
            </h1>
            <p style={{ color:'var(--txt3)', fontSize:14, marginTop:4 }}>
              {esLogin ? 'Inicia sesión para continuar aprendiendo' : 'Comienza tu camino en EduTech'}
            </p>
          </div>

          <form onSubmit={enviar} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <AnimatePresence>
              {!esLogin && (
                <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}>
                  <label className="input-label">Nombre completo</label>
                  <input name="nombre" value={form.nombre} onChange={cambiar} required
                    placeholder="Tu nombre completo" className="input" />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="input-label">Correo electrónico</label>
              <input name="correo" type="email" value={form.correo} onChange={cambiar} required
                placeholder="tu@correo.com" className="input" />
            </div>

            <div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <label className="input-label" style={{ margin:0 }}>Contraseña</label>
                {esLogin && <Link to="/recuperar" style={{ fontSize:12, color:'var(--green)', textDecoration:'none', fontWeight:600 }}>¿Olvidaste tu contraseña?</Link>}
              </div>
              <div style={{ position:'relative' }}>
                <input name="contrasena" type={verPass?'text':'password'} value={form.contrasena} onChange={cambiar}
                  required placeholder="••••••••" className="input" style={{ paddingRight:44 }} />
                <button type="button" onClick={()=>setVerPass(v=>!v)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:17, color:'var(--txt3)' }}>
                  {verPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {!esLogin && (
                <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}>
                  <label className="input-label">Confirmar contraseña</label>
                  <input name="confirmar" type="password" value={form.confirmar} onChange={cambiar}
                    required placeholder="••••••••" className="input" />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.div initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                  style={{ padding:'12px 14px', background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.25)', borderRadius:10, color:'#f87171', fontSize:13, fontWeight:500 }}>
                  ⚠️ {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button type="submit" disabled={cargando} whileTap={{scale:.97}}
              className="btn btn-green btn-lg" style={{ width:'100%', marginTop:4 }}>
              {cargando
                ? <><div style={{ width:18, height:18, border:'2px solid rgba(0,0,0,.3)', borderTopColor:'#0e1800', borderRadius:'50%', animation:'spin .7s linear infinite' }}/> Procesando...</>
                : esLogin ? '🚀 Iniciar sesión' : '✨ Crear cuenta gratis'}
            </motion.button>
          </form>

          <p style={{ textAlign:'center', marginTop:24, color:'var(--txt3)', fontSize:14 }}>
            {esLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <Link to={esLogin?'/registro':'/login'} style={{ color:'var(--green)', fontWeight:700, textDecoration:'none' }}>
              {esLogin ? 'Regístrate gratis' : 'Inicia sesión'}
            </Link>
          </p>
        </motion.div>
      </div>

      <style>{`@media(min-width:900px){.auth-left{display:flex!important}}`}</style>
    </div>
  );
}
