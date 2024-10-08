import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ExceptionFilter } from './common/exceptions/rpc-exception.filter';

async function bootstrap() {
  const logger = new Logger('Main-Gateway');
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api')
  app.useGlobalFilters(new ExceptionFilter())
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`🚀 Client Gateway successfully running on http://localhost:${port}/api`);
}
bootstrap();
