import { Module, ValidationPipe } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { APP_PIPE } from '@nestjs/core';
import { NatsModule } from 'src/nats-client/nats.module';

@Module({
  controllers: [OrdersController],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        always: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    },
  ],
  imports: [NatsModule],
})
export class OrdersModule {}
