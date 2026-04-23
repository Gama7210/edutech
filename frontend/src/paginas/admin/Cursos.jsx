import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import AdminCuestionario from './Cuestionario.jsx';

/* ── Modal Curso ── */
function ModalCurso({ curso, profesores, categorias, onCerrar, onGuardado }) {
  const [form, setForm] = useState({ nombre:curso?.nombre||'', descripcion:curso?.descripcion||'', profesor_id:curso?.profesor_id||'', categoria_id:curso?.categoria_id||'', nivel:curso?.nivel||'basico' });
  const [archivo, setArchivo] = useState(null);
  const [preview, setPreview] = useState(curso?.imagen_url||null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const guardar = async e => {
    e.preventDefault(); setGuardando(true); setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v])=>v&&fd.append(k,v));
      if (archivo) fd.append('imagen',archivo);
      if (curso) await axios.put(`/api/cursos/${curso.id}`,fd,{headers:{'Content-Type':'multipart/form-data'}});
      else        await axios.post('/api/cursos',fd,{headers:{'Content-Type':'multipart/form-data'}});
      onGuardado();
    } catch(e){ setError(e.response?.data?.mensaje||'Error al guardar'); }
    finally { setGuardando(false); }
  };

  return (
    <div className="overlay" onClick={onCerrar}>
      <motion.div className="modal-box" style={{ maxWidth:560 }} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} onClick={e=>e.stopPropagation()}>
        <h2 style={{ fontWeight:900, fontSize:20, marginBottom:4, letterSpacing:'-0.02em' }}>{curso?'✏️ Editar curso':'➕ Nuevo curso'}</h2>
        <p style={{ color:'var(--txt3)', fontSize:13, marginBottom:22 }}>Complete la información del curso</p>

        <form onSubmit={guardar} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {/* Imagen portada */}
          <div onClick={()=>fileRef.current?.click()} style={{ cursor:'pointer', borderRadius:14, overflow:'hidden', height:150, background:preview?`url(${preview}) center/cover`:'var(--card2)', display:'flex', alignItems:'center', justifyContent:'center', border:'2px dashed var(--border2)', transition:'border-color .2s' }}
            onMouseEnter={e=>e.currentTarget.style.borderColor='var(--green)'}
            onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border2)'}>
            {!preview && <div style={{ textAlign:'center', color:'var(--txt3)' }}><div style={{ fontSize:30, marginBottom:6 }}>🖼️</div><p style={{ fontSize:13 }}>Clic para subir portada</p></div>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }}
            onChange={e=>{ const f=e.target.files[0]; if(!f) return; setArchivo(f); const r=new FileReader(); r.onload=ev=>setPreview(ev.target.result); r.readAsDataURL(f); }}/>

          <div><label className="input-label">Nombre del curso *</label><input value={form.nombre} onChange={e=>setForm(f=>({...f,nombre:e.target.value}))} className="input" required/></div>
          <div><label className="input-label">Descripción</label><textarea value={form.descripcion} onChange={e=>setForm(f=>({...f,descripcion:e.target.value}))} className="input" style={{ minHeight:80,resize:'vertical',fontSize:14 }}/></div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div><label className="input-label">Profesor</label>
              <select value={form.profesor_id} onChange={e=>setForm(f=>({...f,profesor_id:e.target.value}))} className="input">
                <option value="">Sin profesor</option>
                {profesores.map(p=><option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div><label className="input-label">Categoría</label>
              <select value={form.categoria_id} onChange={e=>setForm(f=>({...f,categoria_id:e.target.value}))} className="input">
                <option value="">Sin categoría</option>
                {categorias.map(c=><option key={c.id} value={c.id}>{c.icono} {c.nombre}</option>)}
              </select>
            </div>
          </div>

          <div><label className="input-label">Nivel</label>
            <select value={form.nivel} onChange={e=>setForm(f=>({...f,nivel:e.target.value}))} className="input">
              <option value="basico">🟢 Básico</option>
              <option value="intermedio">🟡 Intermedio</option>
              <option value="avanzado">🔴 Avanzado</option>
            </select>
          </div>

          {error && <p style={{ color:'var(--red)', fontSize:13 }}>⚠️ {error}</p>}
          <div style={{ display:'flex', gap:10, marginTop:4 }}>
            <button type="button" onClick={onCerrar} className="btn btn-ghost" style={{ flex:1 }}>Cancelar</button>
            <button type="submit" disabled={guardando} className="btn btn-green" style={{ flex:2 }}>
              {guardando?'Guardando...':curso?'💾 Actualizar':'➕ Crear curso'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ── Modal Lección ── */
function ModalLeccion({ leccion, cursoId, totalLecciones, onCerrar, onGuardado }) {
  const [form, setForm] = useState({
    titulo: leccion?.titulo||'',
    descripcion: leccion?.descripcion||'',
    orden: leccion?.orden||totalLecciones+1,
    duracion_seg: leccion?.duracion_seg||120,
    video_url_externa: leccion?.video_url||'',
  });
  const [archivo, setArchivo] = useState(null);
  const [modoUrl, setModoUrl] = useState(!!(leccion?.video_url && !leccion.video_url.startsWith('/uploads')));
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const guardar = async e => {
    e.preventDefault(); setGuardando(true); setError('');
    try {
      const fd = new FormData();
      fd.append('titulo', form.titulo);
      fd.append('descripcion', form.descripcion||'');
      fd.append('orden', form.orden);
      fd.append('duracion_seg', form.duracion_seg);
      fd.append('curso_id', cursoId);
      // Si usa URL externa, la manda como campo de texto
      if (modoUrl && form.video_url_externa.trim()) {
        fd.append('video_url_externa', form.video_url_externa.trim());
      } else if (archivo) {
        fd.append('video', archivo);
      }
      if (leccion) await axios.put(`/api/lecciones/${leccion.id}`, fd, { headers:{ 'Content-Type':'multipart/form-data' } });
      else         await axios.post('/api/lecciones', fd, { headers:{ 'Content-Type':'multipart/form-data' } });
      onGuardado();
    } catch(e) { setError(e.response?.data?.mensaje||'Error al guardar'); }
    finally { setGuardando(false); }
  };

  return (
    <div className="overlay" onClick={onCerrar}>
      <motion.div className="modal-box" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} onClick={e=>e.stopPropagation()}>
        <h2 style={{ fontWeight:900,fontSize:20,marginBottom:4,letterSpacing:'-0.02em' }}>{leccion?'✏️ Editar lección':'➕ Nueva lección'}</h2>
        <p style={{ color:'var(--txt3)',fontSize:13,marginBottom:22 }}>Video secuencial del curso</p>

        <form onSubmit={guardar} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div><label className="input-label">Título *</label><input value={form.titulo} onChange={e=>setForm(f=>({...f,titulo:e.target.value}))} className="input" required/></div>
          <div><label className="input-label">Descripción</label><textarea value={form.descripcion} onChange={e=>setForm(f=>({...f,descripcion:e.target.value}))} className="input" style={{ minHeight:70,resize:'vertical',fontSize:14 }}/></div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div><label className="input-label">Orden</label><input type="number" value={form.orden} onChange={e=>setForm(f=>({...f,orden:parseInt(e.target.value)}))} className="input" min={1} max={6}/></div>
            <div><label className="input-label">Duración (seg)</label><input type="number" value={form.duracion_seg} onChange={e=>setForm(f=>({...f,duracion_seg:parseInt(e.target.value)}))} className="input" min={60}/></div>
          </div>

          {/* Selector tipo de video */}
          <div>
            <label className="input-label">Tipo de video</label>
            <div style={{ display:'flex', gap:10, marginTop:6 }}>
              <button type="button" onClick={()=>setModoUrl(false)}
                className={modoUrl ? 'btn btn-ghost btn-sm' : 'btn btn-green btn-sm'} style={{ flex:1 }}>
                📁 Subir archivo MP4
              </button>
              <button type="button" onClick={()=>setModoUrl(true)}
                className={modoUrl ? 'btn btn-green btn-sm' : 'btn btn-ghost btn-sm'} style={{ flex:1 }}>
                🔗 Pegar URL
              </button>
            </div>
          </div>

          {/* Subir archivo */}
          {!modoUrl && (
            <>
              <div onClick={()=>fileRef.current?.click()}
                style={{ cursor:'pointer', padding:'16px', border:'2px dashed var(--border2)', borderRadius:12, textAlign:'center', background:'var(--card2)', transition:'border-color .2s' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='var(--green)'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border2)'}>
                <p style={{ color:archivo?'var(--green)':'var(--txt3)', fontSize:13 }}>
                  {archivo ? `📹 ${archivo.name}` : leccion?.video_url ? '📹 Video actual — clic para reemplazar' : '📹 Clic para subir video MP4 (máx 1GB)'}
                </p>
              </div>
              <input ref={fileRef} type="file" accept="video/*" style={{ display:'none' }} onChange={e=>setArchivo(e.target.files[0]||null)}/>
            </>
          )}

          {/* URL externa */}
          {modoUrl && (
            <div>
              <label className="input-label">URL del video</label>
              <input
                value={form.video_url_externa}
                onChange={e=>setForm(f=>({...f,video_url_externa:e.target.value}))}
                placeholder="https://drive.google.com/file/d/... o https://tu-servidor.com/video.mp4"
                className="input"
                style={{ fontSize:13 }}
              />
              <p style={{ fontSize:11, color:'var(--txt3)', marginTop:6 }}>
                Puedes usar Google Drive, Dropbox, OneDrive o cualquier URL directa de video MP4.
                En Google Drive: clic derecho → Obtener enlace → Cualquier persona con el enlace → Copiar enlace.
              </p>
            </div>
          )}

          {error && <p style={{ color:'var(--red)',fontSize:13 }}>⚠️ {error}</p>}
          {guardando && <p style={{ color:'var(--green)',fontSize:13 }}>⏳ {modoUrl ? 'Guardando...' : 'Subiendo video, puede tardar...'}</p>}

          <div style={{ display:'flex', gap:10 }}>
            <button type="button" onClick={onCerrar} className="btn btn-ghost" style={{ flex:1 }}>Cancelar</button>
            <button type="submit" disabled={guardando} className="btn btn-green" style={{ flex:2 }}>
              {guardando ? 'Guardando...' : leccion ? '💾 Actualizar' : '➕ Crear lección'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ── Lecciones del curso ── */
function LeccionesCurso({ cursoId, onEditar, onEliminar }) {
  const [lecciones, setLecciones] = useState([]);
  useEffect(()=>{ axios.get(`/api/cursos/${cursoId}`).then(r=>setLecciones(r.data.lecciones||[])); },[cursoId]);
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
      {lecciones.length===0 && <p style={{ color:'var(--txt3)',fontSize:13,textAlign:'center',padding:'10px 0' }}>No hay lecciones aún</p>}
      {lecciones.map((l,i)=>(
        <div key={l.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'var(--bg)', borderRadius:10, border:'1px solid var(--border)' }}>
          <span style={{ width:26,height:26,borderRadius:7,background:'linear-gradient(135deg,var(--green),var(--purple))',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,flexShrink:0 }}>{i+1}</span>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:13,fontWeight:600 }} className="truncar">{l.titulo}</p>
            <p style={{ fontSize:11,color:'var(--txt3)' }}>⏱️ {Math.floor(l.duracion_seg/60)}:{String(l.duracion_seg%60).padStart(2,'0')} min</p>
          </div>
          <button onClick={()=>onEditar(l)} className="btn btn-ghost btn-sm">✏️</button>
          <button onClick={()=>onEliminar(l.id)} className="btn btn-red btn-sm">🗑️</button>
        </div>
      ))}
    </div>
  );
}

/* ── Página principal ── */
export default function AdminCursos() {
  const [cursos, setCursos] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalCurso, setModalCurso] = useState(null);
  const [modalLeccion, setModalLeccion] = useState(null);
  const [modalCuestionario, setModalCuestionario] = useState(null);
  const [expandido, setExpandido] = useState(null);
  const [buscar, setBuscar] = useState('');

  const cargar = () => {
    Promise.all([axios.get('/api/cursos'), axios.get('/api/profesores'), axios.get('/api/categorias')])
      .then(([r1,r2,r3])=>{ setCursos(r1.data.cursos||[]); setProfesores(r2.data.profesores||[]); setCategorias(r3.data.categorias||[]); })
      .finally(()=>setCargando(false));
  };
  useEffect(cargar,[]);

  const eliminarCurso = async id=>{ if(!confirm('¿Eliminar?')) return; await axios.delete(`/api/cursos/${id}`); cargar(); };
  const eliminarLeccion = async id=>{ if(!confirm('¿Eliminar lección?')) return; await axios.delete(`/api/lecciones/${id}`); cargar(); };

  const filtrados = cursos.filter(c=>!buscar||c.nombre.toLowerCase().includes(buscar.toLowerCase()));

  return (
    <div style={{ padding:'32px 28px', maxWidth:1100, margin:'0 auto' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28, flexWrap:'wrap', gap:12 }}>
        <div>
          <p style={{ fontSize:11,fontWeight:700,color:'var(--green)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:4 }}>GESTIÓN</p>
          <h1 style={{ fontSize:26,fontWeight:900,letterSpacing:'-0.02em' }}>📚 Cursos</h1>
          <p style={{ color:'var(--txt3)',fontSize:14,marginTop:2 }}>{cursos.length} curso{cursos.length!==1?'s':''} en la plataforma</p>
        </div>
        <button onClick={()=>setModalCurso({})} className="btn btn-green">➕ Nuevo curso</button>
      </div>

      <input value={buscar} onChange={e=>setBuscar(e.target.value)} placeholder="🔍 Buscar cursos..." className="input" style={{ maxWidth:400,marginBottom:22 }}/>

      {cargando
        ? [...Array(3)].map((_,i)=><div key={i} className="shimmer" style={{ height:72,marginBottom:10 }}/>)
        : filtrados.length===0
          ? <div style={{ textAlign:'center',padding:'64px 0' }}><div style={{ fontSize:48,marginBottom:12 }}>📚</div><p style={{ fontWeight:700,color:'var(--txt2)' }}>No hay cursos aún</p></div>
          : filtrados.map((c,i)=>(
            <motion.div key={c.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*.04}}
              style={{ background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,overflow:'hidden',marginBottom:12 }}>

              {/* Fila del curso */}
              <div style={{ display:'flex',alignItems:'center',gap:14,padding:'16px 20px',cursor:'pointer' }} onClick={()=>setExpandido(expandido===c.id?null:c.id)}>
                <div style={{ width:50,height:50,borderRadius:10,overflow:'hidden',flexShrink:0 }}>
                  {c.imagen_url
                    ? <img src={c.imagen_url} alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }}/>
                    : <div style={{ width:'100%',height:'100%',background:`linear-gradient(135deg,${c.color_categoria||'var(--green)'},var(--purple))`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22 }}>{c.icono_categoria||'📚'}</div>
                  }
                </div>
                <div style={{ flex:1,minWidth:0 }}>
                  <p style={{ fontWeight:800,fontSize:15,marginBottom:2 }} className="truncar">{c.nombre}</p>
                  <p style={{ color:'var(--txt3)',fontSize:12 }}>
                    👨‍🏫 {c.nombre_profesor||'Sin profesor'} · 📹 {c.total_lecciones}/6 lecciones · 👥 {c.total_inscritos}
                  </p>
                </div>
                <div style={{ display:'flex',gap:8,flexShrink:0 }}>
                  <span className={`badge badge-${c.nivel==='basico'?'green':c.nivel==='intermedio'?'yellow':'red'}`}>{c.nivel}</span>
                  <button onClick={e=>{e.stopPropagation();setModalCurso(c);}} className="btn btn-ghost btn-sm">✏️</button>
                  <button onClick={e=>{e.stopPropagation();eliminarCurso(c.id);}} className="btn btn-red btn-sm">🗑️</button>
                  <span style={{ color:'var(--txt3)',fontSize:16,width:20,textAlign:'center' }}>{expandido===c.id?'▲':'▼'}</span>
                </div>
              </div>

              {/* Panel expandido */}
              <AnimatePresence>
                {expandido===c.id && (
                  <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}}
                    style={{ borderTop:'1px solid var(--border)',overflow:'hidden' }}>
                    <div style={{ padding:'18px 20px' }}>
                      {/* Botones lección y cuestionario */}
                      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14 }}>
                        <p style={{ fontWeight:700,fontSize:13,color:'var(--txt2)' }}>📹 Lecciones ({c.total_lecciones}/6 máximo)</p>
                        <div style={{ display:'flex',gap:8 }}>
                          <button onClick={()=>setModalCuestionario({id:c.id,nombre:c.nombre})}
                            className="btn btn-ghost btn-sm">
                            📋 Cuestionario
                          </button>
                          {c.total_lecciones<6 && (
                            <button onClick={()=>setModalLeccion({cursoId:c.id,total:c.total_lecciones})}
                              className="btn btn-green btn-sm">
                              ➕ Lección
                            </button>
                          )}
                        </div>
                      </div>
                      <LeccionesCurso cursoId={c.id}
                        onEditar={l=>setModalLeccion({...l,cursoId:c.id,total:c.total_lecciones})}
                        onEliminar={eliminarLeccion}/>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
      }

      <AnimatePresence>
        {modalCurso!==null && <ModalCurso curso={modalCurso.id?modalCurso:null} profesores={profesores} categorias={categorias} onCerrar={()=>setModalCurso(null)} onGuardado={()=>{setModalCurso(null);cargar();}}/>}
        {modalLeccion && <ModalLeccion leccion={modalLeccion.id?modalLeccion:null} cursoId={modalLeccion.cursoId} totalLecciones={modalLeccion.total} onCerrar={()=>setModalLeccion(null)} onGuardado={()=>{setModalLeccion(null);cargar();}}/>}
        {modalCuestionario && <AdminCuestionario cursoId={modalCuestionario.id} cursoNombre={modalCuestionario.nombre} onCerrar={()=>setModalCuestionario(null)}/>}
      </AnimatePresence>
    </div>
  );
}