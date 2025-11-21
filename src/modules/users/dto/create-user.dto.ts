import {
  IsString,
  Matches,
  IsEmail,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { IsUnique } from 'src/modules/common/validators/is-unique.validator';
import { User } from '../entities/user.entity';
import { Role } from 'src/modules/auth/roles.enum';
import { ApiProperty } from '@nestjs/swagger';

// DTO para la creación de un nuevo usuario.
// Valida los datos de registro antes de almacenarlos en la base de datos.
export class CreateUserDto {
  @ApiProperty({ example:'Nombres' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio para el registro' })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$/, {
    message: 'El nombre solo puede contener letras, espacios, acentos, guiones o apóstrofes',
  })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(150, { message: 'El nombre no puede superar los 50 caracteres' })
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

  @ApiProperty({ example:'correo@example.com' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio para el registro' })
  @IsEmail({}, { message: 'Debe ingresar un correo electrónico válido' })
  @IsUnique(User, 'email', { message: 'El correo ya está registrado' })
  email: string;

  @ApiProperty({ example:'Password123!' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(15, { message: 'La contraseña no puede tener más de 15 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/, {
    message:
      'La contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número y un carácter especial (!@#$%^&*).',
  })
  password: string;

  @ApiProperty({ example:'1234567890' })
  @IsNotEmpty({ message: 'El número de teléfono es obligatorio' })
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @MinLength(8, { message: 'El número de teléfono debe tener al menos 8 dígitos' })
  @MaxLength(20, { message: 'El número de teléfono no puede tener más de 20 dígitos' })
  phone?: string;

  @ApiProperty({ example:'user' })
  @IsOptional()
  @IsEnum(Role, { message: 'El rol debe ser un valor válido' })
  role?: Role;
}
