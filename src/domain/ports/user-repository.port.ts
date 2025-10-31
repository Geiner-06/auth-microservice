import { User } from '../entities/user.entity';

export interface UserRepository {

  /**
   * Busca un usuario por su ID único de nuestra base de datos.
   * Devuelve el usuario si lo encuentra, o null si no existe.
   */
  findById(id: string): Promise<User | null>;

  /**
   * Busca un usuario por su dirección de correo electrónico.
   * Devuelve el usuario si lo encuentra, o null si no existe.
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Guarda un usuario en la base de datos.
   * Esta función se encarga tanto de crear un usuario nuevo como de actualizar uno existente.
   */
  save(user: User): Promise<void>;

  /**
   * Elimina un usuario de la base de datos usando su ID.
   */
  delete(id: string): Promise<void>;

}