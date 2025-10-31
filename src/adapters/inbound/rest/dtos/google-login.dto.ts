import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleLoginDto {
  @IsString({ message: 'El idToken debe ser un texto.' })
  @IsNotEmpty({ message: 'El idToken no puede estar vacío.' })
  idToken: string;
}