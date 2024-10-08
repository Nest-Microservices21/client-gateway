import { Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';
interface CustomError {
  status?: number;
  message: string;
}

@Catch(RpcException)
export class ExceptionFilter implements ExceptionFilter {

  catch(exception: RpcException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const message = exception.message;
    const error = exception.getError();

    // Manejo de excepciones específicas
    if (this.isEmptyResponseError(message)) {
      return this.handleEmptyResponse(response);
    }

    if (this.hasCustomStatusCode(error)) {
      return this.handleCustomError(response, error as CustomError, message);
    }

    // Manejo de errores genéricos
    return this.handleInternalError(response);
  }

  /**
   * Verifica si el error es por falta de suscriptores
   */
  private isEmptyResponseError(message: string): boolean {
    return message.toLowerCase().trim().includes('empty response');
  }

  /**
   * Maneja la respuesta cuando no hay suscriptores escuchando
   */
  private handleEmptyResponse(response: Response) {
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'There are no subscribers listening to this message',
    });
  }

  /**
   * Verifica si el error tiene un código de estado personalizado
   */
  private hasCustomStatusCode(error: unknown): error is CustomError {
    return typeof error === 'object' && error !== null && 'status' in error;
  }

  /**
   * Maneja el error con código de estado personalizado
   */
  private handleCustomError(response: Response, error: CustomError, message: string) {
    const statusCode = error.status || HttpStatus.INTERNAL_SERVER_ERROR; // Usar 500 si no hay status
    return response.status(statusCode).json({
      statusCode,
      message,
    });
  }

  /**
   * Manejo de errores internos (error genérico)
   */
  private handleInternalError(response: Response) {
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal Server Error',
    });
  }
}
