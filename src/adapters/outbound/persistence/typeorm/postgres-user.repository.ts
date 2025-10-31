import { Pool } from 'pg'; // El cliente para conectar a PostgreSQL
import { Injectable } from '@nestjs/common';
import { User } from 'src/domain/entities/user.entity';
import { UserRepository } from 'src/domain/ports/user-repository.port';

@Injectable()
export class PostgresUserRepository implements UserRepository {
  private pool: Pool;

  constructor() {
    // Aquí se configura la conexión a la base de datos.
    this.pool = new Pool({
      user: process.env.POSTGRES_USER,
      host: process.env.POSTGRES_HOST,
      database: process.env.POSTGRES_DB,
      password: process.env.POSTGRES_PASSWORD,
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      ssl: {
        rejectUnauthorized: false 
      }
    });
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return null; // No se encontró el usuario
    }

    const dbRow = result.rows[0];
    return new User({
        id: dbRow.id,
        googleId: dbRow.google_id,
        name: dbRow.name,
        email: dbRow.email,
        picture: dbRow.picture,
        createdAt: dbRow.created_at,
        updatedAt: dbRow.updated_at,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return null;
    }
    
    const dbRow = result.rows[0];
    return new User({
        id: dbRow.id,
        googleId: dbRow.google_id,
        name: dbRow.name,
        email: dbRow.email,
        picture: dbRow.picture,
        createdAt: dbRow.created_at,
        updatedAt: dbRow.updated_at,
    });
  }

  async save(user: User): Promise<void> {
    // Esta consulta usa una característica de PostgreSQL llamada "UPSERT".
    // Intenta INSERTAR. Si falla porque el email ya existe (conflicto), entonces hace un UPDATE.
    const query = `
      INSERT INTO users (id, google_id, name, email, picture, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) 
      DO UPDATE SET
        name = EXCLUDED.name,
        picture = EXCLUDED.picture,
        updated_at = EXCLUDED.updated_at;
    `;

    const values = [
      user.id,
      user.googleId,
      user.name,
      user.email,
      user.picture,
      user.createdAt,
      user.updatedAt,
    ];

    await this.pool.query(query, values);
  }

  async delete(id: string): Promise<void> {
    await this.pool.query('DELETE FROM users WHERE id = $1', [id]);
  }
}