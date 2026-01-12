const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ficha/informe'
});

db.connect(err => {
  if (err) return console.error('Connection error:', err.message);
  console.log('Connected to DB');
  const alter = "ALTER TABLE alumno ADD COLUMN id_curso INT(11) DEFAULT NULL";
  db.query(alter, (err) => {
    if (err) {
      if (err.code === 'ER_DUP_FIELDNAME' || err.errno === 1060) {
        console.log('La columna id_curso ya existe. Nada que hacer.');
      } else {
        return console.error('Alter error:', err.message);
      }
    } else {
      console.log('Column id_curso added successfully');
    }

    // Optionally add foreign key if curso table exists and constraint name unique
    const fk = "ALTER TABLE alumno ADD CONSTRAINT alumno_ibfk_curso FOREIGN KEY (id_curso) REFERENCES curso (id) ON DELETE SET NULL ON UPDATE CASCADE";
    db.query(fk, (err) => {
      if (err) {
        if (err.errno === 1005 || err.errno === 1215 || err.code === 'ER_CANT_CREATE_TABLE') {
          console.log('No se pudo añadir la FK (posible que ya exista o que falte la tabla curso).', err.message);
        } else {
          console.error('FK error:', err.message);
        }
      } else {
        console.log('Foreign key added successfully');
      }
      db.end();
    });
  });
});
