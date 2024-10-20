import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { ConfigModule } from '@nestjs/config';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';
@Module({
  imports: [
    ProductsModule,
    ConfigModule.forRoot({
      expandVariables: true,
      isGlobal: true,
    }),
    OrdersModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
