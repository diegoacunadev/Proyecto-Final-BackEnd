import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from '../entities/country.entity';
import { Region } from '../entities/region.entity';
import { City } from '../entities/city.entity';
import * as fs from 'fs';
import * as path from 'path';

// Servicio encargado de la precarga de datos de ubicación (seed).
// Inserta países, regiones y ciudades desde un archivo JSON al iniciar el módulo.
@Injectable()
export class LocationsSeed implements OnModuleInit {
  private readonly logger = new Logger(LocationsSeed.name);
  constructor(
    @InjectRepository(Country)
    private readonly countryRepo: Repository<Country>,

    @InjectRepository(Region)
    private readonly regionRepo: Repository<Region>,

    @InjectRepository(City)
    private readonly cityRepo: Repository<City>,
  ) {}

  async onModuleInit() {
    // Se ejecuta solo en entornos de desarrollo.
    // if (process.env.NODE_ENV === 'production') {
    //   console.log('[LocationsSeed] Entorno de producción, se omite precarga de ubicaciones.');
    //   return;
    // }
    if (process.env.SEED_ON_START !== 'true') {
      this.logger.log('[LocationsSeed] SEED_ON_START=false → no se ejecuta el seed.');
      return;
    }

    this.logger.log('[LocationsSeed] Verificando datos de ubicación...');

    const count = await this.countryRepo.count();
    if (count > 0) {
      console.log('[LocationsSeed] Datos ya existentes, no se requiere carga.');
      return;
    }

    this.logger.log('[LocationsSeed] Cargando ubicaciones desde JSON...');

    const filePath = path.join('src/modules/locations/seeds/data/locations.json');
    if (!fs.existsSync(filePath)) {
      console.error('[LocationsSeed] No se encontró el archivo locations.json');
      return;
    }

    const rawData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(rawData);

    for (const countryData of data) {
      const country = this.countryRepo.create({
        name: countryData.name,
        code: countryData.code,
        lada: countryData.lada,
      });
      await this.countryRepo.save(country);

      for (const regionData of countryData.regions) {
        const region = this.regionRepo.create({
          name: regionData.name,
          country,
        });
        await this.regionRepo.save(region);

        const cities = regionData.cities.map((cityName: string) =>
          this.cityRepo.create({ name: cityName, region }),
        );

        await this.cityRepo.save(cities);
      }
    }

    this.logger.log('[LocationsSeed] Países, regiones y ciudades cargadas correctamente.');
  }
}
