import { PartialType } from '@nestjs/mapped-types';
import { CreateAddressDto } from './create-address.dto';

// DTO para actualización de direcciones.
// Hereda de CreateAddressDto y convierte todas las propiedades en opcionales.
export class UpdateAddressDto extends PartialType(CreateAddressDto) {}
