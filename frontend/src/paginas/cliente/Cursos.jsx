import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import TarjetaCurso from '../../componentes/TarjetaCurso.jsx';

export default function Cursos() {
  const [cursos, setCursos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtro, setFiltro] = useState({ categoria: '', nivel: '', buscar: '' });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([axios.get('/api/cursos'), axios.get('/api/categorias')])
      .then(([r1, r2]) => { setCursos(r1.data.cursos || []); setCategorias(r2.data.categorias || []); })
      .finally(() => setCargando(false));
  }, []);

  const filtrados = cursos.filter(c => {
    const coincideBuscar = !filtro.buscar || c.nombre.toLowerCase().includes(filtro.buscar.toLowerCase()) || c.descripcion?.toLowerCase().includes(filtro.buscar.toLowerCase());
    const coincideCategoria = !filtro.categoria || String(c.categoria_id) === filtro.categoria;
    const coincideNivel = !filtro.nivel || c.nivel === filtro.nivel;
    return coincideBuscar && coincideCategoria && coincideNivel;
  });

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1200, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 6 }}>📚 Catálogo de cursos</h1>
        <p style={{ color: 'var(--text-muted)' }}>Cursos de Ingeniería en Sistemas Computacionales</p>
      </motion.div>

      {/* Filtros */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .1 }}
        style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
        <input value={filtro.buscar} onChange={e => setFiltro(f => ({ ...f, buscar: e.target.value }))}
          placeholder="🔍 Buscar cursos..." className="input"
          style={{ flex: 1, minWidth: 200, maxWidth: 400 }} />
        <select value={filtro.categoria} onChange={e => setFiltro(f => ({ ...f, categoria: e.target.value }))}
          className="input" style={{ width: 180 }}>
          <option value="">Todas las categorías</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.icono} {c.nombre}</option>)}
        </select>
        <select value={filtro.nivel} onChange={e => setFiltro(f => ({ ...f, nivel: e.target.value }))}
          className="input" style={{ width: 160 }}>
          <option value="">Todos los niveles</option>
          <option value="basico">🟢 Básico</option>
          <option value="intermedio">🟡 Intermedio</option>
          <option value="avanzado">🔴 Avanzado</option>
        </select>
        {(filtro.buscar || filtro.categoria || filtro.nivel) && (
          <button onClick={() => setFiltro({ categoria: '', nivel: '', buscar: '' })} className="btn btn-ghost">
            ✕ Limpiar
          </button>
        )}
      </motion.div>

      {/* Resultados */}
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
        {filtrados.length} curso{filtrados.length !== 1 ? 's' : ''} encontrado{filtrados.length !== 1 ? 's' : ''}
      </p>

      {cargando ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {[...Array(6)].map((_, i) => <div key={i} className="shimmer" style={{ height: 300, borderRadius: 16 }} />)}
        </div>
      ) : filtrados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
          <p style={{ fontWeight: 700, marginBottom: 8 }}>No se encontraron cursos</p>
          <p style={{ color: 'var(--text-muted)' }}>Intenta con otros filtros</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {filtrados.map((c, i) => <TarjetaCurso key={c.id} curso={c} delay={i * .05} />)}
        </div>
      )}
    </div>
  );
}
