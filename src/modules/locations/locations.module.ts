import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';
import { Country } from './entities/country.entity';
import { Region } from './entities/region.entity';
import { City } from './entities/city.entity';
import { LocationsSeed } from './seeds/locations.seed';

// Módulo encargado de la gestión de ubicaciones.
// Incluye países, regiones, ciudades y la precarga inicial de datos (seed).
@Module({
  imports: [TypeOrmModule.forFeature([Country, Region, City])],
  controllers: [LocationsController],
  providers: [LocationsService, LocationsSeed],
  exports: [LocationsService, TypeOrmModule, LocationsSeed],
})
export class LocationsModule {}
