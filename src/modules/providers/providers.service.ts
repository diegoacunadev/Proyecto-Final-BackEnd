import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Provider } from './entities/provider.entity';
import { ProviderStatus } from './enums/provider-status.enum';
import { Country } from 'src/modules/locations/entities/country.entity';
import { Region } from 'src/modules/locations/entities/region.entity';
import { City } from 'src/modules/locations/entities/city.entity';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,

    @InjectRepository(Country)
    private readonly countryRepo: Repository<Country>,

    @InjectRepository(Region)
    private readonly regionRepo: Repository<Region>,

    @InjectRepository(City)
    private readonly cityRepo: Repository<City>,
  ) {}

  // Guarda o actualiza un proveedor existente en la base de datos
  async save(provider: Provider): Promise<Provider> {
    return this.providerRepository.save(provider);
  }

  // Hacerlo público para usarlo desde otros servicios (AuthService, etc.)
  async validateLocation(
    countryId?: string,
    regionId?: string,
    cityId?: string,
  ) {
    if (!countryId || !regionId || !cityId) {
      throw new BadRequestException(
        'Debe seleccionar país, región y ciudad válidos.',
      );
    }

    const country = await this.countryRepo.findOne({ where: { id: countryId } });
    if (!country) throw new BadRequestException('El país no existe.');

    const region = await this.regionRepo.findOne({
      where: { id: regionId, country: { id: country.id } },
    });
    if (!region)
      throw new BadRequestException(
        'La región no pertenece al país seleccionado.',
      );

    const city = await this.cityRepo.findOne({
      where: { id: cityId, region: { id: region.id } },
    });
    if (!city)
      throw new BadRequestException(
        'La ciudad no pertenece a la región seleccionada.',
      );

    return { country, region, city };
  }

  // Crear proveedor de forma tradicional
  async create(data: Record<string, any>): Promise<Provider> {
    try {
      const { countryId, regionId, cityId, ...rest } = data;

      let country: Country | null = null;
      let region: Region | null = null;
      let city: City | null = null;

      if (countryId && regionId && cityId) {
        const loc = await this.validateLocation(countryId, regionId, cityId);
        country = loc.country;
        region = loc.region;
        city = loc.city;
      }

      const provider: Provider = this.providerRepository.create({
        ...rest,
        country,
        region,
        city,
        registrationDate: new Date(),
      });

      if (rest.password) {
        const saltRounds = 10;
        provider.password = await bcrypt.hash(rest.password, saltRounds);
      }

      return await this.providerRepository.save(provider);
    } catch (error) {
      throw new BadRequestException('Error al crear el proveedor: ' + error.message);
    }
  }

  //admin aprueba documentos
  async approveProvider(id: string): Promise<{ message: string; provider: Provider }> {
    const provider = await this.findOne(id);
    if (!provider) throw new NotFoundException('Proveedor no encontrado');

    provider.status = ProviderStatus.ACTIVE;
    provider.isCompleted = true;

    await this.providerRepository.save(provider);
    return {
      message: 'Proveedor aprobado correctamente',
      provider,
    };
  }

  // Aprobar o rechazar validación de documentos del proveedor
  async validateDocuments(providerId: string, isApproved: boolean): Promise<{ message: string; provider: Provider }> {
    const provider = await this.findOne(providerId);

    if (!provider) throw new NotFoundException('Proveedor no encontrado');

    // Si está eliminado, no se puede aprobar
    if (provider.status === ProviderStatus.DELETED) {
      throw new BadRequestException('No se puede validar un proveedor eliminado.');
    }

    // Si está incompleto, debe haber completado su perfil básico primero
    if (provider.status === ProviderStatus.INCOMPLETE) {
      throw new BadRequestException('El proveedor aún no ha completado su perfil.');
    }

    // Si se aprueba la validación
    if (isApproved) {
      provider.isCompleted = true;
      provider.status = ProviderStatus.ACTIVE;
    } else {
      provider.isCompleted = false;
      provider.status = ProviderStatus.PENDING; // podría volver a enviar documentos
    }

    await this.providerRepository.save(provider);

    const message = isApproved
      ? 'Proveedor aprobado correctamente. Ya puede ofrecer servicios.'
      : 'Proveedor rechazado. Debe volver a enviar sus documentos.';

    return { message, provider };
  }

  // Actualiza datos del proveedor con validaciones seguras
  async update(id: string, data: any): Promise<Provider> {
    const provider = await this.findOne(id);
    if (!provider) throw new NotFoundException('Proveedor no encontrado');

    // Si se envía contraseña nueva -- la hasheamos
    if (data.password) {
      const saltRounds = 10;
      data.password = await bcrypt.hash(data.password, saltRounds);
    }

    // Validar y actualizar ubicación solo si se envían los tres campos
    if (data.countryId && data.regionId && data.cityId) {
      const { country, region, city } = await this.validateLocation(
        data.countryId,
        data.regionId,
        data.cityId,
      );
      provider.country = country;
      provider.region = region;
      provider.city = city;
    }

    // Evitar modificaciones no permitidas desde el body
    const protectedFields = ['id', 'status', 'role', 'isCompleted', 'registrationDate'];
    for (const field of protectedFields) delete data[field];

    // Asignar solo campos permitidos
    Object.assign(provider, data);

    // Guardar cambios
    const updated = await this.providerRepository.save(provider);
    return updated;
  }

  // Actualiza solo el estado (status) de un proveedor — acción de admin
  async updateStatus(
    providerId: string,
    status: ProviderStatus,
  ): Promise<{ message: string; provider: Provider }> {
    const provider = await this.findOne(providerId);
    if (!provider) throw new NotFoundException('Proveedor no encontrado');

    // Validar que el status sea un valor permitido del enum
    if (!Object.values(ProviderStatus).includes(status)) {
      throw new BadRequestException('Estado no válido');
    }

    // Evitar cambiar estado si ya está eliminado
    if (provider.status === ProviderStatus.DELETED) {
      throw new BadRequestException('No se puede modificar un proveedor eliminado.');
    }

    provider.status = status;
    await this.providerRepository.save(provider);

    const message = `Estado del proveedor actualizado a "${status}" correctamente.`;

    return { message, provider };
  }

  // Buscar proveedor por correo electrónico (findOne)
  async findByEmail(email: string): Promise<Provider | null> {
    if (!email) return null;
    return this.providerRepository.findOne({
      where: { email: email.trim().toLowerCase() },
      relations: ['country', 'region', 'city'],
    });
  }

  // Buscar proveedor por username (findOne)
  async findByUsername(userName: string): Promise<Provider | null> {
    if (!userName) return null;
    return this.providerRepository.findOne({
      where: { userName },
    });
  }

  // Buscar proveedor por ID
  async findOne(id: string): Promise<Provider> {
    const provider = await this.providerRepository.findOne({
      where: { id },
      relations: ['country', 'region', 'city'],
    });
    if (!provider)
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
    return provider;
  }

  // Obtener todos
  async findAll(status?: ProviderStatus): Promise<Provider[]> {
    const where = status ? { status } : {};
    return this.providerRepository.find({
      where,
      order: { registrationDate: 'DESC' },
      relations: ['country', 'region', 'city'],
    });
  }

  // Eliminar lógico
  async remove(id: string): Promise<{ message: string }> {
    const provider = await this.findOne(id);
    provider.status = ProviderStatus.DELETED;
    await this.providerRepository.save(provider);
    return { message: 'Proveedor marcado como eliminado correctamente' };
  }

  // Reactivar
  async reactivate(id: string): Promise<{ message: string; provider: Provider }> {
    const provider = await this.findOne(id);
    if (provider.status === ProviderStatus.ACTIVE) {
      return { message: 'La cuenta ya está activa', provider };
    }

    provider.status = ProviderStatus.ACTIVE;
    await this.providerRepository.save(provider);

    return { message: 'Cuenta reactivada correctamente', provider };
  }
}
