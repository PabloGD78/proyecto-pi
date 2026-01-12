const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ficha/informe'
});

db.connect(err => {
  if (err) return console.error('Connection error:', err.message);
  const deleteQuery = "DELETE FROM alumno WHERE nombre = 'Prueba' OR dni = '87654321B'";
  db.query(deleteQuery, (err, result) => {
    if (err) return console.error('Delete error:', err.message);
    console.log('Filas eliminadas:', result.affectedRows);
    db.query("SELECT * FROM alumno WHERE nombre = 'Prueba' OR dni = '87654321B'", (err, rows) => {
      if (err) return console.error('Select error:', err.message);
      console.log('Filas encontradas después del borrado:');
      console.table(rows);
      db.end();
    });
  });
});
