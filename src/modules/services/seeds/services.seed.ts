import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Service } from '../entities/service.entity';
import { Provider } from 'src/modules/providers/entities/provider.entity';
import { Category } from 'src/modules/categories/entities/category.entity';
import { ServiceStatus } from '../enums/service-status.enum';

@Injectable()
export class ServicesSeed implements OnModuleInit {
  private readonly logger = new Logger(ServicesSeed.name);

  constructor(
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
    @InjectRepository(Provider)
    private readonly providerRepo: Repository<Provider>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async onModuleInit() {
    // if (process.env.NODE_ENV === 'production') return;
    if (process.env.SEED_ON_START !== 'true') {
      this.logger.log('[ServicesSeed] SEED_ON_START=false → no se ejecuta el seed.');
      return;
    }

    const count = await this.serviceRepo.count();
    if (count > 0) {
      this.logger.warn('[ServicesSeed] Servicios ya existentes, se omite precarga.');
      return;
    }

    const filePath = path.join('src/modules/services/seeds/data/services.json');
    if (!fs.existsSync(filePath)) {
      this.logger.error(`[ServicesSeed] No se encontró el archivo: ${filePath}`);
      return;
    }

    const rawData = fs.readFileSync(filePath, 'utf8');
    const servicesData = JSON.parse(rawData);

    const providers = await this.providerRepo.find();
    const categories = await this.categoryRepo.find();

    if (!providers.length || !categories.length) {
      this.logger.error('[ServicesSeed] No hay proveedores o categorías en la base.');
      return;
    }

    // Asignar 2 servicios por proveedor
    for (const provider of providers) {
      const usedIndexes = new Set<number>(); // para evitar repetir servicios

      for (let i = 0; i < 2; i++) {
        // Elegir servicio aleatorio no repetido
        let randomIndex: number;
        do {
          randomIndex = Math.floor(Math.random() * servicesData.length);
        } while (usedIndexes.has(randomIndex));
        usedIndexes.add(randomIndex);

        const s = servicesData[randomIndex];
        const randomCategory =
          categories[Math.floor(Math.random() * categories.length)];

        const service = this.serviceRepo.create({
          name: s.name,
          description: s.description,
          photos: [s.photo], // ahora es un array, aunque sea una sola imagen
          price: s.price, 
          duration: s.duration,
          status: ServiceStatus.ACTIVE,
          provider,
          category: randomCategory,
        });

        await this.serviceRepo.save(service);
        this.logger.log(
          `Servicio creado: ${s.name} → Proveedor: ${provider.names} (${randomCategory.name})`
        );
      }
    }

    this.logger.log('[ServicesSeed] Se crearon 2 servicios por proveedor correctamente.');
  }
}
