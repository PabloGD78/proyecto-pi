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
  const alter = "ALTER TABLE alumno ADD COLUMN ultima_modificacion DATETIME DEFAULT NULL";
  db.query(alter, (err) => {
    if (err) return console.error('Alter error:', err.message);
    console.log('Column ultima_modificacion added successfully');
    db.query('DESCRIBE alumno', (err, results) => {
      if (err) return console.error('Describe error:', err.message);
      console.table(results);
      db.end();
    });
  });
});
