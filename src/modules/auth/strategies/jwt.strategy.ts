import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// Estrategia JWT que valida tokens enviados en el encabezado Authorization.
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  // Retorna los datos del usuario si el token es válido.
  async validate(payload: any) {
    return { id: payload.id, email: payload.email, role: payload.role, country: payload.country };
  }
}
