import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressesService } from './addresses.service';
import { AddressesController } from './addresses.controller';
import { Address } from './entities/address.entity';
import { Country } from 'src/modules/locations/entities/country.entity';
import { Region } from 'src/modules/locations/entities/region.entity';
import { City } from 'src/modules/locations/entities/city.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { CommonModule } from '../common/common.module';

// Módulo de direcciones (Addresses).
// Gestiona toda la lógica relacionada con las direcciones de los usuarios,
// incluyendo países, regiones y ciudades asociadas.
@Module({
  // Importa las entidades necesarias para que estén disponibles
  // dentro del contexto de este módulo (TypeORM).
  imports: [TypeOrmModule.forFeature([Address, Country, Region, City, User]),
  CommonModule,
  ],


  // Controlador responsable de manejar las rutas HTTP relacionadas con direcciones.
  controllers: [AddressesController],

  // Servicio principal que contiene la lógica de negocio del módulo.
  providers: [AddressesService],

  // Exporta el servicio y el TypeOrmModule para que puedan ser utilizados
  // desde otros módulos (por ejemplo, Users o Providers).
  exports: [AddressesService, TypeOrmModule],
})
export class AddressesModule {}
