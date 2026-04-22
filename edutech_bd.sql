-- ══════════════════════════════════════════════════════
--  EDUTECH — Base de Datos
--  Plataforma de Educacion en Linea
-- ══════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS edutech CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE edutech;

-- ── Usuarios ─────────────────────────────────────────
CREATE TABLE usuarios (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre           VARCHAR(100) NOT NULL,
  correo           VARCHAR(150) NOT NULL UNIQUE,
  contrasena_hash  VARCHAR(255) DEFAULT NULL,
  avatar_url       VARCHAR(500) DEFAULT NULL,
  tema             ENUM('oscuro','claro') DEFAULT 'oscuro',
  rol              ENUM('admin','cliente') DEFAULT 'cliente',
  esta_activo      BOOLEAN DEFAULT TRUE,
  creado_en        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_correo (correo)
);

-- ── Profesores ────────────────────────────────────────
CREATE TABLE profesores (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre       VARCHAR(150) NOT NULL,
  correo       VARCHAR(150) NOT NULL UNIQUE,
  especialidad VARCHAR(200) NOT NULL,
  avatar_url   VARCHAR(500) DEFAULT NULL,
  bio          TEXT DEFAULT NULL,
  esta_activo  BOOLEAN DEFAULT TRUE,
  creado_en    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Categorias de cursos ──────────────────────────────
CREATE TABLE categorias (
  id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre    VARCHAR(100) NOT NULL UNIQUE,
  icono     VARCHAR(10) DEFAULT NULL,
  color     VARCHAR(7) DEFAULT '#6366f1',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categorias (nombre, icono, color) VALUES
('Programacion',              '💻', '#6366f1'),
('Bases de Datos',            '🗄️', '#0ea5e9'),
('Desarrollo Web',            '🌐', '#10b981'),
('Algoritmos',                '🧮', '#f59e0b'),
('Redes',                     '🔌', '#ef4444'),
('Inteligencia Artificial',   '🤖', '#8b5cf6'),
('Sistemas Operativos',       '⚙️', '#f97316'),
('Seguridad Informatica',     '🔐', '#ec4899');

-- ── Cursos ────────────────────────────────────────────
CREATE TABLE cursos (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre          VARCHAR(200) NOT NULL,
  descripcion     TEXT DEFAULT NULL,
  profesor_id     INT UNSIGNED DEFAULT NULL,
  categoria_id    INT UNSIGNED DEFAULT NULL,
  imagen_url      VARCHAR(500) DEFAULT NULL,
  nivel           ENUM('basico','intermedio','avanzado') DEFAULT 'basico',
  duracion_horas  DECIMAL(5,1) DEFAULT 0,
  esta_activo     BOOLEAN DEFAULT TRUE,
  creado_en       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (profesor_id)  REFERENCES profesores(id) ON DELETE SET NULL,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL,
  INDEX idx_categoria (categoria_id),
  INDEX idx_profesor  (profesor_id)
);

-- ── Lecciones (videos) ────────────────────────────────
CREATE TABLE lecciones (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  curso_id       INT UNSIGNED NOT NULL,
  titulo         VARCHAR(200) NOT NULL,
  descripcion    TEXT DEFAULT NULL,
  video_url      VARCHAR(500) DEFAULT NULL,
  duracion_seg   INT UNSIGNED DEFAULT 0,
  orden          INT UNSIGNED NOT NULL DEFAULT 1,
  esta_activa    BOOLEAN DEFAULT TRUE,
  creado_en      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
  INDEX idx_curso_orden (curso_id, orden)
);

-- ── Inscripciones ─────────────────────────────────────
CREATE TABLE inscripciones (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id      INT UNSIGNED NOT NULL,
  curso_id        INT UNSIGNED NOT NULL,
  fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completado      BOOLEAN DEFAULT FALSE,
  fecha_completado DATETIME DEFAULT NULL,
  UNIQUE KEY uq_inscripcion (usuario_id, curso_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (curso_id)   REFERENCES cursos(id)   ON DELETE CASCADE
);

-- ── Progreso de lecciones ─────────────────────────────
CREATE TABLE progreso_lecciones (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id      INT UNSIGNED NOT NULL,
  leccion_id      INT UNSIGNED NOT NULL,
  completada      BOOLEAN DEFAULT FALSE,
  segundos_vistos INT UNSIGNED DEFAULT 0,
  fecha_completada DATETIME DEFAULT NULL,
  UNIQUE KEY uq_progreso (usuario_id, leccion_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)   ON DELETE CASCADE,
  FOREIGN KEY (leccion_id) REFERENCES lecciones(id)  ON DELETE CASCADE
);

-- ── Preguntas del cuestionario ────────────────────────
CREATE TABLE preguntas (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  curso_id    INT UNSIGNED NOT NULL,
  texto       TEXT NOT NULL,
  orden       INT UNSIGNED DEFAULT 1,
  creado_en   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
  INDEX idx_curso (curso_id)
);

-- ── Opciones de respuesta ─────────────────────────────
CREATE TABLE opciones_respuesta (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pregunta_id  INT UNSIGNED NOT NULL,
  texto        TEXT NOT NULL,
  es_correcta  BOOLEAN DEFAULT FALSE,
  orden        INT UNSIGNED DEFAULT 1,
  FOREIGN KEY (pregunta_id) REFERENCES preguntas(id) ON DELETE CASCADE
);

-- ── Intentos de cuestionario ──────────────────────────
CREATE TABLE intentos_cuestionario (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id      INT UNSIGNED NOT NULL,
  curso_id        INT UNSIGNED NOT NULL,
  calificacion    DECIMAL(5,2) DEFAULT 0,
  total_preguntas INT UNSIGNED DEFAULT 0,
  correctas       INT UNSIGNED DEFAULT 0,
  pdf_url         VARCHAR(500) DEFAULT NULL,
  fecha           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (curso_id)   REFERENCES cursos(id)   ON DELETE CASCADE,
  INDEX idx_usuario_curso (usuario_id, curso_id)
);

-- ── Respuestas del usuario ────────────────────────────
CREATE TABLE respuestas_usuario (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  intento_id          INT UNSIGNED NOT NULL,
  pregunta_id         INT UNSIGNED NOT NULL,
  opcion_elegida_id   INT UNSIGNED DEFAULT NULL,
  es_correcta         BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (intento_id)        REFERENCES intentos_cuestionario(id) ON DELETE CASCADE,
  FOREIGN KEY (pregunta_id)       REFERENCES preguntas(id)             ON DELETE CASCADE,
  FOREIGN KEY (opcion_elegida_id) REFERENCES opciones_respuesta(id)    ON DELETE SET NULL
);

-- ── Calificaciones y comentarios del curso ────────────
CREATE TABLE calificaciones (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT UNSIGNED NOT NULL,
  curso_id    INT UNSIGNED NOT NULL,
  estrellas   TINYINT UNSIGNED NOT NULL CHECK (estrellas BETWEEN 1 AND 5),
  comentario  TEXT DEFAULT NULL,
  creado_en   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_calificacion (usuario_id, curso_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (curso_id)   REFERENCES cursos(id)   ON DELETE CASCADE
);

-- ── Certificados ──────────────────────────────────────
CREATE TABLE certificados (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id      INT UNSIGNED NOT NULL,
  curso_id        INT UNSIGNED NOT NULL,
  folio           VARCHAR(50) NOT NULL UNIQUE,
  pdf_url         VARCHAR(500) DEFAULT NULL,
  calificacion    DECIMAL(5,2) DEFAULT 0,
  fecha_emision   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_certificado (usuario_id, curso_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (curso_id)   REFERENCES cursos(id)   ON DELETE CASCADE
);

-- ── Recuperacion de contrasena ────────────────────────
CREATE TABLE recuperacion_contrasena (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT UNSIGNED NOT NULL,
  token       VARCHAR(255) NOT NULL UNIQUE,
  expira_en   DATETIME NOT NULL,
  usado       BOOLEAN DEFAULT FALSE,
  creado_en   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_token (token)
);

-- ── Admin por defecto ─────────────────────────────────
-- Contrasena: password
INSERT INTO usuarios (nombre, correo, contrasena_hash, rol) VALUES
('Administrador', 'admin@edutech.com',
 '$2b$12$Q0tvi2VDQ5HzAbJXq.nwMOnkENS69PBhODS2w6qUxxXgjbXokbh5C',
 'admin');

-- ── Cursos de ejemplo ISC ─────────────────────────────
INSERT INTO profesores (nombre, correo, especialidad) VALUES
('Dr. Carlos Mendoza',    'cmendoza@edutech.com',    'Programacion y Algoritmos'),
('Mtra. Sofia Ramirez',   'sramirez@edutech.com',    'Bases de Datos y SQL'),
('Ing. Luis Torres',      'ltorres@edutech.com',     'Desarrollo Web Full Stack'),
('Dra. Ana Gutierrez',    'agutierrez@edutech.com',  'Inteligencia Artificial'),
('Mtro. Roberto Vargas',  'rvargas@edutech.com',     'Redes y Seguridad');

INSERT INTO cursos (nombre, descripcion, profesor_id, categoria_id, nivel, duracion_horas) VALUES
('Python desde Cero',
 'Aprende programacion con Python, el lenguaje mas demandado. Desde variables hasta POO.',
 1, 1, 'basico', 2.0),
('MySQL para Desarrolladores',
 'Domina las bases de datos relacionales con MySQL. Consultas, joins, procedimientos y mas.',
 2, 2, 'intermedio', 2.0),
('Desarrollo Web con HTML, CSS y JavaScript',
 'Crea sitios web modernos y responsivos desde cero con las tecnologias base de la web.',
 3, 3, 'basico', 2.0),
('Algoritmos y Estructuras de Datos',
 'Comprende los algoritmos fundamentales y estructuras de datos para resolver problemas eficientemente.',
 1, 4, 'intermedio', 2.0),
('Redes de Computadoras',
 'Fundamentos de redes, protocolos TCP/IP, configuracion y seguridad en redes.',
 5, 5, 'intermedio', 2.0),
('Introduccion a la Inteligencia Artificial',
 'Conceptos basicos de IA, machine learning y sus aplicaciones en la industria tecnologica.',
 4, 6, 'avanzado', 2.0);

-- Verificar
SELECT table_name AS Tabla FROM information_schema.tables
WHERE table_schema = 'edutech' ORDER BY table_name;
