import { Module, ValidationPipe } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import productsConfig, { PRODUCTS_SERVICE } from 'src/config/products.config';
import { APP_PIPE } from '@nestjs/core';

@Module({
  controllers: [ProductsController],
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
  imports: [
    ClientsModule.registerAsync([
      {
        name: PRODUCTS_SERVICE,
        imports: [ConfigModule.forFeature(productsConfig)],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('product-ms.host'),
            port: configService.get<number>('product-ms.port'),
          },
        }),
      },
    ]),
  ],
})
export class ProductsModule {}
