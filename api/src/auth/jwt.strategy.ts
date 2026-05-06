import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

const JWT_SECRET = process.env.JWT_SECRET || 'solar-storage-jwt-secret-key-change-in-production-2024';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    });
  }

  async validate(payload: any) {
    if (!payload.username || !payload.sub) {
      throw new UnauthorizedException();
    }
    return { 
      userId: payload.sub, 
      username: payload.username, 
      role: payload.role 
    };
  }
}
