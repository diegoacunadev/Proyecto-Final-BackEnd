import { SetMetadata } from '@nestjs/common';
import { Role } from '../roles.enum';

// Decorador para asignar roles a rutas o controladores.
// Los roles definidos se validan mediante el RolesGuard.
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
