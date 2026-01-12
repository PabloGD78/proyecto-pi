const express = require('express');
const app = express();
const PORT = 3000;
const bcrypt = require('bcrypt');
const mysql = require('mysql'); 
const cors = require('cors'); 

// 1. Configuración de la conexión
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'ficha/informe'
});

db.connect(err => {
    if (err) { 
        console.error('Error al conectar a MySQL:', err); 
        return; 
    }
    console.log('Conexión a MySQL establecida correctamente en el puerto 3000.');
});

app.use(express.json()); 
app.use(cors());

// --- RUTAS DE ALUMNOS ---

// A. Obtener todos los alumnos
app.get('/alumnos', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  // Incluimos el nombre del curso (si existe) para mostrarlo en el frontend
  const query = `
    SELECT a.*, f.datos_medicos, f.adaptacion_curriculares, c.nombre AS curso_nombre
    FROM alumno a
    LEFT JOIN ficha f ON a.id_ficha = f.id_ficha
    LEFT JOIN curso c ON a.id_curso = c.id`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// B. Añadir nuevo alumno
app.post('/alumnos', (req, res) => {
    const { nombre, apellidos, dni, fecha_nacimiento, contacto_tutor, id_curso, curso_nombre } = req.body;

    // helper que inserta alumno con el id de curso dado (puede ser NULL)
    const insertAlumno = (cursoId) => {
      const query = `
        INSERT INTO alumno (nombre, apellidos, dni, fecha_nacimiento, contacto_tutor, id_curso, ultima_modificacion) 
        VALUES (?, ?, ?, ?, ?, ?, NOW())`;
      const cursoValue = cursoId || null;
      db.query(query, [nombre, apellidos, dni, fecha_nacimiento, contacto_tutor, cursoValue], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Éxito", id: result.insertId });
      });
    };

    // Si se ha enviado curso_nombre lo usamos (buscar o crear), sino usamos id_curso si existe
    if (curso_nombre && String(curso_nombre).trim() !== '') {
      const name = String(curso_nombre).trim();
      db.query('SELECT id FROM curso WHERE nombre = ?', [name], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) return insertAlumno(results[0].id);

        // no existe el curso -> lo creamos
        db.query('INSERT INTO curso (nombre, nivel) VALUES (?, ?)', [name, ''], (err, insertRes) => {
          if (err) return res.status(500).json({ error: err.message });
          insertAlumno(insertRes.insertId);
        });
      });
    } else {
      // usar id_curso si se pasó o NULL
      insertAlumno(id_curso || null);
    }
});

// RUTA: Obtener todos los cursos disponibles
app.get('/cursos', (req, res) => {
  db.query('SELECT id, nombre FROM curso ORDER BY nombre', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// C. Detalle del alumno (CORREGIDO PARA EVITAR PANTALLA CARGANDO)
app.get('/alumnos/:id', (req, res) => {
    console.log(`Petición recibida: Detalle del alumno ID ${req.params.id}`);
    const query = `
        SELECT a.*, f.datos_medicos, f.adaptacion_curriculares, f.id_ficha, c.nombre AS curso_nombre
        FROM alumno a 
        LEFT JOIN ficha f ON a.id_ficha = f.id_ficha 
        LEFT JOIN curso c ON a.id_curso = c.id
        WHERE a.id = ?`;
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            console.error("Error en la consulta SQL:", err);
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) return res.status(404).json({ message: "No encontrado" });
        
        console.log("Datos enviados al frontend con éxito.");
        res.json(results[0]);
    });
});

// D. Guardar cambios (CORREGIDO: Crea la ficha si no existe)
app.put('/alumnos/:id/guardar', (req, res) => {
    const { dni, fecha_nacimiento, contacto_tutor, datos_medicos, adaptacion_curriculares, id_ficha } = req.body;
    const studentId = req.params.id;

    console.log(`Guardando cambios para alumno ${studentId}...`);

    // 1. Siempre actualizamos la tabla alumno
    db.query("UPDATE alumno SET dni = ?, fecha_nacimiento = ?, contacto_tutor = ?, ultima_modificacion = NOW() WHERE id = ?", 
    [dni, fecha_nacimiento, contacto_tutor, studentId], (err) => {
        if (err) return res.status(500).json({ error: "Error en tabla alumno" });

        if (id_ficha) {
            // Caso A: Ya tiene ficha vinculada, la actualizamos
            db.query("UPDATE ficha SET datos_medicos = ?, adaptacion_curriculares = ? WHERE id_ficha = ?", 
            [datos_medicos, adaptacion_curriculares, id_ficha], (err) => {
                if (err) return res.status(500).json({ error: "Error en tabla ficha" });
                res.json({ message: "Guardado completo (Ficha actualizada)" });
            });
        } else {
            // Caso B: El alumno tiene id_ficha en NULL. Creamos la ficha primero.
            console.log("Detectado id_ficha NULL. Creando nueva ficha...");
            db.query("INSERT INTO ficha (datos_medicos, adaptacion_curriculares, fecha_creacion) VALUES (?, ?, NOW())",
            [datos_medicos, adaptacion_curriculares], (err, fichaResult) => {
                if (err) return res.status(500).json({ error: "Error al crear nueva ficha" });
                
                const newFichaId = fichaResult.insertId;
                // Vinculamos la nueva ficha al alumno
                db.query("UPDATE alumno SET id_ficha = ? WHERE id = ?", [newFichaId, studentId], (err) => {
                    if (err) return res.status(500).json({ error: "Error al vincular ficha" });
                    res.json({ message: "Ficha creada y alumno actualizado", id_ficha: newFichaId });
                });
            });
        }
    });
});

// --- RUTAS DE OBSERVACIONES ---

app.get('/alumnos/:id/observaciones', (req, res) => {
    db.query('SELECT * FROM observacion WHERE id_alumno = ? ORDER BY fecha DESC', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/alumnos/:id/observacion', (req, res) => {
    const { contenido, tipo, visible_tutor } = req.body;
    const query = 'INSERT INTO observacion (id_alumno, contenido, tipo, visible_tutor, fecha) VALUES (?, ?, ?, ?, NOW())';
    db.query(query, [req.params.id, contenido, tipo, visible_tutor], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Añadida" });
    });
});

// Borrar una observación por su id
app.delete('/observaciones/:id', (req, res) => {
  db.query('DELETE FROM observacion WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'No encontrado' });
    res.json({ message: 'Eliminada' });
  });
});

// --- RUTA DE LOGIN ---

app.post('/login', (req, res) => {
    const { correo, contrasenia } = req.body; 
    db.query('SELECT * FROM profesor WHERE email = ? AND activo = 1', [correo], (err, results) => {
        if (err || results.length === 0) return res.status(401).json({ message: 'Error de acceso.' });
        
        const prof = results[0];
        bcrypt.compare(contrasenia, prof.password_hash, (err, matches) => {
            if (matches) {
                res.status(200).json({ message: 'OK', profesor: { id: prof.id, nombre: prof.nombre } });
            } else {
                res.status(401).json({ message: 'Contraseña incorrecta.' });
            }
        });
    });
});

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));