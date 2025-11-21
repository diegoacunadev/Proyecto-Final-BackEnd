import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../roles.enum';

// Guard que valida si el usuario tiene alguno de los roles requeridos en la ruta.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();

    // Si no hay usuario autenticado, denegamos directamente
    if (!user) {
      throw new ForbiddenException('Acceso denegado: no se encontró un usuario autenticado.');
    }

    // Verificamos si el rol del usuario coincide con alguno de los requeridos
    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      // Mensaje personalizado según quién intenta acceder
      const customMessage =
        user.role === Role.User
          ? 'Solo los administradores pueden acceder a este recurso.'
          : `Tu rol (${user.role}) no tiene permiso para esta acción.`;

      throw new ForbiddenException({
        statusCode: 403,
        error: 'Forbidden',
        message: customMessage,
      });
    }

    return true;
  }
}