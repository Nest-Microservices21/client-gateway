import {
  Controller,
  Post,
  Body,
  Inject,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto';
import { NATS_SERVICE } from 'src/config/nats.config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';
import { LocalAuthGuard, JwtRefreshAuthGuard, JwtAuthGuard } from './guards';
import { CurrentUser } from './interfaces/current-user.interface';
import { UserDecorator } from './decorators';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}

  @Post('register')
  create(@Body() registerUserDto: RegisterUserDto) {
    return this.client
      .send({ cmd: 'auth.register_user' }, registerUserDto)
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@UserDecorator() user: CurrentUser) {
    return this.client.send({ cmd: 'auth.login_user' }, user);
  }
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  refresh(@UserDecorator() user: CurrentUser) {
    return this.client.send({ cmd: 'auth.refresh_user' }, user);
  }
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@UserDecorator() user: CurrentUser) {
    return this.client.send({ cmd: 'auth.logout_user' }, user);
  }
}
