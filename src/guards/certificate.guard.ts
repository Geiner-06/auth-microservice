import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { createHash } from 'crypto';

@Injectable()
export class CertificateGuard implements CanActivate {
  private readonly expectedThumbprint: string;

  constructor() {
    // Lee la huella digital esperada de las variables de entorno
    this.expectedThumbprint = process.env.CLIENT_CERT_THUMBPRINT?.toUpperCase();
    if (!this.expectedThumbprint) {
      console.error('CLIENT_CERT_THUMBPRINT no está configurado en las variables de entorno.');
    }
  }

  canActivate(context: ExecutionContext): boolean {
    // Si no estamos en producción, saltamos la verificación para facilitar las pruebas locales
    if (process.env.NODE_ENV !== 'production') {
      return true;
    }
    
    const request = context.switchToHttp().getRequest();
    const clientCert = request.headers['x-arr-clientcert'];

    if (!clientCert) {
      throw new ForbiddenException('Cliente no presentó un certificado.');
    }
    
    if (!this.expectedThumbprint) {
        throw new ForbiddenException('La validación del certificado del cliente no está configurada en el servidor.');
    }

    // El certificado viene en formato PEM (codificado en Base64).
    // Necesitamos decodificarlo para calcular su huella.
    const pemContent = `-----BEGIN CERTIFICATE-----\n${clientCert}\n-----END CERTIFICATE-----`;
    
    // Convertimos el PEM a formato binario DER
    const derCert = Buffer.from(pemContent.replace(/-----BEGIN CERTIFICATE-----|-----END CERTIFICATE-----|\n/g, ''), 'base64');

    // Calculamos la huella SHA-1 del certificado DER
    const thumbprint = createHash('sha1').update(derCert).digest('hex').toUpperCase();
    
    // Comparamos la huella calculada con la que esperamos
    if (thumbprint !== this.expectedThumbprint) {
      throw new ForbiddenException('El certificado del cliente es inválido o no reconocido.');
    }

    return true;
  }
}