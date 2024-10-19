import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigType } from '@nestjs/config';
import { AuthJwtPayload } from '../interfaces/jwt-auth.interface';
import jwtRefreshConfig from '../config/jwt-refresh.config';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { NATS_SERVICE } from 'src/config/nats.config';
import { ClientProxy } from '@nestjs/microservices';
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(
    @Inject(jwtRefreshConfig.KEY)
    protected jwtRefreshConfiguration: ConfigType<typeof jwtRefreshConfig>,
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {
    super({
      secretOrKey: jwtRefreshConfiguration.secret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }
  async validate(req: Request, payload: AuthJwtPayload) {
    const refreshToken = req.get('authorization').replace('Bearer', '').trim();
    try {
      const $validatedToken = await firstValueFrom(
        this.client.send(
          { cmd: 'auth.validate_refresh_token' },
          { id: payload.sub, refreshToken },
        ),
      );
      return $validatedToken;
    } catch (error) {
      if (error instanceof Object && 'status' in error) {
        if (error.status === HttpStatus.UNAUTHORIZED)
          throw new UnauthorizedException(error);
        if (error.status === HttpStatus.BAD_REQUEST)
          throw new BadRequestException(error);
      }
      throw new BadRequestException(
        'The server is down. Please try again later.',
      );
    }
  }
}
