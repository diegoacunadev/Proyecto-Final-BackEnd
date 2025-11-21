import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from './entities/country.entity';
import { Region } from './entities/region.entity';
import { City } from './entities/city.entity';

// Servicio encargado de la gestión de ubicaciones.
// Permite consultar países, regiones y ciudades desde la base de datos.
@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepo: Repository<Country>,

    @InjectRepository(Region)
    private readonly regionRepo: Repository<Region>,

    @InjectRepository(City)
    private readonly cityRepo: Repository<City>,
  ) {}

  // Países
  getCountries() {
    return this.countryRepo.find({ order: { name: 'ASC' } });
  }

  getCountryById(id: string) {
    return this.countryRepo.findOne({ where: { id } });
  }

  // Regiones
  getRegions() {
    return this.regionRepo.find({ order: { name: 'ASC' } });
  }

  getRegionById(id: string) {
    return this.regionRepo.findOne({ where: { id } });
  }

  getRegionsByCountry(countryId: string) {
    return this.regionRepo.find({
      where: { country: { id: countryId } },
      relations: ['country'],
      order: { name: 'ASC' },
    });
  }

  // Ciudades
  getCities() {
    return this.cityRepo.find({ order: { name: 'ASC' } });
  }

  getCityById(id: string) {
    return this.cityRepo.findOne({ where: { id } });
  }

  getCitiesByRegion(regionId: string) {
    return this.cityRepo.find({
      where: { region: { id: regionId } },
      relations: ['region', 'region.country'],
      order: { name: 'ASC' },
    });
  }
}

