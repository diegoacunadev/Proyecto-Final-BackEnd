import {
  IsString,
  Matches,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsUUID,
} from 'class-validator';

export class CompleteRegisterUserDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio para completar el registro' })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$/, {
    message: 'El nombre solo puede contener letras, espacios, acentos, guiones o apóstrofes',
  })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(150, { message: 'El nombre no puede superar los 150 caracteres' })
  names: string;

  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El apellido es obligatorio para completar el registro' })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$/, {
    message: 'El apellido solo puede contener letras, espacios, acentos, guiones o apóstrofes',
  })
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El apellido no puede superar los 50 caracteres' })
  surnames: string;

  @IsNotEmpty({ message: 'El número de teléfono es obligatorio' })
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @MinLength(8, { message: 'El número de teléfono debe tener al menos 8 dígitos' })
  @MaxLength(20, { message: 'El número de teléfono no puede tener más de 20 dígitos' })
  phone: string;

  @IsNotEmpty({ message: 'Debe seleccionar un país válido' })
  @IsUUID('4', { message: 'El país debe ser un UUID válido' })
  country: string;
}
