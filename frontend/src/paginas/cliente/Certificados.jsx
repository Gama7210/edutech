import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

function DescargarCertificado({ cursoId }) {
  const [generando, setGenerando] = useState(false);

  const descargar = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Primero intentar desde localStorage (guardado al terminar el cuestionario)
    const cached = localStorage.getItem(`cert_${cursoId}`);
    if (cached) {
      const link = document.createElement('a');
      link.href = cached;
      link.download = 'certificado-edutech.pdf';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => document.body.removeChild(link), 100);
      return;
    }

    // Si no hay en cache, regenerar desde el servidor
    setGenerando(true);
    try {
      const { data } = await axios.post('/api/certificados/regenerar', { curso_id: cursoId });
      // Guardar en cache para la próxima vez
      try { localStorage.setItem(`cert_${cursoId}`, data.pdf); } catch(e) {}
      const link = document.createElement('a');
      link.href = data.pdf;
      link.download = 'certificado-edutech.pdf';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => document.body.removeChild(link), 100);
    } catch(err) {
      console.error(err);
    } finally { setGenerando(false); }
  };

  return (
    <button onClick={descargar} disabled={generando}
      className="btn btn-primary btn-sm" style={{ width:'100%' }}>
      {generando ? '⏳ Generando...' : '📥 Descargar certificado'}
    </button>
  );
}

export default function Certificados() {
  const [certificados, setCertificados] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    axios.get('/api/mis-certificados')
      .then(r => setCertificados(r.data.certificados || []))
      .finally(() => setCargando(false));
  }, []);

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1000, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 6 }}>🏆 Mis certificados</h1>
        <p style={{ color: 'var(--text-muted)' }}>{certificados.length} certificado{certificados.length !== 1 ? 's' : ''} obtenidos</p>
      </motion.div>

      {cargando ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {[...Array(3)].map((_, i) => <div key={i} className="shimmer" style={{ height: 200, borderRadius: 16 }} />)}
        </div>
      ) : certificados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🏆</div>
          <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Aún no tienes certificados</p>
          <p style={{ color: 'var(--text-muted)' }}>Completa un curso y aprueba el cuestionario para obtener tu certificado</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {certificados.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * .07 }}
              style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', border: '1px solid rgba(99,102,241,.3)', borderRadius: 20, padding: 24, position: 'relative', overflow: 'hidden' }}>
              {/* Decoración */}
              <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(99,102,241,.1)' }} />
              <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(99,102,241,.08)' }} />

              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(99,102,241,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🏆</div>
                  <div>
                    <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Certificado</p>
                    <p style={{ color: '#6366f1', fontWeight: 800, fontSize: 15 }}>EduTech</p>
                  </div>
                </div>

                <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 8, lineHeight: 1.4 }}>{c.nombre_curso}</h3>
                <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 12, marginBottom: 4 }}>👨‍🏫 {c.nombre_profesor}</p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 16 }}>
                  <div>
                    <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 11 }}>Calificación</p>
                    <p style={{ color: '#10b981', fontWeight: 800, fontSize: 22 }}>{c.calificacion}%</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 11 }}>Emisión</p>
                    <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 13 }}>
                      {new Date(c.fecha_emision).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                <p style={{ color: 'rgba(255,255,255,.3)', fontSize: 10, marginBottom: 14 }}>Folio: {c.folio}</p>

                {c.pdf_url && (
                  <a href={c.pdf_url} target="_blank" rel="noreferrer"
                    className="btn btn-primary btn-sm" style={{ width: '100%', textDecoration: 'none', display: 'flex', justifyContent: 'center' }}>
                    📥 Descargar certificado
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}