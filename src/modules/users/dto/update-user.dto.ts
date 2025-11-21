import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

// DTO para actualizaciones parciales de usuario.
// Todos los campos del CreateUserDto se vuelven opcionales.
export class UpdateUserDto extends PartialType(CreateUserDto) {}
