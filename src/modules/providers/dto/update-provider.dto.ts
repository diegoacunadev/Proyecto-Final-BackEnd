import { PartialType } from '@nestjs/mapped-types';
import { CreateProviderDto } from './create-provider.dto';

// DTO para la actualización de proveedores.
// Extiende de CreateProviderDto permitiendo campos opcionales.
export class UpdateProviderDto extends PartialType(CreateProviderDto) {}
