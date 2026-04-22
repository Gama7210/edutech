import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexto/ContextoAuth.jsx';

const NAV_CLIENTE = [
  { a:'/',             icon:'🏠', label:'Inicio'       },
  { a:'/cursos',       icon:'🎯', label:'Explorar'     },
  { a:'/mis-cursos',   icon:'▶️',  label:'Mis cursos'  },
  { a:'/certificados', icon:'🏆', label:'Certificados' },
  { a:'/perfil',       icon:'👤', label:'Perfil'       },
];
const NAV_ADMIN = [
  { a:'/admin',            icon:'📊', label:'Dashboard'  },
  { a:'/admin/cursos',     icon:'📚', label:'Cursos'     },
  { a:'/admin/profesores', icon:'👨‍🏫', label:'Profesores' },
  { a:'/admin/usuarios',   icon:'👥', label:'Usuarios'   },
  { a:'/admin/reportes',   icon:'📈', label:'Reportes'   },
];

export default function Plantilla() {
  const { usuario, cerrarSesion } = useAuth();
  const navegar = useNavigate();
  const loc = useLocation();
  const [drawer, setDrawer] = useState(false);
  const [mob, setMob] = useState(window.innerWidth < 900);
  const esAdmin = usuario?.rol === 'admin';
  const links = esAdmin ? NAV_ADMIN : NAV_CLIENTE;
  const ini = usuario?.nombre?.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase() || 'U';

  useEffect(()=>{ const h=()=>setMob(window.innerWidth<900); window.addEventListener('resize',h); return()=>window.removeEventListener('resize',h); },[]);
  useEffect(()=>setDrawer(false),[loc.pathname]);

  const SidebarContent = () => (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', padding:'0 0 16px' }}>

      {/* Logo */}
      <div style={{ padding:'24px 20px 20px', borderBottom:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,var(--green),var(--purple))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🎓</div>
          <div>
            <p style={{ fontWeight:900, fontSize:17, letterSpacing:'-0.02em' }}>
              <span style={{ color:'var(--green)' }}>Edu</span>Tech
            </p>
            <p style={{ fontSize:10, color:'var(--txt3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.06em' }}>
              {esAdmin ? 'Panel Admin' : 'Plataforma'}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'12px 10px', overflowY:'auto' }}>
        <p style={{ fontSize:10, fontWeight:700, color:'var(--txt3)', textTransform:'uppercase', letterSpacing:'.08em', padding:'4px 10px 10px' }}>
          {esAdmin ? 'Administración' : 'Menú principal'}
        </p>
        {links.map(({a,icon,label})=>(
          <NavLink key={a} to={a} end={a==='/'||a==='/admin'}
            style={({isActive})=>({
              display:'flex', alignItems:'center', gap:11, padding:'10px 12px',
              borderRadius:10, textDecoration:'none', marginBottom:2,
              color: isActive ? 'var(--txt)' : 'var(--txt3)',
              background: isActive ? 'linear-gradient(90deg,rgba(152,202,63,.15),rgba(152,202,63,.05))' : 'transparent',
              fontWeight: isActive ? 700 : 500, fontSize:14,
              borderLeft: isActive ? '2px solid var(--green)' : '2px solid transparent',
              transition:'all .15s',
            })}>
            <span style={{ fontSize:16 }}>{icon}</span>{label}
          </NavLink>
        ))}

        <div className="divider" />

        {esAdmin ? (
          <button onClick={()=>navegar('/cursos')}
            style={{ display:'flex', alignItems:'center', gap:11, padding:'10px 12px', borderRadius:10, width:'100%', background:'none', border:'none', cursor:'pointer', color:'var(--txt3)', fontSize:14, fontFamily:'inherit', fontWeight:500, borderLeft:'2px solid transparent' }}>
            <span style={{ fontSize:16 }}>🎓</span> Vista cliente
          </button>
        ) : usuario?.rol==='admin' && (
          <button onClick={()=>navegar('/admin')}
            style={{ display:'flex', alignItems:'center', gap:11, padding:'10px 12px', borderRadius:10, width:'100%', background:'linear-gradient(90deg,rgba(124,58,237,.15),rgba(124,58,237,.05))', border:'none', cursor:'pointer', color:'#a78bfa', fontSize:14, fontFamily:'inherit', fontWeight:700, borderLeft:'2px solid var(--purple)' }}>
            <span style={{ fontSize:16 }}>⚙️</span> Panel admin
          </button>
        )}
      </nav>

      {/* Usuario */}
      <div style={{ padding:'12px 12px 0', borderTop:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 10px', borderRadius:12, background:'var(--card2)', marginBottom:8 }}>
          {usuario?.avatar_url
            ? <img src={usuario.avatar_url} alt="" className="avatar" style={{ width:36, height:36 }} />
            : <div className="avatar" style={{ width:36, height:36, fontSize:13 }}>{ini}</div>
          }
          <div style={{ minWidth:0, flex:1 }}>
            <p style={{ fontSize:13, fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{usuario?.nombre}</p>
            <p style={{ fontSize:11, color:'var(--txt3)' }}>{esAdmin ? '👑 Admin' : '🎓 Estudiante'}</p>
          </div>
        </div>
        <button onClick={cerrarSesion} className="btn btn-ghost btn-sm" style={{ width:'100%' }}>
          🚪 Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display:'flex', height:'100dvh', overflow:'hidden', background:'var(--bg)' }}>

      {/* Sidebar desktop */}
      {!mob && (
        <aside style={{ width:248, height:'100%', background:'var(--bg2)', borderRight:'1px solid var(--border)', flexShrink:0 }}>
          <SidebarContent />
        </aside>
      )}

      {/* Drawer móvil */}
      <AnimatePresence>
        {mob && drawer && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              onClick={()=>setDrawer(false)}
              style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.7)', zIndex:200, backdropFilter:'blur(6px)' }}/>
            <motion.aside initial={{x:-248}} animate={{x:0}} exit={{x:-248}}
              transition={{type:'spring',damping:30,stiffness:300}}
              style={{ position:'fixed', left:0, top:0, bottom:0, width:248, background:'var(--bg2)', borderRight:'1px solid var(--border)', zIndex:201 }}>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>
        {mob && (
          <div style={{ height:54, background:'var(--bg2)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', padding:'0 16px', gap:12, flexShrink:0 }}>
            <button onClick={()=>setDrawer(true)} className="btn btn-ghost btn-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
              </svg>
            </button>
            <span style={{ fontWeight:900, fontSize:15 }}>
              <span style={{ color:'var(--green)' }}>Edu</span>Tech
            </span>
          </div>
        )}
        <main style={{ flex:1, overflowY:'auto', background:'var(--bg)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
