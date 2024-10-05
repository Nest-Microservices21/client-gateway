import { registerAs } from '@nestjs/config';

export const ORDERS_SERVICE = 'ORDER_SERVICE';

export default registerAs('order-ms', () => ({
  host: process.env.ORDER_MICROSERVICE_HOST,
  port: parseInt(process.env.ORDER_MICROSERVICE_PORT, 10) || 5432,
}));
