import { Controller, Inject, Post, Body, Get, UseGuards, Request, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { LoginOrRegisterUserUseCase } from '../../../../application/use-cases/login-or-register-user.usecase';
import { TokenService } from '../../../../domain/ports/token.service';
import {AuthGuard} from '@nestjs/passport';
import { GoogleLoginDto } from '../dtos/google-login.dto';
import { TOKEN_SERVICE } from 'src/domain/ports/constants';

@Controller('auth') // Todas las rutas en este archivo empezarán con /auth
export class AuthController {

  // Inyectamos nuestras herramientas a través del constructor
  constructor(
    private readonly loginOrRegisterUseCase: LoginOrRegisterUserUseCase,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenService,
  ) {}

  @Post('google/login') // Endpoint: POST /auth/google/login
  async googleLogin(@Body() googleLoginDto: GoogleLoginDto) {
    try {
      // --- PASO 1: Verificar el token de Google ---
      // Si el token es falso o ha expirado, el servicio lanzará un error.
      const googlePayload = await this.tokenService.verifyGoogleToken(googleLoginDto.idToken);

      // --- PASO 2: Ejecutar el Caso de Uso para registrar o loguear al usuario ---
      // Con la información ya validada de Google, ejecutamos nuestra lógica principal.
      // Esto encontrará o creará el usuario en nuestra base de datos.
      const user = await this.loginOrRegisterUseCase.execute({
        googleId: googlePayload.sub,
        email: googlePayload.email,
        name: googlePayload.name,
        picture: googlePayload.picture,
      });

      // --- PASO 3: Generar nuestro propio token de acceso (JWT) ---
      // Creamos nuestro propio "pase de acceso" que contiene el ID de nuestro usuario.
      const accessToken = await this.tokenService.generateAppToken({ userId: user.id });

      // --- PASO 4: Enviar la respuesta al frontend ---
      return {
        accessToken: accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          picture: user.picture,
        },
      };
    } catch (error) {
      if (error.message.includes('Token de Google inválido')) {
        // Si el error viene de la verificación, es un 401 Unauthorized.
        throw new UnauthorizedException(error.message);
      }
      // Para cualquier otro error inesperado, devolvemos un 500.
      console.error('Error en el login de Google:', error);
      throw new InternalServerErrorException('Ha ocurrido un error en el servidor.');
    }
  }
  @UseGuards(AuthGuard('jwt'))
    @Get('profile') // Endpoint: GET /auth/profile
    getProfile(@Request() req) {
      // El usuario autenticado estará disponible en req.user gracias al AuthGuard
      return {
        message: 'Esta es una ruta protegida.',
        user: req.user,
    };
  }
}