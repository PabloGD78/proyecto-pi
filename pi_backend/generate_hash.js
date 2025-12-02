// generate_hash.js

// Asume que tu backend usa bcrypt
const bcrypt = require('bcrypt'); 

// ⚠️ Define tu contraseña de prueba aquí
const password = '12345678'; 
const saltRounds = 10; // Usa el mismo 'salt' que usa tu backend

bcrypt.hash(password, saltRounds, function(err, hash) {
    if (err) {
        console.error(err);
    } else {
        console.log("Contraseña de prueba:", password);
        console.log("------------------------------------------------------------------");
        console.log("Hash generado: COPIA ESTE VALOR LARGO Y ÚSALO EN MySQL:", hash);
        console.log("------------------------------------------------------------------");
    }
});