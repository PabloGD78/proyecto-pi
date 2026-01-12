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
  db.query('DESCRIBE alumno', (err, results) => {
    if (err) return console.error('Query error:', err.message);
    console.table(results);
    db.end();
  });
});
