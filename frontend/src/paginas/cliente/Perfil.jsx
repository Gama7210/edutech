import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../contexto/ContextoAuth.jsx';

export default function Perfil() {
  const { usuario, actualizarUsuario } = useAuth();
  const [form, setForm] = useState({ nombre: usuario?.nombre || '', tema: usuario?.tema || 'oscuro' });
  const [pass, setPass] = useState({ actual: '', nueva: '', confirmar: '' });
  const [preview, setPreview] = useState(null);
  const [archivo, setArchivo] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [cambiandoPass, setCambiandoPass] = useState(false);
  const [msgPerfil, setMsgPerfil] = useState(null);
  const [msgPass, setMsgPass] = useState(null);
  const fileRef = useRef(null);

  const iniciales = usuario?.nombre?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'U';

  const seleccionarImagen = e => {
    const f = e.target.files[0];
    if (!f) return;
    setArchivo(f);
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(f);
  };

  const guardarPerfil = async e => {
    e.preventDefault();
    setGuardando(true); setMsgPerfil(null);
    try {
      const fd = new FormData();
      fd.append('nombre', form.nombre);
      fd.append('tema', form.tema);
      if (archivo) fd.append('avatar', archivo);
      const { data } = await axios.put('/api/auth/perfil', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      actualizarUsuario(data.usuario);
      setMsgPerfil({ ok: true, txt: '✅ Perfil actualizado correctamente' });
      setArchivo(null);
    } catch (e) {
      setMsgPerfil({ ok: false, txt: e.response?.data?.mensaje || 'Error al actualizar' });
    } finally { setGuardando(false); }
  };

  const cambiarContrasena = async e => {
    e.preventDefault();
    if (pass.nueva !== pass.confirmar) { setMsgPass({ ok: false, txt: 'Las contraseñas no coinciden' }); return; }
    setCambiandoPass(true); setMsgPass(null);
    try {
      await axios.post('/api/auth/cambiar-contrasena', { contrasena_actual: pass.actual, nueva_contrasena: pass.nueva });
      setMsgPass({ ok: true, txt: '✅ Contraseña actualizada' });
      setPass({ actual: '', nueva: '', confirmar: '' });
    } catch (e) {
      setMsgPass({ ok: false, txt: e.response?.data?.mensaje || 'Error al cambiar contraseña' });
    } finally { setCambiandoPass(false); }
  };

  const temas = [
    { val: 'oscuro', label: '🌙 Oscuro', bg: '#0f172a', text: '#f1f5f9' },
    { val: 'claro',  label: '☀️ Claro',  bg: '#f8fafc', text: '#0f172a' },
  ];

  return (
    <div style={{ padding: '32px 28px', maxWidth: 700, margin: '0 auto' }}>
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ fontSize: 28, fontWeight: 900, marginBottom: 28 }}>👤 Mi perfil</motion.h1>

      {/* Perfil */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: 28, marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Información personal</h2>

        <form onSubmit={guardarPerfil} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileRef.current?.click()}>
              {preview || usuario?.avatar_url
                ? <img src={preview || usuario.avatar_url} alt="" className="avatar" style={{ width: 80, height: 80 }} />
                : <div className="avatar" style={{ width: 80, height: 80, fontSize: 26, background: 'var(--accent)', color: '#fff' }}>{iniciales}</div>
              }
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>
                📷
              </div>
            </div>
            <div>
              <p style={{ fontWeight: 600 }}>{usuario?.nombre}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{usuario?.correo}</p>
              <button type="button" onClick={() => fileRef.current?.click()}
                className="btn btn-ghost btn-sm" style={{ marginTop: 6 }}>
                Cambiar foto
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={seleccionarImagen} style={{ display: 'none' }} />
            </div>
          </div>

          {/* Nombre */}
          <div className="input-group">
            <label className="input-label">Nombre completo</label>
            <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              className="input" required style={{ fontSize: 16 }} />
          </div>

          {/* Tema */}
          <div>
            <p className="input-label" style={{ marginBottom: 10 }}>Tema de la aplicación</p>
            <div style={{ display: 'flex', gap: 12 }}>
              {temas.map(t => (
                <button key={t.val} type="button" onClick={() => setForm(f => ({ ...f, tema: t.val }))}
                  style={{ flex: 1, padding: '14px 16px', borderRadius: 12, border: `2px solid ${form.tema === t.val ? 'var(--accent)' : 'var(--border)'}`, background: t.bg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all .2s' }}>
                  <span style={{ color: t.text, fontWeight: 600, fontSize: 14 }}>{t.label}</span>
                  {form.tema === t.val && <span style={{ color: 'var(--accent)' }}>✓</span>}
                </button>
              ))}
            </div>
          </div>

          {msgPerfil && (
            <p style={{ color: msgPerfil.ok ? 'var(--success)' : 'var(--danger)', fontSize: 14 }}>{msgPerfil.txt}</p>
          )}

          <button type="submit" disabled={guardando} className="btn btn-primary">
            {guardando ? 'Guardando...' : '💾 Guardar cambios'}
          </button>
        </form>
      </motion.div>

      {/* Cambiar contraseña */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 }}
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: 28 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>🔐 Cambiar contraseña</h2>

        <form onSubmit={cambiarContrasena} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { key: 'actual',    label: 'Contraseña actual' },
            { key: 'nueva',     label: 'Nueva contraseña' },
            { key: 'confirmar', label: 'Confirmar nueva contraseña' },
          ].map(({ key, label }) => (
            <div key={key} className="input-group">
              <label className="input-label">{label}</label>
              <input type="password" value={pass[key]} onChange={e => setPass(p => ({ ...p, [key]: e.target.value }))}
                className="input" required minLength={key !== 'actual' ? 6 : undefined} style={{ fontSize: 16 }} />
            </div>
          ))}

          {msgPass && (
            <p style={{ color: msgPass.ok ? 'var(--success)' : 'var(--danger)', fontSize: 14 }}>{msgPass.txt}</p>
          )}

          <button type="submit" disabled={cambiandoPass} className="btn btn-primary">
            {cambiandoPass ? 'Cambiando...' : '🔑 Cambiar contraseña'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
