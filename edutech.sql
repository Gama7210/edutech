
CREATE DATABASE IF NOT EXISTS edutech CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE edutech;

-- Tablas
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
CREATE TABLE categorias (
  id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre    VARCHAR(100) NOT NULL UNIQUE,
  icono     VARCHAR(10) DEFAULT NULL,
  color     VARCHAR(7) DEFAULT '#6366f1',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO categorias (nombre, icono, color) VALUES
('Programacion', NULL, '#6366f1'),
('Bases de Datos', NULL, '#0ea5e9'),
('Desarrollo Web', NULL, '#10b981'),
('Algoritmos', NULL, '#f59e0b'),
('Redes', NULL, '#ef4444'),
('Inteligencia Artificial', NULL, '#8b5cf6'),
('Sistemas Operativos', NULL, '#f97316'),
('Seguridad Informatica', NULL, '#ec4899');
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
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL
);
CREATE TABLE lecciones (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  curso_id     INT UNSIGNED NOT NULL,
  titulo       VARCHAR(200) NOT NULL,
  descripcion  TEXT DEFAULT NULL,
  video_url    VARCHAR(500) DEFAULT NULL,
  duracion_seg INT UNSIGNED DEFAULT 0,
  orden        INT UNSIGNED NOT NULL DEFAULT 1,
  esta_activa  BOOLEAN DEFAULT TRUE,
  creado_en    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
  INDEX idx_curso_orden (curso_id, orden)
);
CREATE TABLE inscripciones (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id        INT UNSIGNED NOT NULL,
  curso_id          INT UNSIGNED NOT NULL,
  fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completado        BOOLEAN DEFAULT FALSE,
  fecha_completado  DATETIME DEFAULT NULL,
  UNIQUE KEY uq_inscripcion (usuario_id, curso_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (curso_id)   REFERENCES cursos(id)   ON DELETE CASCADE
);
CREATE TABLE progreso_lecciones (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id       INT UNSIGNED NOT NULL,
  leccion_id       INT UNSIGNED NOT NULL,
  completada       BOOLEAN DEFAULT FALSE,
  segundos_vistos  INT UNSIGNED DEFAULT 0,
  fecha_completada DATETIME DEFAULT NULL,
  UNIQUE KEY uq_progreso (usuario_id, leccion_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)  ON DELETE CASCADE,
  FOREIGN KEY (leccion_id) REFERENCES lecciones(id) ON DELETE CASCADE
);
CREATE TABLE preguntas (
  id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  curso_id  INT UNSIGNED NOT NULL,
  texto     TEXT NOT NULL,
  orden     INT UNSIGNED DEFAULT 1,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
  INDEX idx_curso (curso_id)
);
CREATE TABLE opciones_respuesta (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pregunta_id INT UNSIGNED NOT NULL,
  texto       TEXT NOT NULL,
  es_correcta BOOLEAN DEFAULT FALSE,
  orden       INT UNSIGNED DEFAULT 1,
  FOREIGN KEY (pregunta_id) REFERENCES preguntas(id) ON DELETE CASCADE
);
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
  FOREIGN KEY (curso_id)   REFERENCES cursos(id)   ON DELETE CASCADE
);
CREATE TABLE respuestas_usuario (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  intento_id        INT UNSIGNED NOT NULL,
  pregunta_id       INT UNSIGNED NOT NULL,
  opcion_elegida_id INT UNSIGNED DEFAULT NULL,
  es_correcta       BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (intento_id)        REFERENCES intentos_cuestionario(id) ON DELETE CASCADE,
  FOREIGN KEY (pregunta_id)       REFERENCES preguntas(id)             ON DELETE CASCADE,
  FOREIGN KEY (opcion_elegida_id) REFERENCES opciones_respuesta(id)    ON DELETE SET NULL
);
CREATE TABLE calificaciones (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  curso_id   INT UNSIGNED NOT NULL,
  estrellas  TINYINT UNSIGNED NOT NULL CHECK (estrellas BETWEEN 1 AND 5),
  comentario TEXT DEFAULT NULL,
  creado_en  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_calificacion (usuario_id, curso_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (curso_id)   REFERENCES cursos(id)   ON DELETE CASCADE
);
CREATE TABLE certificados (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id    INT UNSIGNED NOT NULL,
  curso_id      INT UNSIGNED NOT NULL,
  folio         VARCHAR(50) NOT NULL UNIQUE,
  pdf_url       VARCHAR(500) DEFAULT NULL,
  calificacion  DECIMAL(5,2) DEFAULT 0,
  fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_certificado (usuario_id, curso_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (curso_id)   REFERENCES cursos(id)   ON DELETE CASCADE
);
CREATE TABLE recuperacion_contrasena (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  token      VARCHAR(255) NOT NULL UNIQUE,
  expira_en  DATETIME NOT NULL,
  usado      BOOLEAN DEFAULT FALSE,
  creado_en  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_token (token)
);

-- Admin (contrasena: password)
INSERT INTO usuarios (nombre, correo, contrasena_hash, rol) VALUES
('Administrador', 'admin@edutech.com', '$2b$12$Q0tvi2VDQ5HzAbJXq.nwMOnkENS69PBhODS2w6qUxxXgjbXokbh5C', 'admin');

INSERT INTO profesores (nombre, correo, especialidad) VALUES
('Cabrero', 'cabrero@edutech.com', 'Bases de Datos y Redes'),
('Gamino', 'gamino@edutech.com', 'Desarrollo Web y Algoritmos'),
('Enrique', 'enrique@edutech.com', 'Python e Inteligencia Artificial');

INSERT INTO cursos (nombre, descripcion, profesor_id, categoria_id, nivel, duracion_horas) VALUES
('Python desde Cero', 'Aprende programacion con Python, el lenguaje mas demandado. Desde variables hasta POO.', 3, 1, 'basico', 2.0),
('MySQL para Desarrolladores', 'Domina las bases de datos relacionales con MySQL. Consultas, joins, procedimientos y mas.', 1, 2, 'intermedio', 2.0),
('Desarrollo Web con HTML, CSS y JavaScript', 'Crea sitios web modernos y responsivos desde cero con las tecnologias base de la web.', 2, 3, 'basico', 2.0),
('Algoritmos y Estructuras de Datos', 'Comprende los algoritmos fundamentales y estructuras de datos para resolver problemas eficientemente.', 2, 4, 'intermedio', 2.0),
('Redes de Computadoras', 'Fundamentos de redes, protocolos TCP/IP, configuracion y seguridad en redes.', 1, 5, 'intermedio', 2.0),
('Introduccion a la Inteligencia Artificial', 'Conceptos basicos de IA, machine learning y sus aplicaciones en la industria tecnologica.', 3, 6, 'avanzado', 2.0);

-- ════════════════════════════════════════════════════════
-- PREGUNTAS Y OPCIONES (15 por curso, respuesta correcta en A/B/C/D variado)
-- ════════════════════════════════════════════════════════

-- Curso 1 ---------------------------------------------------
INSERT INTO preguntas (curso_id, texto, orden) VALUES (1, 'Como se imprime texto en Python?', 1);
-- Correcta: A
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (1, 'print()', 1, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (1, 'console.log()', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (1, 'echo()', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (1, 'write()', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (1, 'Como se define una funcion en Python?', 2);
-- Correcta: A
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (2, 'def nombre():', 1, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (2, 'function nombre():', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (2, 'func nombre():', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (2, 'define nombre():', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (1, 'Que tipo de dato es True en Python?', 3);
-- Correcta: C
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (3, 'String', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (3, 'Integer', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (3, 'Boolean', 1, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (3, 'Float', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (1, 'Como se crea una lista en Python?', 4);
-- Correcta: B
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (4, 'Con llaves {}', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (4, 'Con corchetes []', 1, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (4, 'Con parentesis ()', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (4, 'Con comillas', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (1, 'Que hace el metodo append() en una lista?', 5);
-- Correcta: B
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (5, 'Elimina el primer elemento', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (5, 'Agrega un elemento al final', 1, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (5, 'Ordena la lista', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (5, 'Invierte la lista', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (1, 'Como se importa un modulo en Python?', 6);
-- Correcta: B
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (6, 'include nombre', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (6, 'import nombre', 1, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (6, 'require nombre', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (6, 'use nombre', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (1, 'Que estructura repite mientras se cumpla una condicion?', 7);
-- Correcta: A
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (7, 'while', 1, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (7, 'for', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (7, 'if', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (7, 'repeat', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (1, 'Que es un diccionario en Python?', 8);
-- Correcta: A
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (8, 'Coleccion de pares clave-valor', 1, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (8, 'Lista ordenada de elementos', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (8, 'Tupla inmutable', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (8, 'Conjunto sin orden', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (1, 'Cual es la indentacion estandar en Python?', 9);
-- Correcta: D
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (9, '2 espacios', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (9, 'Tabulacion obligatoria', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (9, 'No importa el espacio', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (9, '4 espacios', 1, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (1, 'Que hace el metodo split() en un String?', 10);
-- Correcta: A
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (10, 'Divide el string en una lista', 1, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (10, 'Une dos strings', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (10, 'Cuenta caracteres', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (10, 'Elimina espacios', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (1, 'Que palabra devuelve un valor desde una funcion?', 11);
-- Correcta: A
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (11, 'return', 1, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (11, 'send', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (11, 'output', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (11, 'give', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (1, 'Que es la herencia en POO?', 12);
-- Correcta: A
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (12, 'Una clase hereda atributos y metodos de otra', 1, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (12, 'Copiar codigo manualmente', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (12, 'Crear objetos sin clase', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (12, 'Importar modulos externos', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (1, 'Que genera range(5) en un ciclo for?', 13);
-- Correcta: B
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (13, 'Numeros del 1 al 5', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (13, 'Numeros del 0 al 4', 1, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (13, '5 numeros aleatorios', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (13, 'Repite 5 veces desde 1', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (1, 'Para que sirve el metodo __init__?', 14);
-- Correcta: B
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (14, 'Destruye el objeto al finalizar', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (14, 'Constructor que inicializa objetos de una clase', 1, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (14, 'Importa la clase al proyecto', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (14, 'Hereda metodos de otra clase', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (1, 'Que gestor de paquetes usa Python?', 15);
-- Correcta: A
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (15, 'pip', 1, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (15, 'npm', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (15, 'composer', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (15, 'gem', 0, 4);

-- Curso 2 ---------------------------------------------------
INSERT INTO preguntas (curso_id, texto, orden) VALUES (2, 'Que significa SQL?', 1);
-- Correcta: B
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (16, 'Simple Query Language', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (16, 'Structured Query Language', 1, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (16, 'System Query List', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (16, 'Standard Queue Language', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (2, 'Que comando crea una base de datos?', 2);
-- Correcta: D
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (17, 'NEW DATABASE', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (17, 'MAKE DATABASE', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (17, 'BUILD DATABASE', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (17, 'CREATE DATABASE', 1, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (2, 'Para que sirve PRIMARY KEY?', 3);
-- Correcta: B
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (18, 'Encripta la columna', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (18, 'Identifica de forma unica cada registro', 1, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (18, 'Crea un indice visual', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (18, 'Protege la tabla de cambios', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (2, 'Que hace AUTO_INCREMENT?', 4);
-- Correcta: D
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (19, 'Ordena la tabla al insertar', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (19, 'Duplica el registro anterior', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (19, 'Incrementa el tamano de la tabla', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (19, 'Genera valores numericos automaticamente', 1, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (2, 'Que instruccion inserta datos en una tabla?', 5);
-- Correcta: C
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (20, 'ADD INTO', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (20, 'PUT INTO', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (20, 'INSERT INTO', 1, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (20, 'PUSH INTO', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (2, 'Que hace INNER JOIN?', 6);
-- Correcta: A
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (21, 'Devuelve registros que coinciden en ambas tablas', 1, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (21, 'Une todas las filas sin condicion', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (21, 'Elimina duplicados automaticamente', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (21, 'Ordena los resultados por defecto', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (2, 'Que diferencia hay entre LEFT JOIN e INNER JOIN?', 7);
-- Correcta: B
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (22, 'Son completamente identicos', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (22, 'LEFT JOIN incluye todos los registros de la tabla izquierda', 1, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (22, 'LEFT JOIN siempre es mas lento', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (22, 'INNER JOIN incluye valores nulos', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (2, 'Para que se usa FOREIGN KEY?', 8);
-- Correcta: D
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (23, 'Crear tablas temporales automaticamente', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (23, 'Bloquear registros para edicion', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (23, 'Hacer respaldos automaticos', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (23, 'Garantizar integridad referencial entre tablas', 1, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (2, 'Que hace el comando UPDATE?', 9);
-- Correcta: C
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (24, 'Crea nuevos registros', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (24, 'Elimina la tabla completa', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (24, 'Modifica registros existentes', 1, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (24, 'Agrega columnas nuevas', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (2, 'Que clausula filtra resultados en un SELECT?', 10);
-- Correcta: C
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (25, 'FILTER', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (25, 'LIMIT', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (25, 'WHERE', 1, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (25, 'HAVING', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (2, 'Para que sirven los indices en MySQL?', 11);
-- Correcta: B
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (26, 'Encriptar los datos almacenados', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (26, 'Acelerar las busquedas en la base de datos', 1, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (26, 'Crear copias de seguridad automaticas', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (26, 'Ordenar visualmente las tablas', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (2, 'Que hace GROUP BY?', 12);
-- Correcta: B
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (27, 'Ordena los resultados de forma descendente', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (27, 'Agrupa filas que tienen el mismo valor', 1, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (27, 'Elimina grupos duplicados', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (27, 'Filtra valores nulos del resultado', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (2, 'Que funcion cuenta el total de registros?', 13);
-- Correcta: C
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (28, 'SUM()', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (28, 'TOTAL()', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (28, 'COUNT()', 1, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (28, 'NUM()', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (2, 'Que hace un procedimiento almacenado?', 14);
-- Correcta: A
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (29, 'Guarda logica SQL reutilizable en la base de datos', 1, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (29, 'Respalda la base de datos automaticamente', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (29, 'Crea nuevos usuarios del sistema', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (29, 'Genera reportes en formato PDF', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (2, 'Cual es la diferencia entre DELETE y DROP?', 15);
-- Correcta: A
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (30, 'DELETE elimina filas DROP elimina la tabla', 1, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (30, 'Ambos hacen exactamente lo mismo', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (30, 'DROP solo elimina filas especificas', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (30, 'DELETE borra toda la base de datos', 0, 4);

-- Curso 3 ---------------------------------------------------
INSERT INTO preguntas (curso_id, texto, orden) VALUES (3, 'Que significa HTML?', 1);
-- Correcta: D
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (31, 'High Text Markup Language', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (31, 'HyperText Modern Language', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (31, 'Hybrid Text Markup List', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (31, 'HyperText Markup Language', 1, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (3, 'Que etiqueta define el contenido visible de una pagina?', 2);
-- Correcta: A
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (32, 'body', 1, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (32, 'head', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (32, 'html', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (32, 'meta', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (3, 'Para que se usa CSS?', 3);
-- Correcta: C
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (33, 'Crear bases de datos web', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (33, 'Programar logica del servidor', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (33, 'Dar estilo y diseno visual a las paginas', 1, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (33, 'Gestionar servidores en la nube', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (3, 'Que propiedad CSS centra elementos con Flexbox?', 4);
-- Correcta: C
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (34, 'align: middle', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (34, 'center: true', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (34, 'justify-content: center', 1, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (34, 'position: center', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (3, 'Que es el modelo de caja en CSS?', 5);
-- Correcta: C
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (35, 'Color fuente tamano y posicion', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (35, 'HTML CSS JS y PHP', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (35, 'Margin border padding y contenido', 1, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (35, 'Ancho alto color y borde', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (3, 'Para que sirven las media queries?', 6);
-- Correcta: A
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (36, 'Hacer disenos responsivos segun el tamano de pantalla', 1, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (36, 'Animar elementos de la pagina', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (36, 'Conectar a bases de datos', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (36, 'Crear menus desplegables', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (3, 'Que es el DOM?', 7);
-- Correcta: D
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (37, 'Un framework popular de JavaScript', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (37, 'Un tipo de base de datos web', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (37, 'Un protocolo de comunicacion web', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (37, 'Representacion del HTML como arbol de objetos', 1, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (3, 'Que metodo selecciona un elemento por su ID en JS?', 8);
-- Correcta: A
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (38, 'document.getElementById()', 1, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (38, 'document.find()', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (38, 'html.select()', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (38, 'page.getElement()', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (3, 'Que hace addEventListener en JavaScript?', 9);
-- Correcta: D
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (39, 'Agrega estilos CSS dinamicamente', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (39, 'Crea elementos HTML nuevos', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (39, 'Envia formularios automaticamente', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (39, 'Escucha eventos del usuario como clics o teclas', 1, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (3, 'Que es fetch en JavaScript?', 10);
-- Correcta: A
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (40, 'API para hacer peticiones HTTP desde el navegador', 1, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (40, 'Un tipo de bucle asincrono', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (40, 'Un metodo de arrays avanzado', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (40, 'Una libreria externa de JavaScript', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (3, 'Cual es la diferencia entre let y var?', 11);
-- Correcta: C
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (41, 'Son completamente identicos', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (41, 'var es mas moderno que let', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (41, 'let tiene ambito de bloque var de funcion', 1, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (41, 'let es mas lento que var', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (3, 'Que hace el metodo map() en un array?', 12);
-- Correcta: C
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (42, 'Elimina elementos duplicados del array', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (42, 'Ordena el array de forma ascendente', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (42, 'Transforma cada elemento y devuelve un nuevo array', 1, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (42, 'Busca un elemento especifico', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (3, 'Para que sirve la etiqueta semantica nav?', 13);
-- Correcta: B
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (43, 'Crear tablas de datos', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (43, 'Definir la seccion de navegacion del sitio', 1, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (43, 'Insertar imagenes en la pagina', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (43, 'Hacer formularios de contacto', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (3, 'Que propiedad CSS crea un layout de cuadricula?', 14);
-- Correcta: A
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (44, 'display: grid', 1, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (44, 'display: table', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (44, 'layout: grid', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (44, 'position: grid', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (3, 'Que es una promesa en JavaScript?', 15);
-- Correcta: A
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (45, 'Objeto que representa una operacion asincrona pendiente', 1, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (45, 'Un tipo especial de variable', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (45, 'Un metodo del objeto String', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (45, 'Una funcion especial de CSS', 0, 4);

-- Curso 4 ---------------------------------------------------
INSERT INTO preguntas (curso_id, texto, orden) VALUES (4, 'Que mide la notacion Big O?', 1);
-- Correcta: B
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (46, 'El tamano total del codigo fuente', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (46, 'La eficiencia de un algoritmo segun el tamano de entrada', 1, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (46, 'La velocidad del procesador CPU', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (46, 'La cantidad de memoria RAM usada', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (4, 'Cual es la complejidad de acceder a un elemento en array por indice?', 2);
-- Correcta: C
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (47, 'O(n)', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (47, 'O(log n)', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (47, 'O(1)', 1, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (47, 'O(n cuadrado)', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (4, 'Que estructura sigue el principio LIFO?', 3);
-- Correcta: A
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (48, 'Pila Stack', 1, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (48, 'Cola Queue', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (48, 'Lista enlazada', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (48, 'Arbol binario', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (4, 'Que estructura sigue el principio FIFO?', 4);
-- Correcta: B
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (49, 'Pila Stack', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (49, 'Cola Queue', 1, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (49, 'Arbol binario de busqueda', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (49, 'Grafo no dirigido', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (4, 'Cual es la ventaja principal de una lista enlazada sobre un array?', 5);
-- Correcta: A
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (50, 'Insercion y eliminacion eficiente en cualquier posicion', 1, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (50, 'Acceso mas rapido por indice', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (50, 'Ocupa menos memoria en total', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (50, 'Es mas facil de ordenar', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (4, 'Que hace el algoritmo Bubble Sort?', 6);
-- Correcta: D
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (51, 'Divide el array recursivamente por la mitad', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (51, 'Busca el minimo en cada iteracion', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (51, 'Ordena siempre de mayor a menor', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (51, 'Compara e intercambia elementos adyacentes repetidamente', 1, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (4, 'Cual es la complejidad de tiempo de Merge Sort?', 7);
-- Correcta: C
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (52, 'O(n cuadrado)', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (52, 'O(n)', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (52, 'O(n log n)', 1, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (52, 'O(1)', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (4, 'Que requiere la busqueda binaria para funcionar?', 8);
-- Correcta: D
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (53, 'El array debe contener numeros pares', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (53, 'El array debe estar completamente vacio', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (53, 'El array debe ser solo de strings', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (53, 'El array debe estar ordenado previamente', 1, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (4, 'Cual es la complejidad de busqueda lineal en el peor caso?', 9);
-- Correcta: C
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (54, 'O(1)', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (54, 'O(log n)', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (54, 'O(n)', 1, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (54, 'O(n cuadrado)', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (4, 'En un arbol binario de busqueda donde van los elementos menores?', 10);
-- Correcta: B
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (55, 'A la derecha del nodo raiz', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (55, 'A la izquierda del nodo raiz', 1, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (55, 'Encima del nodo padre', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (55, 'En una posicion aleatoria', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (4, 'Que es la recursion?', 11);
-- Correcta: C
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (56, 'Un ciclo infinito sin condicion', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (56, 'Un tipo especial de variable', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (56, 'Una funcion que se llama a si misma', 1, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (56, 'Un algoritmo de ordenamiento', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (4, 'Cuantos hijos puede tener maximo un nodo en un arbol binario?', 12);
-- Correcta: C
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (57, 'Solo 1 hijo', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (57, 'Exactamente 3 hijos', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (57, '2 hijos como maximo', 1, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (57, 'Ilimitados hijos', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (4, 'Que algoritmo de busqueda en grafos explora nivel por nivel?', 13);
-- Correcta: B
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (58, 'DFS Depth First Search', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (58, 'BFS Breadth First Search', 1, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (58, 'Algoritmo de Dijkstra', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (58, 'Algoritmo A estrella', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (4, 'Que es un grafo dirigido?', 14);
-- Correcta: C
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (59, 'El grafo no puede tener ciclos', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (59, 'Solo existe un camino entre nodos', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (59, 'Las aristas tienen una direccion especifica', 1, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (59, 'Los nodos solo pueden ser numeros', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (4, 'Cual es la diferencia entre Selection Sort e Insertion Sort?', 15);
-- Correcta: A
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (60, 'Selection busca el minimo Insertion inserta en posicion correcta', 1, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (60, 'Son algoritmos completamente identicos', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (60, 'Insertion siempre es mas lento que Selection', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (60, 'Selection Sort utiliza recursion', 0, 4);

-- Curso 5 ---------------------------------------------------
INSERT INTO preguntas (curso_id, texto, orden) VALUES (5, 'Que es una red LAN?', 1);
-- Correcta: B
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (61, 'Red de area amplia', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (61, 'Red de area local', 1, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (61, 'Red inalambrica publica', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (61, 'Red de comunicacion satelital', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (5, 'Cuantas capas tiene el modelo OSI?', 2);
-- Correcta: B
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (62, '4 capas', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (62, '7 capas', 1, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (62, '5 capas', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (62, '3 capas', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (5, 'Que dispositivo conecta redes diferentes entre si?', 3);
-- Correcta: B
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (63, 'Switch', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (63, 'Router', 1, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (63, 'Hub', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (63, 'Repetidor de senal', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (5, 'Que protocolo garantiza entrega confiable de datos?', 4);
-- Correcta: D
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (64, 'UDP', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (64, 'IP', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (64, 'FTP', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (64, 'TCP', 1, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (5, 'Cual es el formato de una direccion IPv4?', 5);
-- Correcta: D
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (65, 'Seis grupos de caracteres hexadecimales', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (65, 'Un numero entero de 64 bits', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (65, 'Combinacion de letras y numeros aleatorios', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (65, 'Cuatro numeros de 0 a 255 separados por puntos', 1, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (5, 'Que hace un switch en una red local?', 6);
-- Correcta: C
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (66, 'Asigna direcciones IP publicas', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (66, 'Filtra virus y malware', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (66, 'Conecta dispositivos dentro de una red local', 1, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (66, 'Conecta redes externas entre si', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (5, 'Que es el subnetting?', 7);
-- Correcta: B
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (67, 'Unir varias redes en una sola', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (67, 'Dividir una red grande en subredes mas pequenas', 1, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (67, 'Encriptar el trafico de red', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (67, 'Medir la velocidad de la conexion', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (5, 'Que diferencia a UDP de TCP?', 8);
-- Correcta: C
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (68, 'UDP siempre es mas lento que TCP', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (68, 'Son protocolos completamente identicos', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (68, 'UDP no garantiza entrega pero es mas rapido', 1, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (68, 'UDP garantiza el orden de los paquetes', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (5, 'Que es una VPN?', 9);
-- Correcta: A
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (69, 'Red privada virtual que cifra las comunicaciones', 1, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (69, 'Tipo de software antivirus avanzado', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (69, 'Protocolo para envio de correos', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (69, 'Sistema operativo de red especializado', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (5, 'En que capa del modelo OSI opera la direccion IP?', 10);
-- Correcta: B
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (70, 'Capa Fisica capa 1', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (70, 'Capa de Red capa 3', 1, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (70, 'Capa de Transporte capa 4', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (70, 'Capa de Aplicacion capa 7', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (5, 'Que es un ataque DDoS?', 11);
-- Correcta: A
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (71, 'Saturar un servidor con trafico masivo para dejarlo fuera de servicio', 1, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (71, 'Robar contrasenas mediante enganos', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (71, 'Interceptar comunicaciones privadas', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (71, 'Instalar virus en equipos remotos', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (5, 'Que protocolo agrega HTTPS que HTTP no tiene?', 12);
-- Correcta: C
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (72, 'Mayor velocidad de transferencia', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (72, 'Compresion automatica de datos', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (72, 'Cifrado SSL/TLS para comunicacion segura', 1, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (72, 'Autenticacion obligatoria de usuario', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (5, 'Que significa DNS?', 13);
-- Correcta: D
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (73, 'Data Network Service', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (73, 'Digital Node System', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (73, 'Direct Name Server', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (73, 'Domain Name System', 1, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (5, 'Que es una direccion MAC?', 14);
-- Correcta: C
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (74, 'Direccion IP privada del equipo', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (74, 'Nombre del router de la red', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (74, 'Identificador unico del hardware de red del dispositivo', 1, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (74, 'Contrasena del adaptador WiFi', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (5, 'Que hace un firewall?', 15);
-- Correcta: A
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (75, 'Filtra el trafico de red segun reglas de seguridad', 1, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (75, 'Acelera la velocidad de conexion', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (75, 'Asigna direcciones IP automaticamente', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (75, 'Crea copias de seguridad de la red', 0, 4);

-- Curso 6 ---------------------------------------------------
INSERT INTO preguntas (curso_id, texto, orden) VALUES (6, 'Que es el Machine Learning?', 1);
-- Correcta: B
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (76, 'Robots fisicos con movimiento autonomo', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (76, 'Sistemas que aprenden de datos sin ser programados explicitamente', 1, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (76, 'Programacion tradicional con reglas fijas', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (76, 'Bases de datos con busqueda avanzada', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (6, 'Cual es la relacion entre IA y Machine Learning?', 2);
-- Correcta: C
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (77, 'Son exactamente lo mismo', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (77, 'La IA es mas simple que ML', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (77, 'ML es una subcategoria dentro de la IA', 1, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (77, 'ML no utiliza datos para aprender', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (6, 'Que tipo de aprendizaje usa datos etiquetados?', 3);
-- Correcta: B
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (78, 'Aprendizaje no supervisado', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (78, 'Aprendizaje supervisado', 1, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (78, 'Aprendizaje por refuerzo', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (78, 'Aprendizaje profundo', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (6, 'Para que sirve el aprendizaje no supervisado?', 4);
-- Correcta: D
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (79, 'Clasificar imagenes ya conocidas', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (79, 'Predecir precios con precision absoluta', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (79, 'Programar robots para jugar videojuegos', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (79, 'Encontrar patrones en datos sin etiquetas previas', 1, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (6, 'Que es una red neuronal artificial?', 5);
-- Correcta: D
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (80, 'Un tipo especializado de base de datos', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (80, 'Un lenguaje de programacion de IA', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (80, 'Un sistema operativo inteligente', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (80, 'Modelo computacional inspirado en el cerebro humano', 1, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (6, 'Que hace el algoritmo de backpropagation?', 6);
-- Correcta: D
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (81, 'Crea nuevas neuronas automaticamente', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (81, 'Elimina capas innecesarias del modelo', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (81, 'Importa datos nuevos al modelo', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (81, 'Ajusta los pesos de la red para reducir el error', 1, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (6, 'Cuantas capas tiene una red neuronal basica?', 7);
-- Correcta: B
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (82, '2 capas entrada y salida solamente', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (82, '3 capas entrada oculta y salida', 1, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (82, 'Siempre exactamente 5 capas', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (82, 'Depende del idioma de programacion', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (6, 'Que es el overfitting o sobreajuste?', 8);
-- Correcta: C
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (83, 'Cuando la red neuronal aprende demasiado rapido', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (83, 'Un error critico de programacion', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (83, 'Modelo que memoriza entrenamiento y falla con datos nuevos', 1, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (83, 'La falta de suficientes datos de entrenamiento', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (6, 'Que libreria de Python se usa para Machine Learning clasico?', 9);
-- Correcta: B
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (84, 'numpy', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (84, 'scikit-learn', 1, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (84, 'matplotlib', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (84, 'tkinter', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (6, 'Que es el Procesamiento del Lenguaje Natural?', 10);
-- Correcta: B
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (85, 'Traduccion manual asistida por humanos', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (85, 'Rama de IA que permite a maquinas entender lenguaje humano', 1, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (85, 'Corrector ortografico basico', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (85, 'Reconocimiento de voz sin algoritmos', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (6, 'Cual es la aplicacion principal del Deep Learning?', 11);
-- Correcta: C
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (86, 'Calculos matematicos simples y rapidos', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (86, 'Manejo y organizacion de archivos', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (86, 'Reconocimiento de imagenes voz y texto complejo', 1, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (86, 'Diseno grafico y edicion de imagenes', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (6, 'Que hace el algoritmo K-means?', 12);
-- Correcta: D
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (87, 'Clasifica imagenes en categorias fijas', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (87, 'Predice precios futuros de productos', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (87, 'Ordena listas de datos numericos', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (87, 'Agrupa datos en K grupos segun similitud', 1, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (6, 'Que es el aprendizaje por refuerzo?', 13);
-- Correcta: D
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (88, 'Aprende exclusivamente de imagenes etiquetadas', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (88, 'Agrupa datos similares sin supervision', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (88, 'Se entrena sin ninguna retroalimentacion', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (88, 'El modelo aprende por ensayo y error recibiendo recompensas', 1, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (6, 'Que son los datos de entrenamiento en un modelo de ML?', 14);
-- Correcta: C
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (89, 'Datos en tiempo real de produccion', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (89, 'El codigo fuente del modelo', 0, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (89, 'Ejemplos usados para que el modelo aprenda patrones', 1, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (89, 'La configuracion del servidor donde corre', 0, 4);
INSERT INTO preguntas (curso_id, texto, orden) VALUES (6, 'Que modelo de lenguaje de gran escala desarrollo OpenAI?', 15);
-- Correcta: B
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (90, 'BERT desarrollado por Google', 0, 1);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (90, 'GPT utilizado en ChatGPT', 1, 2);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (90, 'LLaMA creado por Meta', 0, 3);
INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES (90, 'Gemini desarrollado por Apple', 0, 4);

-- Verificar
SELECT table_name AS Tabla FROM information_schema.tables WHERE table_schema = 'edutech' ORDER BY table_name;