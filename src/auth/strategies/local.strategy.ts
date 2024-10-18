import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { plainToClass } from 'class-transformer';
import { LoginUserDto } from '../dto';
import { validate } from 'class-validator';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config/nats.config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {
    super({ usernameField: 'email' });
  }

  authenticate(req: Request, options?: any) {
    const { email, password } = req.body;
    if (!email || !password)
      throw new BadRequestException('Please provide email and password');

    super.authenticate(req, options);
  }
  async validate(email: string, password: string) {
    const loginUserDto = plainToClass(LoginUserDto, { email, password });
    const errors = await validate(loginUserDto);
    if (errors.length > 0) {
      const messages = errors.map((error) =>
        Object.values(error.constraints).join(','),
      );
      throw new BadRequestException(messages);
    }
    try {
      const user$ = await firstValueFrom(
        this.client.send({ cmd: 'auth.validate_user' }, loginUserDto),
      );

      return user$;
    } catch (error: unknown) {
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
