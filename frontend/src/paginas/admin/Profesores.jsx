import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

function ModalProfesor({ profesor, onCerrar, onGuardado }) {
  const [form, setForm] = useState({ nombre:profesor?.nombre||'', correo:profesor?.correo||'', especialidad:profesor?.especialidad||'', bio:profesor?.bio||'' });
  const [archivo, setArchivo] = useState(null);
  const [preview, setPreview] = useState(profesor?.avatar_url||null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const guardar = async e => {
    e.preventDefault(); setGuardando(true); setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v])=>fd.append(k,v));
      if (archivo) fd.append('avatar',archivo);
      if (profesor) await axios.put(`/api/profesores/${profesor.id}`,fd,{headers:{'Content-Type':'multipart/form-data'}});
      else          await axios.post('/api/profesores',fd,{headers:{'Content-Type':'multipart/form-data'}});
      onGuardado();
    } catch(e){ setError(e.response?.data?.mensaje||'Error'); }
    finally { setGuardando(false); }
  };

  return (
    <div className="overlay" onClick={onCerrar}>
      <motion.div className="modal-box" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} onClick={e=>e.stopPropagation()}>
        <h2 style={{ fontWeight:900,fontSize:20,marginBottom:4,letterSpacing:'-0.02em' }}>{profesor?'✏️ Editar profesor':'➕ Nuevo profesor'}</h2>
        <p style={{ color:'var(--txt3)',fontSize:13,marginBottom:22 }}>Información del docente</p>
        <form onSubmit={guardar} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ position:'relative', cursor:'pointer' }} onClick={()=>fileRef.current?.click()}>
              {preview ? <img src={preview} alt="" style={{ width:64,height:64,borderRadius:'50%',objectFit:'cover' }}/>
                : <div className="avatar" style={{ width:64,height:64,fontSize:22 }}>{form.nombre?.[0]?.toUpperCase()||'?'}</div>}
              <div style={{ position:'absolute',bottom:0,right:0,width:22,height:22,borderRadius:'50%',background:'var(--green)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11 }}>📷</div>
            </div>
            <button type="button" onClick={()=>fileRef.current?.click()} className="btn btn-ghost btn-sm">Subir foto</button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e=>{ const f=e.target.files[0]; if(!f) return; setArchivo(f); const r=new FileReader(); r.onload=ev=>setPreview(ev.target.result); r.readAsDataURL(f); }}/>
          </div>
          {[{k:'nombre',l:'Nombre completo *',req:true},{k:'correo',l:'Correo',req:true,t:'email'},{k:'especialidad',l:'Especialidad *',req:true}].map(({k,l,req,t})=>(
            <div key={k}><label className="input-label">{l}</label><input type={t||'text'} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} className="input" required={req}/></div>
          ))}
          <div><label className="input-label">Biografía</label><textarea value={form.bio} onChange={e=>setForm(f=>({...f,bio:e.target.value}))} className="input" style={{ minHeight:80,resize:'vertical',fontSize:14 }}/></div>
          {error && <p style={{ color:'var(--red)',fontSize:13 }}>⚠️ {error}</p>}
          <div style={{ display:'flex', gap:10 }}>
            <button type="button" onClick={onCerrar} className="btn btn-ghost" style={{ flex:1 }}>Cancelar</button>
            <button type="submit" disabled={guardando} className="btn btn-green" style={{ flex:2 }}>{guardando?'Guardando...':profesor?'💾 Actualizar':'➕ Crear'}</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function AdminProfesores() {
  const [profesores, setProfesores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(null);
  const [buscar, setBuscar] = useState('');

  const cargar = ()=>{ axios.get('/api/profesores').then(r=>setProfesores(r.data.profesores||[])).finally(()=>setCargando(false)); };
  useEffect(cargar,[]);
  const eliminar = async id=>{ if(!confirm('¿Eliminar?')) return; await axios.delete(`/api/profesores/${id}`); cargar(); };
  const filtrados = profesores.filter(p=>!buscar||p.nombre.toLowerCase().includes(buscar.toLowerCase())||p.especialidad.toLowerCase().includes(buscar.toLowerCase()));

  return (
    <div style={{ padding:'32px 28px', maxWidth:1000, margin:'0 auto' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28, flexWrap:'wrap', gap:12 }}>
        <div>
          <p style={{ fontSize:11,fontWeight:700,color:'var(--green)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:4 }}>GESTIÓN</p>
          <h1 style={{ fontSize:26,fontWeight:900,letterSpacing:'-0.02em' }}>👨‍🏫 Profesores</h1>
        </div>
        <button onClick={()=>setModal({})} className="btn btn-green">➕ Nuevo profesor</button>
      </div>
      <input value={buscar} onChange={e=>setBuscar(e.target.value)} placeholder="🔍 Buscar..." className="input" style={{ maxWidth:380,marginBottom:20 }}/>
      {cargando
        ? <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:14 }}>{[...Array(4)].map((_,i)=><div key={i} className="shimmer" style={{ height:140 }}/>)}</div>
        : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:14 }}>
          {filtrados.map((p,i)=>(
            <motion.div key={p.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*.05}}
              style={{ background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,padding:20 }}>
              <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:12 }}>
                {p.avatar_url ? <img src={p.avatar_url} alt="" style={{ width:50,height:50,borderRadius:'50%',objectFit:'cover' }}/> : <div className="avatar" style={{ width:50,height:50,fontSize:18 }}>{p.nombre[0]}</div>}
                <div style={{ minWidth:0 }}>
                  <p style={{ fontWeight:800,fontSize:14 }} className="truncar">{p.nombre}</p>
                  <p style={{ color:'var(--txt3)',fontSize:12 }} className="truncar">{p.especialidad}</p>
                </div>
              </div>
              <p style={{ color:'var(--txt3)',fontSize:12,marginBottom:3 }}>✉️ {p.correo}</p>
              <p style={{ color:'var(--txt3)',fontSize:12,marginBottom:14 }}>📚 {p.total_cursos} curso{p.total_cursos!==1?'s':''}</p>
              <div style={{ display:'flex',gap:8 }}>
                <button onClick={()=>setModal(p)} className="btn btn-ghost btn-sm" style={{ flex:1 }}>✏️ Editar</button>
                <button onClick={()=>eliminar(p.id)} className="btn btn-red btn-sm" style={{ flex:1 }}>🗑️</button>
              </div>
            </motion.div>
          ))}
        </div>
      }
      <AnimatePresence>
        {modal!==null && <ModalProfesor profesor={modal.id?modal:null} onCerrar={()=>setModal(null)} onGuardado={()=>{setModal(null);cargar();}}/>}
      </AnimatePresence>
    </div>
  );
}
