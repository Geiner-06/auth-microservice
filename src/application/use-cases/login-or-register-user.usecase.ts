import { User } from '../../domain/entities/user.entity';
import { LoginOrRegisterUserDTO } from '../dtos/login-or-register-user.dto';
import { v4 as uuidv4 } from 'uuid';
import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from 'src/domain/ports/user-repository.port';
import { USER_REPOSITORY } from 'src/domain/ports/constants';

@Injectable()
export class LoginOrRegisterUserUseCase {
  
  // El constructor recibe las "herramientas" que necesita para trabajar.
  // Pide el CONTRATO (UserRepository), no el implementador específico.
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository) {}

  // Este es el método principal que ejecuta la lógica.
  async execute(dto: LoginOrRegisterUserDTO): Promise<User> {
    // 1. Buscar si el usuario ya existe en nuestra base de datos.
    let user = await this.userRepository.findByEmail(dto.email);

    if (user) {
      // 2. Si el usuario existe (LOGIN):
      // Actualizamos su nombre y foto por si los cambió en Google.
      user.updateProfile({
        name: dto.name,
        picture: dto.picture,
      });

    } else {
      // 3. Si el usuario NO existe (REGISTRO):
      // Creamos una nueva instancia de la entidad User.
      user = new User({
        id: uuidv4(), // Generamos un nuevo ID único para nuestro sistema
        googleId: dto.googleId,
        email: dto.email,
        name: dto.name,
        picture: dto.picture,
      });
    }

    // 4. Guardamos el usuario (sea nuevo o actualizado) en la base de datos.
    await this.userRepository.save(user);
    
    // 5. Devolvemos la entidad del usuario.
    // Más adelante, en lugar de devolver el usuario, generaremos y devolveremos un token JWT.
    return user;
  }
}