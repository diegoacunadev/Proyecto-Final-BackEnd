import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';

// DTO para actualizar categorías.
// Hereda de CreateCategoryDto y convierte todas las propiedades en opcionales.
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
