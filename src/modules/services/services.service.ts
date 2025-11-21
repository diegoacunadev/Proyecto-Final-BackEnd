import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Provider } from '../providers/entities/provider.entity';
import { Category } from '../categories/entities/category.entity';
import { Role } from '../auth/roles.enum';
import { ServiceStatus } from './enums/service-status.enum';
import { User } from '../users/entities/user.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // Ver TODOS los servicios (solo Admin)
  async findAllAdmin(): Promise<Service[]> {
    return await this.serviceRepository.find({
      relations: ['provider', 'category'],
      order: { createdAt: 'DESC' },
    });
  }

  // Ver todos los servicios de un proveedor específico
  async findByProvider(providerId: string, user: any): Promise<Service[]> {
    // Si el usuario es proveedor, solo puede ver los suyos
    if (user.role === Role.Provider && user.id !== providerId) {
      throw new ForbiddenException(
        'No tienes permiso para ver estos servicios.',
      );
    }

    // Verificar que el proveedor exista
    const provider = await this.providerRepository.findOne({
      where: { id: providerId },
    });

    if (!provider) throw new NotFoundException('Proveedor no encontrado');

    // Buscar servicios asociados
    const services = await this.serviceRepository.find({
      where: { provider: { id: providerId } },
      relations: ['category', 'provider'],
      order: { createdAt: 'DESC' },
    });

    return services;
  }

  // Crear un nuevo servicio
  async create(
    dto: CreateServiceDto,
    user: any,
    files?: Express.Multer.File[],
  ): Promise<Service> {
    const provider =
      user.role === Role.Admin
        ? await this.providerRepository.findOne({
            where: { id: dto.providerId },
          })
        : await this.providerRepository.findOne({
            where: { email: user.email },
          });

    if (!provider) throw new NotFoundException('Proveedor no encontrado');

    const category = await this.categoryRepository.findOne({
      where: { id: dto.categoryId },
    });
    if (!category) throw new NotFoundException('Categoría no encontrada');

    // Subir fotos a Cloudinary
    let uploadedPhotos: string[] = [];
    if (files?.length) {
      uploadedPhotos = await this.cloudinaryService.uploadServiceImages(files);
    }

    const service = this.serviceRepository.create({
      name: dto.name,
      description: dto.description,
      photos: uploadedPhotos,
      duration: dto.duration,
      price: dto.price,
      provider,
      category,
      status: ServiceStatus.PENDING,
    });

    return await this.serviceRepository.save(service);
  }
  // async create(dto: CreateServiceDto, user: any): Promise<Service> {
  //   const provider = user.role === Role.Admin
  //     ? await this.providerRepository.findOne({ where: { id: dto.providerId } })
  //     : await this.providerRepository.findOne({ where: { email: user.email } });

  //   if (!provider) throw new NotFoundException('Proveedor no encontrado');

  //   const category = await this.categoryRepository.findOne({
  //     where: { id: dto.categoryId },
  //   });
  //   if (!category) throw new NotFoundException('Categoría no encontrada');

  // const service = this.serviceRepository.create({
  //   name: dto.name,
  //   description: dto.description,
  //   photo: dto.photo,
  //   duration: dto.duration,
  //   price: dto.price,
  //   provider,
  //   category,
  //   status: ServiceStatus.PENDING,
  // });

  //   return await this.serviceRepository.save(service);
  // }

  // Ver todos los servicios pendientes (solo para administrador)
  async findAllPending(): Promise<Service[]> {
    const query = this.serviceRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.provider', 'provider')
      .leftJoinAndSelect('service.category', 'category')
      .where('service.status = :status', { status: ServiceStatus.PENDING })
      .orderBy('service.createdAt', 'DESC');

    return await query.getMany();
  }

  // Eliminar completamente un servicio (solo admin)
  async deleteService(id: string): Promise<{ message: string }> {
    const service = await this.serviceRepository.findOne({ where: { id } });
    if (!service) throw new NotFoundException('Servicio no encontrado');

    await this.serviceRepository.remove(service);
    return {
      message: `El servicio "${service.name}" fue eliminado correctamente.`,
    };
  }

  // Ver todos los servicios (admin o proveedor)
  async findAllPublicPaginated(page = 1, limit = 10): Promise<Service[]> {
    const query = this.serviceRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.provider', 'provider')
      .leftJoinAndSelect('service.category', 'category')
      .where('service.status = :status', { status: ServiceStatus.ACTIVE })
      .orderBy('service.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return await query.getMany();
  }

  // Ver todos los servicios paginados del mismo país que el usuario
  async findAllPaged(user: User, page = 1, limit = 5): Promise<Service[]> {
    if (!user?.country) {
      throw new BadRequestException(
        'No se pudo determinar el país del usuario.',
      );
    }

    // Si user.country es un objeto o un string, tomamos el nombre del país
    const countryName =
      typeof user.country === 'object' ? user.country.name : user.country;

    const query = this.serviceRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.provider', 'provider')
      .leftJoinAndSelect('provider.country', 'country') // 🔹 JOIN directo con la tabla de países
      .leftJoinAndSelect('service.category', 'category')
      .where('service.status = :status', { status: ServiceStatus.ACTIVE })
      .andWhere('country.name = :countryName', { countryName }) // 🔹 Filtramos por nombre del país
      .orderBy('service.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return await query.getMany();
  }

  // Ordenar por Parametro ('price' o 'duration')
  async findAllBy(
    param: string,
    country?: string,
    page?: number,
    limit?: number,
  ): Promise<Service[]> {
    const query = this.serviceRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.provider', 'provider')
      .leftJoinAndSelect('provider.country', 'country')
      .leftJoinAndSelect('service.category', 'category')
      .where('service.status = :status', { status: ServiceStatus.ACTIVE })
      .orderBy(`service.${param}`, 'ASC');

    if (country) {
      query.andWhere('country.name = :country', { country });
    }

    if (page && limit) {
      query.skip((page - 1) * limit).take(limit);
    }

    return await query.getMany();
  }

  async filteredFind(
    filters: {
      region?: string;
      city?: string;
      category?: string;
      serviceName?: string;
    },
    page = 1,
    limit = 10,
  ): Promise<Service[]> {
    const query = this.serviceRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.provider', 'provider')
      .leftJoinAndSelect('provider.region', 'region')
      .leftJoinAndSelect('provider.city', 'city')
      .leftJoinAndSelect('service.category', 'category')
      .where('service.status = :status', { status: ServiceStatus.ACTIVE });

    if (filters.region) {
      query.andWhere('region.name ILIKE :region', {
        region: `%${filters.region}%`,
      });
    }
    if (filters.city) {
      query.andWhere('city.name ILIKE :city', { city: `%${filters.city}%` });
    }
    if (filters.category) {
      query.andWhere('category.name ILIKE :category', {
        category: `%${filters.category}%`,
      });
    }
    if (filters.serviceName) {
      query.andWhere('service.name ILIKE :serviceName', {
        serviceName: `%${filters.serviceName}%`,
      });
    }

    query
      .orderBy('service.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return await query.getMany();
  }

  // Buscar por ID (control de acceso)
  async findOnePublic(id: string): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: ['provider', 'category'],
    });
    if (!service) throw new NotFoundException('Servicio no encontrado');
    return service;
  }

  // Método interno con validación de permisos
  private async findOne(id: string, user: any): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: ['provider', 'category'],
    });

    if (!service) throw new NotFoundException('Servicio no encontrado');

    // Verifica permisos
    if (user.role !== Role.Admin && service.provider.email !== user.email) {
      throw new ForbiddenException(
        'No tienes permiso para acceder a este servicio.',
      );
    }

    return service;
  }

  // Actualizar servicio (solo admin o propietario)
  // async update(id: string, dto: UpdateServiceDto, user: any): Promise<Service> {
  //   // Buscar el servicio y validar permisos
  //   const service = await this.findOne(id, user);
  //   if (!service) throw new NotFoundException('Servicio no encontrado');

  //   // Si el admin cambia el proveedor
  //   if (dto.providerId && user.role === Role.Admin) {
  //     const provider = await this.providerRepository.findOne({
  //       where: { id: dto.providerId },
  //     });
  //     if (!provider) throw new NotFoundException('Proveedor no encontrado');
  //     service.provider = provider;
  //   }

  //   // Si se cambia la categoría
  //   if (dto.categoryId) {
  //     const category = await this.categoryRepository.findOne({
  //       where: { id: dto.categoryId },
  //     });
  //     if (!category) throw new NotFoundException('Categoría no encontrada');
  //     service.category = category;
  //   }

  //   // Actualizar campos definidos
  //   if (dto.name !== undefined) service.name = dto.name;
  //   if (dto.description !== undefined) service.description = dto.description;
  //   if (dto.photo !== undefined) service.photo = dto.photo;
  //   if (dto.duration !== undefined) service.duration = dto.duration;
  //   if (dto.price !== undefined) service.price = dto.price;

  //   // Aquí agregamos el manejo del enum de estado
  //   if (dto.status !== undefined) {
  //     // Verificamos que el valor esté dentro del enum
  //     if (!Object.values(ServiceStatus).includes(dto.status)) {
  //       throw new BadRequestException(
  //         `Estado inválido. Debe ser: ${Object.values(ServiceStatus).join(', ')}.`,
  //       );
  //     }
  //     service.status = dto.status;
  //   }

  //   // Guardar cambios
  //   return await this.serviceRepository.save(service);
  // }

  async update(
    id: string,
    dto: UpdateServiceDto,
    user: any,
    files?: Express.Multer.File[],
  ): Promise<Service> {
    const service = await this.findOne(id, user);
    if (!service) throw new NotFoundException('Servicio no encontrado');

    // Si el admin cambia el proveedor
    if (dto.providerId && user.role === Role.Admin) {
      const provider = await this.providerRepository.findOne({
        where: { id: dto.providerId },
      });
      if (!provider) throw new NotFoundException('Proveedor no encontrado');
      service.provider = provider;
    }

    // Si se cambia la categoría
    if (dto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: dto.categoryId },
      });
      if (!category) throw new NotFoundException('Categoría no encontrada');
      service.category = category;
    }

    // Subir nuevas fotos (si las hay)
    if (files?.length) {
      const uploadedPhotos =
        await this.cloudinaryService.uploadServiceImages(files);
      // Opción 1: reemplazar todas las fotos anteriores
      // service.photos = uploadedPhotos;

      // Opción 2: Permitir agregar sin borrar las anteriores:
      service.photos = [...(service.photos || []), ...uploadedPhotos];
    }

    // Actualizar campos definidos
    if (dto.name !== undefined) service.name = dto.name;
    if (dto.description !== undefined) service.description = dto.description;
    if (dto.duration !== undefined) service.duration = dto.duration;
    if (dto.price !== undefined) service.price = dto.price;

    // Verificar estado válido
    if (dto.status !== undefined) {
      if (!Object.values(ServiceStatus).includes(dto.status)) {
        throw new BadRequestException(
          `Estado inválido. Debe ser uno de: ${Object.values(ServiceStatus).join(', ')}.`,
        );
      }
      service.status = dto.status;
    }

    return await this.serviceRepository.save(service);
  }

  // Cambiar estado (activar/desactivar o eliminar lógicamente)
  async changeStatus(
    id: string,
    user: any,
    status: ServiceStatus,
  ): Promise<Service> {
    const service = await this.findOne(id, user);
    if (!service) throw new NotFoundException('Servicio no encontrado');

    // Solo admin o propietario pueden hacerlo (ya se valida en findOne)
    service.status = status;
    return await this.serviceRepository.save(service);
  }

  async countByStatus(): Promise<any> {
    const active = await this.serviceRepository.count({
      where: { status: ServiceStatus.ACTIVE },
    });
    const inactive = await this.serviceRepository.count({
      where: { status: ServiceStatus.INACTIVE },
    });
    return { active, inactive };
  }
}
