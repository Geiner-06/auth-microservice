import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  // Passport se encarga de verificar el token. Si es válido,
  // este método se ejecuta y su retorno se adjunta al objeto 'request'.
  async validate(payload: { userId: string }) {
    return { userId: payload.userId };
  }
}