// Esta interfaz define la información que extraemos de un token de Google verificado.
export interface GooglePayload {
  sub: string; // El ID único de Google para este usuario
  email: string;
  name: string;
  picture?: string;
}

export interface TokenService {

  /**
   * Verifica un idToken de Google y devuelve su contenido si es válido.
   * Si el token no es válido (firma incorrecta, expirado, etc.), debe lanzar un error.
   * @param token El idToken de Google.
   * @returns Una promesa que resuelve con el payload del token.
   */
  verifyGoogleToken(token: string): Promise<GooglePayload>;

  /**
   * Genera un token de acceso (JWT) para nuestra aplicación.
   * Este token se le entregará al usuario para que lo use en peticiones posteriores.
   * @param payload El contenido que queremos incluir en el token (ej. el ID de usuario).
   * @returns El token JWT como una cadena de texto.
   */
  generateAppToken(payload: { userId: string }): Promise<string>;

}