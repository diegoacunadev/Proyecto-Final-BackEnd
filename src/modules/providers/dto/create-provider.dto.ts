import {
  IsString,
  Matches,
  MinLength,
  MaxLength,
  IsEmail,
  IsOptional,
  IsNotEmpty,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { IsUnique } from 'src/modules/common/validators/is-unique.validator';
import { Provider } from '../entities/provider.entity';
import { Role } from 'src/modules/auth/roles.enum';
import { ProviderStatus } from '../enums/provider-status.enum';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para la creación de un nuevo proveedor.
 * Valida los datos antes de registrarlos en la base de datos.
 */
export class CreateProviderDto {
  @ApiProperty({ example:'Nombres' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio para el registro' })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$/, {
    message: 'El nombre solo puede contener letras, espacios, acentos, guiones o apóstrofes',
  })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede superar los 50 caracteres' })
  names: string;

  @ApiProperty({ example:'Apellidos' })
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El apellido es obligatorio para el registro' })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$/, {
    message: 'El apellido solo puede contener letras, espacios, acentos, guiones o apóstrofes',
  })
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El apellido no puede superar los 50 caracteres' })
  surnames: string;

  @ApiProperty({ example:'Usuario123' })
  @IsString({ message: 'El nombre de usuario debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  @Matches(/^[a-zA-Z0-9._-]{3,20}$/, {
    message:
      'El nombre de usuario solo puede contener letras, números, guiones, guiones bajos y puntos (3-20 caracteres)',
  })
  userName: string;

  @ApiProperty({ example:'correo@example.com' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio para el registro' })
  @IsEmail({}, { message: 'Debe ingresar un correo electrónico válido' })
  @IsUnique(Provider, 'email', { message: 'El correo ya está registrado' })
  email: string;

  @IsOptional() // 👉 Esto permite registro por Google (sin contraseña)
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(15, { message: 'La contraseña no puede tener más de 15 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/, {
    message:
      'La contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número y un carácter especial (!@#$%^&*).',
  })
  password?: string;

  @ApiProperty({ example:'1234567890' })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @MinLength(8, { message: 'El número de teléfono debe tener al menos 8 dígitos' })
  @MaxLength(20, { message: 'El número de teléfono no puede tener más de 20 dígitos' })
  phone?: string;

  @ApiProperty({ example:'' })
  @IsUUID('4', { message: 'El país debe ser un UUID válido' })
  @IsOptional()
  countryId?: string;

  @ApiProperty({ example:'' })
  @IsUUID('4', { message: 'La región debe ser un UUID válido' })
  @IsOptional()
  regionId?: string;

  @ApiProperty({ example:'' })
  @IsUUID('4', { message: 'La ciudad debe ser un UUID válido' })
  @IsOptional()
  cityId?: string;

  @ApiProperty({ example:'Direccion 12' })
  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @MaxLength(100, { message: 'La dirección no puede tener más de 100 caracteres' })
  address?: string;

  @ApiProperty({ example:'https://example.com/imagen.jpg' })
  @IsOptional()
  @IsString({ message: 'La URL de la foto de perfil debe ser una cadena de texto' })
  profilePicture?: string;

  @ApiProperty({ example:'provider' })
  @IsOptional()
  @IsEnum(Role, { message: 'El rol debe ser un valor válido' })
  role?: Role;

  @ApiProperty({ example:'active' })
  @IsOptional()
  @IsEnum(ProviderStatus, {
    message: 'El estado debe ser válido (active, inactive, deleted, pending)',
  })
  status?: ProviderStatus;

  @ApiProperty({ example:'true' })
  @IsOptional()
  isCompleted?: boolean;

  @ApiProperty({ example:'Fecha de registro' })
  @IsOptional()
  registrationDate?: Date;
}
