import { Catch, ArgumentsHost } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';
@Catch(RpcException)
export class ExceptionFilter implements ExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const message = exception.message;
    const error = exception.getError();
    if (error instanceof Object && 'status' in error) {
      const statusCode = error.status as number;
      return response.status(statusCode).json({
        statusCode,
        message,
      });
    }
    return response.status(500).json({
      statusCode: 500,
      message: 'Internal Server Error',
    });
  }
}
