import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user.module';

@Module({
  imports: [
    // Módulo para gestionar variables de entorno (.env) de forma nativa en NestJS
    ConfigModule.forRoot({
      isGlobal: true, // Hace que las variables de entorno estén disponibles en toda la app
    }),
    
    UserModule, // <-- 2. Añade nuestro módulo a la lista de importaciones
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}