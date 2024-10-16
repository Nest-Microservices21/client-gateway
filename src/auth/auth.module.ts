import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { NatsModule } from 'src/nats-client/nats.module';

@Module({
  controllers: [AuthController],
  imports: [NatsModule],

  providers: [AuthService],
  
})
export class AuthModule {}
