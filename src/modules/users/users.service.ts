import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UserStatus } from './enums/user-status.enum';
import { Country } from '../locations/entities/country.entity';

// Servicio encargado de la lógica de negocio de los usuarios.
// Gestiona operaciones CRUD y consultas específicas.
@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
  ) {}

  // Guarda o actualiza un usuario existente en la base de datos
  async save(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  // Valida si el país existe en la base de datos (por UUID)
  async validateCountryById(countryId: string) {
    return this.countryRepository.findOne({ where: { id: countryId } });
  }

  // Crear un nuevo usuario (utilizado por AuthService).
  async create(data: Partial<User>): Promise<User> {
    try {
      const newUser = this.userRepository.create(data);

      // Solo hashear si el password existe y no parece estar hasheado ya
      if (data.password && !data.password.startsWith('$2b$')) {
        const saltRounds = 10;
        newUser.password = await bcrypt.hash(data.password, saltRounds);
      }

      return await this.userRepository.save(newUser);
    } catch (error) {
      console.error('Error en create:', error);
      throw new BadRequestException('Error al crear el usuario');
    }
  }

  // Actualiza la información de un usuario (perfil o contraseña)
  async update(id: string, data: Partial<User>): Promise<User> {
    try {
      const user = await this.findOne(id);
      if (!user) throw new BadRequestException('Usuario no encontrado');

      // Si hay un nuevo password y no está ya hasheado, lo hasheamos
      if (data.password && !data.password.startsWith('$2b$')) {
        const saltRounds = 10;
        data.password = await bcrypt.hash(data.password, saltRounds);
      }

      Object.assign(user, data);
      return await this.userRepository.save(user);
    } catch (error) {
      console.error('❌ Error en update:', error);
      throw new BadRequestException('Error al actualizar el usuario');
    }
  }

  validatePassword(password: string, password1: string) {
    throw new Error('Method not implemented.');
  }

  // Buscar usuario por correo electrónico.
  async findByEmail(email: string): Promise<User | null> {
    if (!email) return null;
    return this.userRepository.findOne({
      where: { email: email.trim().toLowerCase() },
    });
  }















  // Obtener todos los usuarios registrados con posibilidad de filtro.
  async findAll(status?: UserStatus): Promise<User[]> {
    const where = status ? { status } : {};
    return this.userRepository.find({
      where,
      order: { registrationDate: 'DESC' },
    });
  }

  // Obtener un usuario por su ID.
  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    return user;
  }



  async remove(id: string): Promise<{ message: string }> {
    const user = await this.findOne(id);
    if (!user) throw new BadRequestException('Usuario no encontrado');

    user.status = UserStatus.DELETED;
    await this.userRepository.save(user);

    return { message: 'Usuario marcado como eliminado correctamente' };
  }


  async reactivate(id: string): Promise<{ message: string; user: User }> {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (user.status === UserStatus.ACTIVE) {
      return { message: 'La cuenta ya está activa', user };
    }

    user.status = UserStatus.ACTIVE;
    await this.userRepository.save(user);

    return { message: 'Cuenta reactivada correctamente', user };
  }


  async changeStatus(id: string, status: UserStatus): Promise<User> {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // No permitir cambiar a INCOMPLETE manualmente (opcional)
    if (status === UserStatus.INCOMPLETE) {
      throw new BadRequestException('No puedes asignar estado INCOMPLETE manualmente');
    }

    user.status = status;
    await this.userRepository.save(user);

    return user;
  }
  
}
