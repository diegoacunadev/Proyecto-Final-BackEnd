import { Controller, Get, Param } from '@nestjs/common';
import { LocationsService } from './locations.service';

// Controlador encargado de gestionar las ubicaciones del sistema.
// Permite consultar países, regiones y ciudades.
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  // Obtener todos los países.
  @Get('countries')
  getCountries() {
    return this.locationsService.getCountries();
  }

  // Obtener un país por su ID.
  @Get('countries/:id')
  getCountryById(@Param('id') id: string) {
    return this.locationsService.getCountryById(id);
  }

  // Obtener las regiones de un país específico.
  @Get(':countryId/regions')
  getRegionsByCountry(@Param('countryId') countryId: string) {
    return this.locationsService.getRegionsByCountry(countryId);
  }

  // Obtener todas las regiones (opcional).
  @Get('regions')
  getRegions() {
    return this.locationsService.getRegions();
  }

  // Obtener una región por su ID.
  @Get('regions/:id')
  getRegionById(@Param('id') id: string) {
    return this.locationsService.getRegionById(id);
  }

  // Obtener las ciudades de una región específica.
  @Get('regions/:regionId/cities')
  getCitiesByRegion(@Param('regionId') regionId: string) {
    return this.locationsService.getCitiesByRegion(regionId);
  }

  // Obtener todas las ciudades (opcional).
  @Get('cities')
  getCities() {
    return this.locationsService.getCities();
  }

  // Obtener una ciudad por su ID.
  @Get('cities/:id')
  getCityById(@Param('id') id: string) {
    return this.locationsService.getCityById(id);
  }
}
