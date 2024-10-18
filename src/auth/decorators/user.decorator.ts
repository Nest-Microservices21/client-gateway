import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request } from 'express';

// Decorador personalizado para extraer el usuario de la solicitud y lanzar excepción si no existe
export const UserDecorator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest<Request>();

    const user = request.user;
    if (!user)
      throw new InternalServerErrorException('No user found in request');

    return user; // Retorna el usuario si está presente
  },
);
