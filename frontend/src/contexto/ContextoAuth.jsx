import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const Ctx = createContext(null);

// Aplicar tema al documento
function aplicarTema(tema) {
  document.documentElement.setAttribute('data-tema', tema || 'oscuro');
}

export function ProveedorAuth({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('edu_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get('/api/auth/perfil')
        .then(r => {
          setUsuario(r.data.usuario);
          aplicarTema(r.data.usuario?.tema);
        })
        .catch(() => {
          localStorage.removeItem('edu_token');
          delete axios.defaults.headers.common['Authorization'];
        })
        .finally(() => setCargando(false));
    } else {
      setCargando(false);
    }
  }, []);

  const iniciarSesion = async (correo, contrasena) => {
    const { data } = await axios.post('/api/auth/iniciar-sesion', { correo, contrasena });
    localStorage.setItem('edu_token', data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setUsuario(data.usuario);
    aplicarTema(data.usuario?.tema);
    return data.usuario;
  };

  const cerrarSesion = () => {
    localStorage.removeItem('edu_token');
    delete axios.defaults.headers.common['Authorization'];
    setUsuario(null);
    aplicarTema('oscuro');
  };

  const actualizarUsuario = (nuevoUsuario) => {
    setUsuario(nuevoUsuario);
    aplicarTema(nuevoUsuario?.tema);
  };

  return (
    <Ctx.Provider value={{ usuario, cargando, iniciarSesion, cerrarSesion, actualizarUsuario }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
