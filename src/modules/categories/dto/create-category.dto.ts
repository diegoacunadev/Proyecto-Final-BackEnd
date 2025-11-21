import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

// DTO para crear una nueva categoría.
export class CreateCategoryDto {
  @ApiProperty({ example: 'Nombre Categoria' })
  @IsString({ message: 'El nombre de la categoría debe ser un texto válido.' })
  @MinLength(3, { message: 'El nombre de la categoría debe tener al menos 3 caracteres.' })
  @MaxLength(50, { message: 'El nombre de la categoría no puede superar los 50 caracteres.' })
  name: string;

  @ApiProperty({ example: 'Descripccion de la categoria' })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto válido.' })
  @MaxLength(200, { message: 'La descripción no puede superar los 200 caracteres.' })
  description?: string;
}
