# 🎓 EduTech — Plataforma de Educación en Línea

Plataforma educativa full stack inspirada en Platzi y Udemy, desarrollada para la materia **Computación en la Nube** de la carrera de Ingeniería en Sistemas Computacionales en UBAM.

---

## 🌐 Aplicación Web
👉 **https://edutech-56n8wnxve-gama7210s-projects.vercel.app**

## 📱 Descargar App Móvil (Android APK)
👉 Disponible en la sección **[Releases](https://github.com/Gama7210/edutech/releases)** del repositorio

## 📁 Repositorio
👉 **https://github.com/Gama7210/edutech**

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Servicio Cloud |
|---|---|---|
| Frontend | React 18 + Vite + Framer Motion | Vercel |
| Backend | Node.js + Express | Render.com |
| Base de Datos | MySQL | Clever Cloud |
| App Móvil | Capacitor (Android APK) | — |
| CI/CD | GitHub | Automático en cada push |

---

## ✨ Funcionalidades

### 👑 Administrador
- Gestión de profesores (nombre, correo, especialidad)
- Alta y edición de cursos con imagen de portada
- Subida de videos MP4 por lección (hasta 1GB por video)
- Editor de cuestionarios con hasta 15 preguntas de opción múltiple
- Dashboard con estadísticas: inscritos, completados, calificaciones
- Reporte de cursos más populares y visualizaciones por lección
- Gestión de usuarios registrados en la plataforma

### 🎓 Cliente (Web y Móvil)
- Registro e inicio de sesión con recuperación de contraseña por email
- Perfil personalizable: foto, nombre, contraseña y tema oscuro/claro
- Catálogo de cursos con filtros por categoría y nivel
- Videos en secuencia estricta — requiere ver el 95% del video para avanzar
- Al completar todas las lecciones → cuestionario final automático
- Cuestionario de 15 preguntas de opción múltiple
- PDF de resultados con detalle de correctas e incorrectas
- Certificado PDF con folio único al aprobar (calificación ≥ 70%)
- Calificación obligatoria del curso con estrellas y comentario
- Descarga de la app móvil Android desde el panel principal

---

## 📚 Cursos de ISC Disponibles

| Curso | Nivel | Profesor | Categoría |
|---|---|---|---|
| Python desde Cero | Básico | Enrique | Programación |
| MySQL para Desarrolladores | Intermedio | Cabrero | Bases de Datos |
| Desarrollo Web con HTML, CSS y JS | Básico | Gamiño | Desarrollo Web |
| Algoritmos y Estructuras de Datos | Intermedio | Gamiño | Algoritmos |
| Redes de Computadoras | Intermedio | Cabrero | Redes |
| Introducción a la Inteligencia Artificial | Avanzado | Enrique | IA |

---

## 🔄 Flujo del Estudiante

```
Registro / Login
      ↓
Explorar catálogo e inscribirse
      ↓
Ver lecciones en orden (95% del video obligatorio)
      ↓
Cuestionario final automático (15 preguntas)
      ↓
PDF de resultados (correctas e incorrectas)
      ↓
Si calificación ≥ 70% → Certificado PDF con folio único
      ↓
Calificación obligatoria del curso (estrellas + comentario)
```

---

## 🚀 Instalación Local

### Requisitos
- Node.js 18+
- MySQL local

### Base de datos
```bash
# Abrir en MySQL Workbench y ejecutar
edutech_bd_final.sql
```

### Backend
```bash
cd backend
npm install
# Configura .env con tus credenciales locales
npm run dev
# Disponible en http://localhost:4001
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Disponible en http://localhost:5174
```

### App Móvil Android
```bash
cd frontend
npm run build
npx cap sync android
npx cap open android
# En Android Studio → Build → Build APK(s)
```

---

## 🗄️ Estructura de Base de Datos

14 tablas normalizadas:

```
usuarios              Cuentas de admin y clientes
profesores            Docentes de los cursos
categorias            Categorías del catálogo
cursos                Información de cada curso
lecciones             Videos secuenciales por curso
inscripciones         Relación usuario-curso
progreso_lecciones    Control de visualización de videos
preguntas             Preguntas del cuestionario
opciones_respuesta    Opciones A/B/C/D por pregunta
intentos_cuestionario Resultados de evaluaciones
respuestas_usuario    Respuestas del alumno por intento
calificaciones        Estrellas y comentarios del curso
certificados          PDFs con folio único de aprobación
recuperacion_contrasena Tokens para reset de contraseña
```

---

## ☁️ Despliegue en la Nube

| Componente | Plataforma | URL |
|---|---|---|
| Frontend | Vercel | https://edutech-56n8wnxve-gama7210s-projects.vercel.app |
| Backend API | Render.com | https://edutech-1c74.onrender.com |
| Base de datos | Clever Cloud | MySQL administrado 256MB |
| APK Android | GitHub Releases | Ver sección Releases |

Cada `git push` a `main` actualiza automáticamente Vercel y Render.

---

## 🔑 Credenciales de Prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@edutech.com | password |
| Cliente | Regístrate en la app | — |

---

## 👥 Equipo de Desarrollo

| Nombre | Especialidad |
|---|---|
| Edgar Gamiño Cuevas | Desarrollo Web y Algoritmos |
| Abraham Enrique Tetlalmatzi Pérez | Python e Inteligencia Artificial |
| Ricardo Rodríguez Cabrero | Bases de Datos y Redes |

**Universidad Bancaria de México (UBAM)**  
Ingeniería en Sistemas Computacionales — 11° Cuatrimestre — Abril 2026
