const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const PORT = 3000;
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

// Exportar db y SECRET_KEY globalmente para que lo usen los services
global.db = db;
global.SECRET_KEY = SECRET_KEY;

// Importar rutas
const authRoutes = require('./src/routes/authRoutes');
const alumnoRoutes = require('./src/routes/alumnoRoutes');
const profesorRoutes = require('./src/routes/profesorRoutes');
const observacionRoutes = require('./src/routes/observacionRoutes');
const cursoRoutes = require('./src/routes/cursoRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: '*', 
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rutas
app.use('/', authRoutes);
app.use('/', alumnoRoutes);
app.use('/', profesorRoutes);
app.use('/', observacionRoutes);
app.use('/', cursoRoutes);

// Iniciar servidor
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));