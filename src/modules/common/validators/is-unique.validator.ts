import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

// Validador personalizado para verificar si un valor es único en una entidad.
// Utiliza TypeORM para consultar la base de datos y asegurar que no existan duplicados.
@ValidatorConstraint({ async: true })
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  // Retorna true si el valor no existe en la base de datos.
  async validate(value: any, args: any) {
    const [entityClass, property] = args.constraints;
    const repo = this.dataSource.getRepository(entityClass);

    const existing = await repo.findOne({
      where: { [property]: value },
    });

    return !existing;
  }

  // Mensaje por defecto cuando el valor ya está registrado.
  defaultMessage(args: any) {
    const [_, property] = args.constraints;
    return `El valor del campo "${property}" ya está registrado`;
  }
}

// Decorador para aplicar la validación de unicidad a un campo específico.
// Se usa en los DTOs junto con class-validator.
export function IsUnique(
  entityClass: Function,
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [entityClass, property],
      validator: IsUniqueConstraint,
    });
  };
}
