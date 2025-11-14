# **Microservicio de Autenticación - Proyecto Roomiefy**

## 1. Introducción y Propósito

Este microservicio es el pilar central de la identidad y seguridad dentro del ecosistema de Roomiefy. Su única responsabilidad es gestionar la autenticación de usuarios y emitir los tokens de acceso que les permitirán interactuar de forma segura con el resto de los microservicios de la plataforma (como el de Propiedades, Chat, etc.).

**Principios Clave:**
*   **Fuente Única de Verdad:** Este servicio es el único que conoce la tabla `users` y gestiona la validación de credenciales.
*   **Sin Estado (Stateless):** La autenticación se basa en JSON Web Tokens (JWT), lo que significa que el servidor no necesita mantener un registro de las sesiones activas. Cada token es autónomo y verificable por sí mismo.
*   **Desacoplado:** No tiene conocimiento de la lógica de negocio de otros servicios. Su trabajo termina al entregar un token válido.

---

## 2. Arquitectura General

El sistema sigue una arquitectura de microservicios distribuida, orquestada a través de una puerta de enlace de API (API Gateway).

```
+----------------+      +-------------------------+      +---------------------------+      +---------------------+
|                |      |                         |      |                           |      |                     |
|  Frontend      |----->| Azure API Management    |----->| Microservicio de          |----->| Base de Datos       |
|  (React App)   |      | (APIM - Gateway)        |      | Autenticación (Este Proy.)|      | (Azure PostgreSQL)  |
|                |      |                         |      |                           |      |                     |
+----------------+      +-------------------------+      +---------------------------+      +---------------------+

```

*   **Frontend (React):** La aplicación web que consume los servicios. Es responsable de gestionar el flujo de inicio de sesión de Google y de almacenar y enviar los tokens.
*   **Azure API Management (APIM):** Actúa como la única puerta de entrada pública. Gestiona la seguridad (claves de suscripción, CORS), el enrutamiento y las políticas antes de reenviar las peticiones a los microservicios correspondientes.
*   **Microservicio de Autenticación (Este Proyecto):** Un servicio de NestJS desplegado en Azure App Service. Su única tarea es validar usuarios y emitir tokens.

---

## 3. Pila Tecnológica (Tech Stack)

| Categoría | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Backend** | Node.js, NestJS, TypeScript | Framework para construir el microservicio. |
| **Base de Datos** | PostgreSQL | Almacenamiento de la tabla `users`. |
| **Autenticación** | Passport.js (`passport-jwt`) | Middleware para proteger endpoints y validar JWTs. |
| **Tokens** | `jsonwebtoken` (`@nestjs/jwt`) | Creación y verificación de JSON Web Tokens. |
| **Nube** | Azure App Service | Alojamiento y ejecución del microservicio. |
| **Nube** | Azure Database for PostgreSQL | Base de datos administrada. |
| **Nube** | Azure API Management | Gateway de API para gestionar y proteger los endpoints. |

---

## 4. Flujo de Autenticación

Este es el proceso más importante del servicio. Se divide en dos etapas: el inicio de sesión inicial y la renovación de la sesión.

### 4.1. Flujo de Inicio de Sesión Inicial

1.  **Usuario -> Frontend:** El usuario hace clic en "Iniciar Sesión con Google".
2.  **Frontend -> Google:** La librería de Google gestiona el pop-up y la autenticación.
3.  **Google -> Frontend:** Google devuelve un `idToken` de un solo uso.
4.  **Frontend -> APIM -> Auth Service (`POST /auth/google/login`):** El frontend envía el `idToken` de Google al backend.
5.  **Auth Service:**
    a.  Recibe el `idToken`.
    b.  Usa la librería `google-auth-library` y el `GOOGLE_CLIENT_ID` para **verificar que el token de Google sea auténtico**.
    c.  Extrae el email, nombre y foto del usuario.
    d.  Busca al usuario en la base de datos de PostgreSQL por su email.
    e.  Si el usuario no existe, lo crea. Si existe, lo actualiza.
6.  **Auth Service -> Frontend:** Devuelve el token (`accessToken`) y la información del usuario.

## 5. Endpoints de la API

| Verbo | Ruta | Descripción | Autenticación | Cuerpo (Request) | Respuesta Exitosa (2xx) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/google/login` | Inicia sesión o registra a un usuario usando un `idToken` de Google. | Pública | `{ "idToken": "string" }` | `{ "accessToken": "string", "refreshToken": "string", "user": { ... } }` |
| `GET` | `/auth/profile` | **(Ejemplo)** Ruta protegida que devuelve el `userId` del token. | **JWT Requerido** | (Ninguno) | `{ "userId": "string" }` |

---

## 6. Configuración y Puesta en Marcha Local

Para ejecutar este microservicio en un entorno de desarrollo:

1.  **Clonar el Repositorio:**
    ```bash
    git clone <url-del-repositorio>
    cd <nombre-del-repositorio>
    ```

2.  **Instalar Dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar la Base de Datos:**
    Se recomienda usar PostgreSQL en un contenedor de Docker para el desarrollo local.

4.  **Variables de Entorno:**
    Crear un archivo `.env` en la raíz del proyecto, basado en el archivo `.env.example`. Rellenar los siguientes valores:
    *   `POSTGRES_HOST`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, etc. (para la base de datos local).
    *   `GOOGLE_CLIENT_ID` (obtenido de la Google Cloud Console).
    *   `JWT_SECRET` (generar una cadena aleatoria y segura).

5.  **Ejecutar la Aplicación:**
    ```bash
    npm run start:dev
    ```
    El servidor se iniciará en `http://localhost:3000` (o el puerto definido en `.env`).
