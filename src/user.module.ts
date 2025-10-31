import { Module } from '@nestjs/common';
import { AuthController } from './adapters/inbound/rest/controllers/auth.controller';
import { USER_REPOSITORY, TOKEN_SERVICE } from './domain/ports/constants';
import { GoogleAuthService } from './adapters/outbound/services/google-auth.service';
import { LoginOrRegisterUserUseCase } from './application/use-cases/login-or-register-user.usecase';
import { PostgresUserRepository } from './adapters/outbound/persistence/typeorm/postgres-user.repository';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './adapters/inbound/rest/strategies/jwt.strategy';


@Module({
  imports: [ 
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: (() => {
          const v = process.env.JWT_EXPIRES_IN;
          if (!v) return '1h';
          const n = Number(v);
          return Number.isNaN(n) ? v : n;
        })() as any,
      },
    }),
  ],
  
  // 1. Controladores: Las puertas de entrada a este módulo.
  controllers: [AuthController],

  // 2. Providers: Todas las clases que realizan trabajo (Casos de Uso, Adaptadores, etc.).
  providers: [
    // a) El Caso de Uso: El cerebro de la lógica.
    LoginOrRegisterUserUseCase,
    JwtStrategy,

    // b) El Mapeo de Puerto a Adaptador para la Base de Datos:
    //    Esto le dice a NestJS: "Cuando una clase pida 'UserRepository' (el contrato),
    //    dale una instancia de 'PostgresUserRepository' (la implementación real)".
    {
      provide: USER_REPOSITORY,
      useClass: PostgresUserRepository,
    },

    // c) El Mapeo de Puerto a Adaptador para los Tokens:
    //    Igual que antes, pero para el servicio de tokens. "Cuando alguien pida
    //    'TokenService', entrégale una instancia de 'GoogleAuthService'".
    {
      provide: TOKEN_SERVICE,
      useClass: GoogleAuthService,
    },
  ],
})
export class UserModule {}