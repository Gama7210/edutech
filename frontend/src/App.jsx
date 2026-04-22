import { Routes, Route, Navigate } from 'react-router-dom';
import { ProveedorAuth, useAuth } from './contexto/ContextoAuth.jsx';

// Auth
import Auth       from './paginas/Auth.jsx';
import Recuperar  from './paginas/Recuperar.jsx';
import Restablecer from './paginas/Restablecer.jsx';

// Layout
import Plantilla  from './componentes/Plantilla.jsx';

// Cliente
import Inicio     from './paginas/cliente/Inicio.jsx';
import Cursos     from './paginas/cliente/Cursos.jsx';
import Curso      from './paginas/cliente/Curso.jsx';
import Leccion    from './paginas/cliente/Leccion.jsx';
import Cuestionario from './paginas/cliente/Cuestionario.jsx';
import Resultados from './paginas/cliente/Resultados.jsx';
import MisCursos  from './paginas/cliente/MisCursos.jsx';
import Certificados from './paginas/cliente/Certificados.jsx';
import Perfil     from './paginas/cliente/Perfil.jsx';

// Admin
import AdminPanel     from './paginas/admin/Panel.jsx';
import AdminCursos    from './paginas/admin/Cursos.jsx';
import AdminCuestionario from './paginas/admin/Cuestionario.jsx';
import AdminProfesores from './paginas/admin/Profesores.jsx';
import AdminUsuarios  from './paginas/admin/Usuarios.jsx';
import AdminReportes  from './paginas/admin/Reportes.jsx';

function Cargando() {
  return (
    <div style={{ height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16, animation: 'float 2s ease-in-out infinite' }}>🎓</div>
        <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto' }} />
      </div>
    </div>
  );
}

function RutaPrivada({ children, soloAdmin = false }) {
  const { usuario, cargando } = useAuth();
  if (cargando) return <Cargando />;
  if (!usuario) return <Navigate to="/login" replace />;
  if (soloAdmin && usuario.rol !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function RutaPublica({ children }) {
  const { usuario, cargando } = useAuth();
  if (cargando) return <Cargando />;
  if (usuario) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <ProveedorAuth>
      <Routes>
        {/* Públicas */}
        <Route path="/login"              element={<RutaPublica><Auth modo="login" /></RutaPublica>} />
        <Route path="/registro"           element={<RutaPublica><Auth modo="registro" /></RutaPublica>} />
        <Route path="/recuperar"          element={<RutaPublica><Recuperar /></RutaPublica>} />
        <Route path="/restablecer/:token" element={<RutaPublica><Restablecer /></RutaPublica>} />

        {/* App principal */}
        <Route path="/" element={<RutaPrivada><Plantilla /></RutaPrivada>}>
          {/* Cliente */}
          <Route index                    element={<Inicio />} />
          <Route path="cursos"            element={<Cursos />} />
          <Route path="cursos/:id"        element={<Curso />} />
          <Route path="cursos/:id/leccion/:leccion_id" element={<Leccion />} />
          <Route path="cursos/:id/cuestionario" element={<Cuestionario />} />
          <Route path="cursos/:id/resultados"   element={<Resultados />} />
          <Route path="mis-cursos"        element={<MisCursos />} />
          <Route path="certificados"      element={<Certificados />} />
          <Route path="perfil"            element={<Perfil />} />

          {/* Admin */}
          <Route path="admin"             element={<RutaPrivada soloAdmin><AdminPanel /></RutaPrivada>} />
          <Route path="admin/cursos"      element={<RutaPrivada soloAdmin><AdminCursos /></RutaPrivada>} />
          <Route path="admin/profesores"  element={<RutaPrivada soloAdmin><AdminProfesores /></RutaPrivada>} />
          <Route path="admin/usuarios"    element={<RutaPrivada soloAdmin><AdminUsuarios /></RutaPrivada>} />
          <Route path="admin/reportes"    element={<RutaPrivada soloAdmin><AdminReportes /></RutaPrivada>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ProveedorAuth>
  );
}
