import { Module, ValidationPipe } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import ordersConfig, { ORDERS_SERVICE } from 'src/config/orders.config';
import { APP_PIPE } from '@nestjs/core';

@Module({
  controllers: [OrdersController],
  providers: [ {
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
    },],
  imports: [
    ClientsModule.registerAsync([
      {
        name: ORDERS_SERVICE,
        imports: [ConfigModule.forFeature(ordersConfig)],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('order-ms.host'),
            port: configService.get<number>('order-ms.port'),
          },
        }),
      },
    ]),
  ],
})
export class OrdersModule {}
