GUÍA DE USUARIO
PiFichas – Ficha/Informe de Alumnos • 10/02/2026

1. ¿Qué es PiFichas?
PiFichas es una aplicación web para centralizar la información del alumnado y generar
fichas/informes en PDF. Incluye autenticación mediante login y gestión de datos académicos
con observaciones y módulos.
● Profesor: gestión de alumnado, fichas y observaciones.
● Administrador: gestión adicional de profesorado.

2. Acceso al sistema
● Abrir la aplicación en http://localhost:4200
● Introducir correo y contraseña en la pantalla de Login.
● Si la sesión caduca, volver a iniciar sesión.

3. Pantalla principal
● Búsqueda y selección de alumnado.
● Acceso al detalle del alumno/a.

4. Ficha del alumno/a
4.1 Datos del alumno/a
● DNI
● Fecha de nacimiento
● Contacto del tutor
● Datos médicos
● Adaptaciones curriculares
● Guardar los cambios para que queden registrados en la base de datos.
4.2 Observaciones
● Añadir observaciones asociadas al alumno/a.
● Definir visibilidad al tutor cuando corresponda.
● Eliminar observaciones existentes.

4.3 Módulos
La sección de módulos permite asociar módulos al alumno/a.
● Nombre del módulo.
● Añadir nuevos módulos.
4.4 Generación de informe en PDF
● Revisar que la información esté actualizada.
● Generar y descargar el informe en formato PDF.

5. Gestión de profesorado (administración)
● Ver listado de profesores.
● Crear profesor (nombre, email, contraseña).
● Eliminar profesor.
● Recomendación: restringir el uso de esta sección a personal autorizado

6. Buenas prácticas
● No compartir credenciales.
● Registrar solo información necesaria.
● Cerrar sesión en equipos compartidos.

7. Preguntas frecuentes
No puedo iniciar sesión
● Verificar credenciales.
● Comprobar que el backend está operativo.
No se guardan cambios
• Comprueba que MySQL está activo.
• Revisa errores en pantalla y consola del backend.
• No se genera el PDF
• Prueba otro navegador.
• Permite descargas si el navegador las bloquea.
