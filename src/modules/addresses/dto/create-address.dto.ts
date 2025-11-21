import {
  IsString,
  IsUUID,
  IsOptional,
  IsBoolean,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

// DTO para la creación de direcciones. 
// Define las validaciones y estructura de datos requeridas.
export class CreateAddressDto {
  // Nombre identificador de la dirección (ej. "Casa", "Oficina").
  @IsString({ message: 'El nombre de la dirección debe ser un texto válido.' })
  @MinLength(3, { message: 'El nombre de la dirección debe tener al menos 3 caracteres.' })
  @MaxLength(50, { message: 'El nombre de la dirección no puede superar los 50 caracteres.' })
  name: string;

  // Dirección completa (ej. "Calle 123 #45-67").
  @IsString({ message: 'La dirección debe ser un texto válido.' })
  @MinLength(5, { message: 'La dirección debe tener al menos 5 caracteres.' })
  @MaxLength(150, { message: 'La dirección no puede superar los 150 caracteres.' })
  @Matches(/^[A-Za-z0-9\s#.,-]+$/, {
    message: 'La dirección solo puede contener letras, números y algunos caracteres (#, ., , -).',
  })
  address: string;

  // Barrio o zona (opcional).
  @IsOptional()
  @IsString({ message: 'El barrio debe ser un texto válido.' })
  @MaxLength(100, { message: 'El barrio no puede superar los 100 caracteres.' })
  neighborhood?: string;

  // Tipo de edificación (opcional, ej. "Apartamento").
  @IsOptional()
  @IsString({ message: 'El tipo de edificio debe ser un texto válido.' })
  @MaxLength(50, { message: 'El tipo de edificio no puede superar los 50 caracteres.' })
  buildingType?: string;

  // Comentarios adicionales (opcional).
  @IsOptional()
  @IsString({ message: 'Los comentarios deben ser texto válido.' })
  @MaxLength(200, { message: 'Los comentarios no pueden superar los 200 caracteres.' })
  comments?: string;

  // Estado de la dirección (true = activa, false = inactiva).
  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser un valor booleano (true o false).' })
  status?: boolean;

  // ID del país (UUID válido).
  @IsUUID('4', { message: 'El ID del país debe tener formato UUID válido.' })
  countryId: string;

  // ID de la región (UUID válido).
  @IsUUID('4', { message: 'El ID de la región debe tener formato UUID válido.' })
  regionId: string;

  // ID de la ciudad (UUID válido).
  @IsUUID('4', { message: 'El ID de la ciudad debe tener formato UUID válido.' })
  cityId: string;

  // ID del usuario propietario (UUID válido).
  @IsUUID('4', { message: 'El ID del usuario debe tener formato UUID válido.' })
  userId: string;
}
