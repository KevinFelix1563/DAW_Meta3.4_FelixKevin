# API REST - Gestión de Tareas (Patrón MVC)

Este proyecto es una API RESTful desarrollada con Node.js, Express y MariaDB utilizando el ORM Sequelize. Implementa una arquitectura MVC para la gestión de usuarios (personas), tareas y etiquetas (tags), incluyendo relaciones complejas y autenticación de seguridad.

**Autor:** Kevin Yassir Felix Sanchez
**Institución:** Universidad Autónoma de Baja California (UABC) - Ingeniería en Computación

---

## Requisitos Previos

Para ejecutar este proyecto de manera local, es necesario tener instalado:
- **Node.js** (v18 o superior)
- **MariaDB** (Servidor corriendo localmente)

---

## Instalación y Configuración

Seguir estos pasos para levantar el entorno de desarrollo:

1. **Clonar el repositorio e instalar dependencias:**

   git clone https://github.com/KevinFelix1563/DAW_Meta3.4_FelixKevin

   cd backend_tareas

   npm install

2. **Configurar las variables de entorno:**

   Crear un archivo `.env` en la raíz de la carpeta `backend_tareas` basado en el siguiente ejemplo.
   
   PORT=3000

   CLIENT_URL=http://localhost:3001

   JWT_SECRET=mi_secreto_super_seguro_para_jwt_2024

   JWT_EXPIRES_IN=1h

   API_KEY=mi_api_key_secreta_12345

   COOKIE_MAX_AGE=3600000

   CSRF_TOKEN_SECRET=mi_secreto_csrf_super_seguro

   

3. **Crear la base de datos:**

   En gestor de MariaDB, asegúrse de crear una base de datos vacía (ej. `tareas_db`). Verificar que el archivo `config/config.json` de Sequelize apunte a esta base de datos con tu usuario y contraseña.

4. **Ejecutar Migraciones y Seeders:**

   Para construir la estructura de las tablas e inyectar los datos de prueba, ejecutar en orden:
   
   npx sequelize-cli db:migrate

   npx sequelize-cli db:seed:all
   

5. **Iniciar el servidor:**
   
   npm run dev
   
   El servidor estará escuchando en `http://localhost:3000`.

---

## Documentación OpenAPI (Swagger)

La API cuenta con documentación interactiva alojada de manera local. Para probar los endpoints:

1. Iniciar el servidor con `npm run dev`.
2. Navegar a: **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**.
3. **Autenticación:** Utilizar el botón `Authorize` ingresando la `API_KEY` en el recuadro `ApiKeyAuth (apiKey)`.
4. **Pruebas:** Realizar el inicio de sesión en `/auth/login` con el usuario de prueba (`kevin@uabc.edu.mx`).
5. **Autenticación** De la respuesta del login anterior copiar el token csrf dado por el servidor e ingresarlo en el recuadro `CsrfAuth (apiKey)` del boton `Authorize` del paso 3.

---

## Actividades Cubiertas en la Rúbrica

* **Actividad 1:** Implementación de Modelos, Migraciones y Seeders con Sequelize en MariaDB (Relaciones 1:N y N:M funcionales).
* **Actividad 2:** Implementación de controladores bajo el patrón MVC con rutas para relaciones directas e indirectas (ej. Búsqueda de Tareas por Tag).
* **Actividad 3:** Gestión de Usuarios. Registro, actualización de perfil y borrado lógico (cambio de estado Activo/Inactivo).
* **Actividad 4:** Documentación completa de la API en formato OpenAPI (YAML) integrada visualmente con Swagger UI.

---

## Evidencias de Ejecución
Demostración de autenticación JWT.
![Demostración de autenticación JWT.](screenshots/01-login-exitoso.png)

Demostración de consulta de Tareas por Etiqueta, en este caso TagId=1 o Urgente.
![Demostración de consulta de Tareas por Etiqueta, en este caso TagId=1 o Urgente.](screenshots/02-relacion-nm.png)

Interfaz de documentación generada.
![Interfaz de documentación generada.](screenshots/03-swagger-ui.png)
