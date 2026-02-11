GUÍA DE INSTALACIÓN
PiFichas – Ficha/Informe de Alumnos • 10/02/2026

1. Objetivo
Esta guía explica cómo instalar y arrancar la aplicación web PiFichas (Angular +
Node.js/Express + MySQL) en un entorno local.
El resultado final será:
● Backend API ejecutándose en http://localhost:3000
● Frontend Angular ejecutándose en http://localhost:4200
● Base de datos MySQL cargada con el script suministrado

2. Requisitos previos
2.1 Software
● Windows 10/11 (entorno recomendado).
● Node.js (LTS recomendado) y npm.
● Angular CLI (instalable vía npm).
● Servidor MySQL (por ejemplo, XAMPP/MariaDB o MySQL Workbench).
● Navegador moderno (Chrome/Edge/Firefox).
2.2 Puertos
● 3000 (Backend Express)
● 4200 (Frontend Angular)
● 3306 (MySQL por defecto)

3. Estructura del proyecto
En el ZIP del proyecto se incluyen dos carpetas principales:
● pi_backend/ → API REST en Node.js + Express (archivo de arranque: indexpi.js)
● pifichas-angular/ → Aplicación Angular (arranque: ng serve)
Además, el backend expone rutas como /login y varias rutas protegidas por JWT (token).

4. Instalación de la base de datos (MySQL)
1) Crea una base de datos vacía en MySQL.

Según el código del backend, el nombre de base de datos esperado es: ficha/informe
Nota: el nombre contiene '/'. Si tu herramienta no lo admite, puedes crear una base con
nombre alternativo (p.ej. ficha_informe) y ajustar el parámetro database en indexpi.js.
2) Importa el script SQL proporcionado (ficha_informe.sql).
Opción A: phpMyAdmin (recomendado)
● Abre phpMyAdmin → 'Nueva' → crea la BD (p.ej. ficha/informe).
● Selecciona la BD → pestaña 'Importar' → elige el .sql → 'Continuar'.
Opción B: Consola MySQL
Ejemplo (ajusta usuario y ruta):
mysql -u root -p
CREATE DATABASE `ficha/informe`;
exit
mysql -u root -p `ficha/informe` < ruta\a\ficha_informe.sql

5. Configuración del backend
El backend NO usa .env en este proyecto. La configuración está en pi_backend/indexpi.js:
● Puerto: 3000
● Conexión MySQL: host, user, password, database
● JWT: SECRET_KEY (clave usada para firmar y validar tokens)
Si tu MySQL no usa usuario root sin contraseña, modifica estos campos en indexpi.js antes
de arrancar.

6. Arranque del backend (Node.js/Express)
1) Abre una terminal en la carpeta pi_backend.
cd pi_backend
npm install
npm start
2) Verifica que aparece un mensaje de conexión correcta a MySQL y que el servidor escucha
en el puerto 3000.
Comprobación rápida:
http://localhost:3000 (el backend responde a rutas como /login)

7. Arranque del frontend (Angular)
1) Abre otra terminal en la carpeta pifichas-angular.
cd pifichas-angular
npm install
npm start
2) Abre el navegador en: http://localhost:4200
La aplicación redirige a /login y consume el backend en http://localhost:3000.

8. Credenciales y primer acceso
La base de datos incluye un usuario administrador (rol: admin).
● Email: admin@sistema.com
● Contraseña: (la definida en el script/BD). Si no la recuerdas, puedes resetearla
actualizando el password_hash en la tabla profesor.
Nota: el backend emite un JWT con caducidad de 4 horas. Si expira, basta con volver a iniciar
sesión.

9. Problemas habituales y solución rápida
9.1 Error de conexión a MySQL
● Comprueba que MySQL está arrancado (servicio/XAMPP).
● Revisa host/usuario/password/database en pi_backend/indexpi.js.
● Asegura que la base de datos existe y el script se importó sin errores.
9.2 Puerto ocupado (3000/4200)
● Cierra procesos previos o cambia el puerto en indexpi.js (backend) o en ng serve
(frontend).
9.3 Login falla con “Error de acceso”
● Verifica que el usuario existe en la tabla profesor y activo=1.
● Comprueba que estás usando el email correcto.
● Si no conoces la contraseña, crea un profesor nuevo desde la sección de administración
(si tienes acceso) o resetea en BD.
