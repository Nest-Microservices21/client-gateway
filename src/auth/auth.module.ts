import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { NatsModule } from 'src/nats-client/nats.module';
import { LocalStrategy, JwtStrategy } from './strategies';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
@Module({
  controllers: [AuthController],
  imports: [
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    NatsModule,
  ],

  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
