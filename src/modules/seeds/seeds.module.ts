import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entidades necesarias
import { Country } from '../locations/entities/country.entity';
import { Region } from '../locations/entities/region.entity';
import { City } from '../locations/entities/city.entity';
import { Category } from '../categories/entities/category.entity';
import { User } from '../users/entities/user.entity';
import { Address } from '../addresses/entities/address.entity';
import { Provider } from '../providers/entities/provider.entity';
import { ProviderDocument } from '../providers/entities/provider-document.entity';
import { Schedule } from '../providers/entities/schedule.entity';
import { Service } from '../services/entities/service.entity';

// Seeds individuales
import { LocationsSeed } from '../locations/seeds/locations.seed';
import { CategoriesSeed } from '../categories/seeds/categories.seed';
import { UsersSeed } from '../users/seeds/users.seed';
import { AddressesSeed } from '../addresses/seeds/addresses.seed';
import { ProvidersSeed } from '../providers/seeds/providers.seed';
import { ServicesSeed } from '../services/seeds/services.seed';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Country,
      Region,
      City,
      Category,
      User,
      Address,
      Provider,
      ProviderDocument,
      Schedule,
      Service,
    ]),
  ],
  providers: [
    LocationsSeed,
    CategoriesSeed,
    UsersSeed,
    AddressesSeed,
    ProvidersSeed,
    ServicesSeed,
  ],
})
export class SeedsModule implements OnModuleInit {
  private readonly logger = new Logger(SeedsModule.name);

  constructor(
    private readonly locationsSeed: LocationsSeed,
    private readonly categoriesSeed: CategoriesSeed,
    private readonly usersSeed: UsersSeed,
    private readonly addressesSeed: AddressesSeed,
    private readonly providersSeed: ProvidersSeed,
    private readonly servicesSeed: ServicesSeed,
  ) {}

  async onModuleInit() {
    if (process.env.SEED_ON_START !== 'true') {
      this.logger.log('[SeedsModule] SEED_ON_START=false → no se ejecuta el seed.');
      return;
    }

    this.logger.log('Iniciando ejecución de seeds en orden lógico...');

    await this.locationsSeed.onModuleInit();  // Países, regiones, ciudades
    await this.categoriesSeed.onModuleInit(); // Categorías
    await this.usersSeed.onModuleInit();      // Usuarios
    await this.addressesSeed.onModuleInit();  // Direcciones
    await this.providersSeed.onModuleInit();  // Proveedores, documentos, horarios
    await this.servicesSeed.onModuleInit();   // Servicios

    this.logger.log('Todos los seeds se ejecutaron correctamente.');
  }
}
