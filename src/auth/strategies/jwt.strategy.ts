import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { AuthJwtPayload } from '../interfaces/jwt-auth.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(jwtConfig.KEY)
    protected jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {
    super({
      secretOrKey: jwtConfiguration.secret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
    });
  }
  async validate(payload: AuthJwtPayload) {
    console.log(payload)
    return { userId: payload.sub,email:payload.email };
  }
}
