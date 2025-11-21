import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from '../entities/address.entity';
import { Country } from 'src/modules/locations/entities/country.entity';
import { Region } from 'src/modules/locations/entities/region.entity';
import { City } from 'src/modules/locations/entities/city.entity';
import { User } from 'src/modules/users/entities/user.entity';

@Injectable()
export class AddressesSeed implements OnModuleInit {
  private readonly logger = new Logger(AddressesSeed.name);

  constructor(
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,

    @InjectRepository(Country)
    private readonly countryRepo: Repository<Country>,

    @InjectRepository(Region)
    private readonly regionRepo: Repository<Region>,

    @InjectRepository(City)
    private readonly cityRepo: Repository<City>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async onModuleInit() {
    if (process.env.SEED_ON_START !== 'true') {
      this.logger.log('[AddressesSeed] SEED_ON_START=false → No se ejecuta el seed.');
      return;
    }

    const count = await this.addressRepo.count();
    if (count > 0) {
      this.logger.warn('[AddressesSeed] Ya existen direcciones. Se crearán adicionales solo si se necesita.');
    }

    await this.run();
  }

  private async run() {
    const users = await this.userRepo.find();
    if (!users.length) {
      this.logger.warn('[AddressesSeed] No hay usuarios registrados.');
      return;
    }

    const countries = await this.countryRepo.find({ relations: ['regions', 'regions.cities'] });
    if (!countries.length) {
      this.logger.error('[AddressesSeed] No hay países cargados.');
      return;
    }

    let totalCreated = 0;

    for (const user of users) {
      for (let i = 1; i <= 2; i++) {
        // Escoge país coherente (puede ser el del usuario o uno aleatorio)
        const randomCountry = countries[Math.floor(Math.random() * countries.length)];

        // Escoge región y ciudad coherentes
        const regions = randomCountry.regions;
        if (!regions?.length) continue;

        const randomRegion = regions[Math.floor(Math.random() * regions.length)];
        const cities = randomRegion.cities;
        if (!cities?.length) continue;

        const randomCity = cities[Math.floor(Math.random() * cities.length)];

        const address = this.addressRepo.create({
          name: i === 1 ? 'Casa' : 'Trabajo',
          address: `Dirección ${i} de ${user.names}`,
          neighborhood: 'Centro',
          buildingType: i === 1 ? 'Apartamento' : 'Oficina',
          comments: 'Dirección generada automáticamente',
          status: true,
          country: randomCountry,
          region: randomRegion,
          city: randomCity,
          user,
        });

        await this.addressRepo.save(address);
        totalCreated++;
        this.logger.log(
          `(${i}/2) Dirección creada para ${user.names}: ${randomCity.name}, ${randomRegion.name}, ${randomCountry.name}`,
        );
      }
    }

    this.logger.log(`[AddressesSeed] Se crearon ${totalCreated} direcciones correctamente.`);
  }
}
