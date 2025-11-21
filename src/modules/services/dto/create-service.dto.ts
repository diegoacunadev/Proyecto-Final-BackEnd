import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Column } from 'typeorm';
import { ServiceStatus } from '../enums/service-status.enum';

// DTO para la creación de un nuevo servicio.
// Valida los campos obligatorios y opcionales antes de registrar el servicio.
export class CreateServiceDto {
  @ApiProperty({ example: 'Nombre Servicio' })
  @IsString({ message: 'El nombre del servicio debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del servicio es obligatorio' })
  name: string;

  @ApiProperty({ example: 'Descripccion del servicio' })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
    description: 'URLs de las fotos del servicio (máximo 5)',
  })
  @IsOptional()
  @IsString({ each: true, message: 'Cada URL debe ser una cadena de texto' })
  photos?: string[];

  @Column({ type: 'enum', enum: ServiceStatus, default: ServiceStatus.ACTIVE })
  status: ServiceStatus;

  @ApiProperty({ example: 60 })
  @IsInt({ message: 'La duración debe ser un número entero en minutos' })
  @IsOptional()
  @Min(1, { message: 'La duración mínima debe ser de 1 minuto' })
  duration?: number;

  @ApiProperty({ example: '' })
  @IsUUID('4', { message: 'El ID del proveedor debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El proveedor es obligatorio' })
  providerId: string;

  @Column({ type: 'decimal', nullable: false })
  price: number;

  @ApiProperty({ example: '' })
  @IsUUID('4', { message: 'El ID de la categoría debe ser un UUID válido' })
  @IsOptional()
  categoryId?: string;
}
