import { PartialType } from '@nestjs/mapped-types';
import { CreateServiceDto } from './create-service.dto';

// DTO para la actualización de servicios.
// Extiende de CreateServiceDto permitiendo campos opcionales.
export class UpdateServiceDto extends PartialType(CreateServiceDto) {}
