import { Controller, Get, Post, Body, Inject } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto, RegisterUserDto } from './dto';
import { NATS_SERVICE } from 'src/config/nats.config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}

  @Post('register')
  create(@Body() registerUserDto: RegisterUserDto) {
    return this.client.send({ cmd: 'auth.register_user' }, registerUserDto).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.client.send({ cmd: 'auth.login_user' }, loginUserDto);
  }

  @Get('verify')
  verifyUser() {
    return this.client.send({ cmd: 'auth.verify_user' }, {});
  }
}
