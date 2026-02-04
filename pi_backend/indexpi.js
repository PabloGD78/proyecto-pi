const express = require('express');
const app = express();
const PORT = 3000;
const bcrypt = require('bcrypt');
const mysql = require('mysql'); 
const cors = require('cors'); 
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'tu_clave_secreta_super_segura';

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

app.use(cors({
    origin: '*', 
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. MIDDLEWARE: El "Portero" del Backend
const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: "No se proporcionó un token." });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Token inválido o expirado." });
        }
        req.profesorId = decoded.id;
        req.profesorRol = decoded.rol; // Guardamos el rol para validaciones
        next();
    });
};

// --- RUTA DE LOGIN (Genera el Token con ROL) ---

app.post('/login', (req, res) => {
    const { correo, contrasenia } = req.body; 
    db.query('SELECT * FROM profesor WHERE email = ? AND activo = 1', [correo], (err, results) => {
        if (err || results.length === 0) return res.status(401).json({ message: 'Error de acceso.' });
        
        const prof = results[0];
        bcrypt.compare(contrasenia, prof.password_hash, (err, matches) => {
            if (matches) {
                const token = jwt.sign(
                    { id: prof.id, nombre: prof.nombre, rol: prof.rol }, 
                    SECRET_KEY, 
                    { expiresIn: '4h' }
                );

                res.status(200).json({ 
                    message: 'OK', 
                    token: token,
                    profesor: { id: prof.id, nombre: prof.nombre, rol: prof.rol } 
                });
            } else {
                res.status(401).json({ message: 'Contraseña incorrecta.' });
            }
        });
    });
});

// --- RUTAS DE ALUMNOS (Visión Global para Admin) ---

app.get('/alumnos', verificarToken, (req, res) => {
    // MODIFICADO: Forzar limpieza de caché para evitar datos fantasma
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    
    let query = `
        SELECT a.*, f.datos_medicos, f.adaptacion_curriculares, 
                p.nombre AS tutor_nombre,
                CONCAT(c.anio, 'º', c.nombre) AS curso_nombre
        FROM alumno a
        LEFT JOIN ficha f ON a.id_ficha = f.id_ficha
        LEFT JOIN curso c ON a.id_curso = c.id
        LEFT JOIN profesor p ON a.id_profesor = p.id`;

    let queryParams = [];
    if (req.profesorRol !== 'admin') {
        query += ` WHERE a.id_profesor = ?`;
        queryParams.push(req.profesorId);
    }
  
    db.query(query, queryParams, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// --- RUTAS DE GESTIÓN DE PROFESORES (Solo Admin) ---

app.get('/admin/profesores', verificarToken, (req, res) => {
    if (req.profesorRol !== 'admin') return res.status(403).json({ message: "No autorizado" });

    // MODIFICACIÓN AÑADIDA: Forzar al navegador a no usar caché para esta ruta
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const query = `
        SELECT id, nombre, email, rol, activo, fecha_alta,
        (SELECT COUNT(*) FROM alumno WHERE id_profesor = profesor.id) AS total_alumnos
        FROM profesor`;
    
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/admin/profesores', verificarToken, (req, res) => {
    if (req.profesorRol !== 'admin') return res.status(403).json({ message: "No autorizado" });

    const { nombre, email, contrasenia, rol } = req.body;
    const hash = bcrypt.hashSync(contrasenia, 10);

    const query = 'INSERT INTO profesor (nombre, email, password_hash, rol, activo, fecha_alta) VALUES (?, ?, ?, ?, 1, NOW())';
    db.query(query, [nombre, email, hash, rol || 'profesor'], (err) => {
        if (err) return res.status(500).json({ error: "El correo ya existe o hay un error" });
        res.status(201).json({ message: "Profesor creado" });
    });
});

app.delete('/admin/profesores/:id', verificarToken, (req, res) => {
    if (req.profesorRol !== 'admin') return res.status(403).json({ message: "No autorizado" });

    const idAEliminar = req.params.id;
    if (idAEliminar == req.profesorId) return res.status(400).json({ message: "No puedes borrarte a ti mismo" });

    db.query('DELETE FROM profesor WHERE id = ?', [idAEliminar], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Eliminado correctamente" });
    });
});

// --- RESTO DE RUTAS ---

app.post('/alumnos', verificarToken, (req, res) => {
    const { nombre, apellidos, dni, fecha_nacimiento, contacto_tutor, id_curso } = req.body;
    const query = `INSERT INTO alumno (nombre, apellidos, dni, fecha_nacimiento, contacto_tutor, id_curso, id_profesor, ultima_modificacion) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`;
    db.query(query, [nombre, apellidos, dni, fecha_nacimiento, contacto_tutor, id_curso, req.profesorId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Éxito", id: result.insertId });
    });
});

app.get('/alumnos/:id', verificarToken, (req, res) => {
    let query = `SELECT a.*, f.datos_medicos, f.adaptacion_curriculares, f.id_ficha, CONCAT(c.anio, 'º', c.nombre) AS curso_nombre FROM alumno a LEFT JOIN ficha f ON a.id_ficha = f.id_ficha LEFT JOIN curso c ON a.id_curso = c.id WHERE a.id = ?`;
    let params = [req.params.id];

    if (req.profesorRol !== 'admin') {
        query += " AND a.id_profesor = ?";
        params.push(req.profesorId);
    }

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: "No encontrado" });
        res.json(results[0]);
    });
});

app.put('/alumnos/:id/guardar', verificarToken, (req, res) => {
    const { dni, fecha_nacimiento, contacto_tutor, datos_medicos, adaptacion_curriculares, id_ficha } = req.body;
    const studentId = req.params.id;
    
    let queryUpdate = "UPDATE alumno SET dni = ?, fecha_nacimiento = ?, contacto_tutor = ?, ultima_modificacion = NOW() WHERE id = ?";
    let paramsUpdate = [dni, fecha_nacimiento, contacto_tutor, studentId];

    if (req.profesorRol !== 'admin') {
        queryUpdate += " AND id_profesor = ?";
        paramsUpdate.push(req.profesorId);
    }

    db.query(queryUpdate, paramsUpdate, (err, result) => {
        if (err) return res.status(500).json({ error: "Error en tabla alumno" });
        if (result.affectedRows === 0) return res.status(403).json({ error: "No tienes permiso" });

        if (id_ficha) {
            db.query("UPDATE ficha SET datos_medicos = ?, adaptacion_curriculares = ? WHERE id_ficha = ?", [datos_medicos, adaptacion_curriculares, id_ficha], (err) => {
                if (err) return res.status(500).json({ error: "Error en tabla ficha" });
                res.json({ message: "Guardado" });
            });
        } else {
            db.query("INSERT INTO ficha (datos_medicos, adaptacion_curriculares, fecha_creacion) VALUES (?, ?, NOW())", [datos_medicos, adaptacion_curriculares], (err, fichaResult) => {
                if (err) return res.status(500).json({ error: "Error al crear ficha" });
                const newFichaId = fichaResult.insertId;
                db.query("UPDATE alumno SET id_ficha = ? WHERE id = ?", [newFichaId, studentId], () => res.json({ message: "Vinculada" }));
            });
        }
    });
});

app.get('/cursos', (req, res) => {
    db.query('SELECT id, nombre, anio FROM curso ORDER BY anio, nombre', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/cursos/:id/modulos', (req, res) => {
    db.query('SELECT * FROM modulo WHERE id_curso = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/alumnos/:id/observaciones', verificarToken, (req, res) => {
    let query = 'SELECT o.* FROM observacion o JOIN alumno a ON o.id_alumno = a.id WHERE o.id_alumno = ?';
    let params = [req.params.id];
    if (req.profesorRol !== 'admin') {
        query += " AND a.id_profesor = ?";
        params.push(req.profesorId);
    }
    db.query(query + ' ORDER BY o.fecha DESC', params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/alumnos/:id/observacion', verificarToken, (req, res) => {
    const { contenido, tipo, visible_tutor } = req.body;
    db.query('INSERT INTO observacion (id_alumno, contenido, tipo, visible_tutor, fecha) VALUES (?, ?, ?, ?, NOW())', [req.params.id, contenido, tipo, visible_tutor], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Añadida" });
    });
});

app.delete('/observaciones/:id', verificarToken, (req, res) => {
    db.query('DELETE FROM observacion WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Eliminada' });
    });
});

app.get('/alumnos/:id/modulos', verificarToken, (req, res) => {
    let query = `SELECT m.nombre_modulo, m.horas, am.estado, am.id_modulo FROM modulo m INNER JOIN alumno_modulo am ON m.id_modulo = am.id_modulo INNER JOIN alumno a ON am.id_alumno = a.id WHERE am.id_alumno = ?`;
    let params = [req.params.id];
    if (req.profesorRol !== 'admin') {
        query += " AND a.id_profesor = ?";
        params.push(req.profesorId);
    }
    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.delete('/modulos/:id_modulo/alumno/:id_alumno', verificarToken, (req, res) => {
    db.query('DELETE FROM alumno_modulo WHERE id_modulo = ? AND id_alumno = ?', [req.params.id_modulo, req.params.id_alumno], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Módulo desvinculado' });
    });
});

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));