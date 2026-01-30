const mysql = require('mysql');

// Conexión a la base de datos
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
    console.log('Conexión a MySQL establecida correctamente.');

    // Crear tabla de módulos
    const createModulosTable = `
        CREATE TABLE IF NOT EXISTS modulo (
            id INT AUTO_INCREMENT PRIMARY KEY,
            id_alumno INT NOT NULL,
            nombre VARCHAR(100) NOT NULL,
            codigo VARCHAR(50),
            horas INT DEFAULT 0,
            calificacion DECIMAL(3, 2),
            estado ENUM('Pendiente', 'Aprobado', 'Suspenso', 'En Progreso') DEFAULT 'Pendiente',
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (id_alumno) REFERENCES alumno(id) ON DELETE CASCADE,
            UNIQUE KEY unique_alumno_modulo (id_alumno, nombre)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    db.query(createModulosTable, (err, result) => {
        if (err) {
            console.error('Error al crear tabla modulo:', err);
            db.end();
            return;
        }
        console.log('Tabla modulo creada o ya existe.');
        db.end();
    });
});
