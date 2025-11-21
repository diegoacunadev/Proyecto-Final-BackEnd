import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';

import { Provider } from '../entities/provider.entity';
import { ProviderDocument } from '../entities/provider-document.entity';
import { Schedule } from '../entities/schedule.entity';
import { Country } from 'src/modules/locations/entities/country.entity';
import { Region } from 'src/modules/locations/entities/region.entity';
import { City } from 'src/modules/locations/entities/city.entity';
import { Role } from 'src/modules/auth/roles.enum';
import { ProviderStatus } from '../enums/provider-status.enum';
import { DocumentStatus } from '../enums/document-status.enum';
import { ScheduleStatus } from '../enums/schedule-status.enum';

@Injectable()
export class ProvidersSeed implements OnModuleInit {
  private readonly logger = new Logger(ProvidersSeed.name);

  constructor(
    @InjectRepository(Provider)
    private readonly providerRepo: Repository<Provider>,

    @InjectRepository(ProviderDocument)
    private readonly docRepo: Repository<ProviderDocument>,

    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,

    @InjectRepository(Country)
    private readonly countryRepo: Repository<Country>,

    @InjectRepository(Region)
    private readonly regionRepo: Repository<Region>,

    @InjectRepository(City)
    private readonly cityRepo: Repository<City>,
  ) {}

  async onModuleInit() {
    if (process.env.SEED_ON_START !== 'true') {
      this.logger.log('[ProvidersSeed] SEED_ON_START=false → no se ejecuta el seed.');
      return;
    }

    const existing = await this.providerRepo.count();
    if (existing > 0) {
      this.logger.warn('[ProvidersSeed] Proveedores ya existen, se omite precarga.');
      return;
    }

    const filePath = path.join('src/modules/providers/seeds/data/providers.json');
    if (!fs.existsSync(filePath)) {
      this.logger.error(`[ProvidersSeed] No se encontró el archivo providers.json en ${filePath}`);
      return;
    }

    const rawData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(rawData);
    this.logger.log(`[ProvidersSeed] ${data.length} proveedores encontrados en el JSON.`);

    const countries = await this.countryRepo.find({ relations: ['regions', 'regions.cities'] });
    if (!countries.length) {
      this.logger.error('No hay países registrados.');
      return;
    }

    for (const p of data) {
      // Ubicación coherente (país → región → ciudad)
      const randomCountry = countries[Math.floor(Math.random() * countries.length)];
      const regions = randomCountry.regions;
      if (!regions?.length) continue;
      const randomRegion = regions[Math.floor(Math.random() * regions.length)];
      const cities = randomRegion.cities;
      if (!cities?.length) continue;
      const randomCity = cities[Math.floor(Math.random() * cities.length)];

      // Crear proveedor
      const provider = this.providerRepo.create({
        names: p.names,
        surnames: p.surnames,
        userName: p.userName,
        email: p.email,
        phone: String(p.phone),
        password: await bcrypt.hash(p.password, 10),
        address: p.address,
        profilePicture: p.profilePicture ?? null,
        role: Role.Provider,
        status: ProviderStatus.ACTIVE,
        isCompleted: true,
        registrationDate: new Date(),
        country: randomCountry,
        region: randomRegion,
        city: randomCity,
      });

      const savedProvider = await this.providerRepo.save(provider);

      // Documento asociado
      const document = this.docRepo.create({
        provider: savedProvider,
        documentType: 'ID',
        documentNumber: p.documentNumber ?? Math.floor(Math.random() * 999999999).toString(),
        file: p.documentFile ?? 'https://example.com/doc.pdf',
        date: new Date(),
        status: DocumentStatus.APPROVED,
        description: 'Documento de identidad verificado',
        accountType: 'Savings',
        accountNumber: Math.floor(Math.random() * 9999999999).toString(),
        bank: 'Bancolombia',
        accountFile: 'https://example.com/account.pdf',
      });
      await this.docRepo.save(document);

      // Horarios aleatorios únicos por proveedor
      const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const randomDays = allDays.sort(() => 0.5 - Math.random()).slice(0, 5); // 5 días random
      const schedules = randomDays.map((day) => {
        const startHour = 8 + Math.floor(Math.random() * 4); // entre 8 y 12
        const endHour = startHour + 6 + Math.floor(Math.random() * 3); // duración variable
        return this.scheduleRepo.create({
          day,
          startTime: `${startHour.toString().padStart(2, '0')}:00`,
          endTime: `${endHour.toString().padStart(2, '0')}:00`,
          status: ScheduleStatus.ACTIVE,
          provider: savedProvider,
        });
      });
      await this.scheduleRepo.save(schedules);

      this.logger.log(
        `Proveedor creado: ${savedProvider.names} (${randomCountry.name} → ${randomRegion.name} → ${randomCity.name})`,
      );
    }

    this.logger.log('[ProvidersSeed] Proveedores, documentos y horarios creados correctamente.');
  }
}
