import { OAuth2Client } from 'google-auth-library';
import * as jwt from 'jsonwebtoken';
import { GooglePayload, TokenService } from '../../../domain/ports/token.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleAuthService implements TokenService {
  private googleClient: OAuth2Client;
  private readonly googleClientId: string;
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;

  constructor() {
    // --- Configuración de Google ---
    this.googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!this.googleClientId) {
      throw new Error('GOOGLE_CLIENT_ID no está definido en las variables de entorno');
    }
    this.googleClient = new OAuth2Client(this.googleClientId);

    // --- Configuración para nuestro JWT ---
    this.jwtSecret = process.env.JWT_SECRET;
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';
    if (!this.jwtSecret) {
      throw new Error('JWT_SECRET no está definido en las variables de entorno');
    }
  }

  async verifyGoogleToken(token: string): Promise<GooglePayload> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: this.googleClientId,
      });

      const payload = ticket.getPayload();

      if (!payload || !payload.sub || !payload.email || !payload.name) {
        throw new Error('Token de Google inválido o incompleto.');
      }

      return {
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      };
    } catch (error) {
      // El token es inválido (expirado, firma incorrecta, etc.)
      console.error('Error al verificar el token de Google:', error);
      throw new Error('Token de Google inválido.');
    }
  }

  async generateAppToken(payload: { userId: string }): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign(
        payload,
        this.jwtSecret as any,
        { expiresIn: this.jwtExpiresIn as any },
        (err, token) => {
          if (err || !token) {
            return reject(new Error('No se pudo generar el token de la aplicación.'));
          }
          resolve(token);
        }
      );
    });
  }
}