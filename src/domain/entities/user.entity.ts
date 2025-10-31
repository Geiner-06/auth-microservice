export class User {
  readonly id: string; // Nuestro ID interno en la base de datos
  googleId: string;    // El ID único que Google le da al usuario ('sub' en el token)
  name: string;
  email: string;       // El email es único
  picture?: string;

  readonly createdAt: Date;
  updatedAt: Date;

  constructor(props: {
    id: string;
    googleId: string;
    name: string;
    email: string;
    picture?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.googleId = props.googleId;
    this.name = props.name;
    this.email = props.email;
    this.picture = props.picture;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  // Lógica de negocio futura podría ir aquí, por ejemplo, actualizar el nombre o la foto
  updateProfile(data: { name?: string; picture?: string }): void {
    if (data.name) {
      this.name = data.name;
    }
    if (data.picture) {
      this.picture = data.picture;
    }
    this.touch();
  }

  private touch(): void {
    this.updatedAt = new Date();
  }
}