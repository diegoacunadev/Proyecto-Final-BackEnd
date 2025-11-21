import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Country } from '../../locations/entities/country.entity';
import { Role } from '../../auth/roles.enum';
import { UserStatus } from '../enums/user-status.enum';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersSeed implements OnModuleInit {
  private readonly logger = new Logger(UsersSeed.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Country)
    private readonly countryRepo: Repository<Country>,
  ) {}

  async onModuleInit() {
    if (process.env.SEED_ON_START !== 'true') {
      this.logger.log('[UsersSeed] SEED_ON_START=false → No se ejecuta el seed.');
      return;
    }

    const existingUsers = await this.userRepo.count();
    if (existingUsers > 0) {
      this.logger.warn('[UsersSeed] Usuarios ya existen, se omite creación inicial.');
      return;
    }

    await this.run();
  }

  private async run() {
    const filePath = path.join('src/modules/users/seeds/data/users.json');
    if (!fs.existsSync(filePath)) {
      this.logger.error(`[UsersSeed] No se encontró el archivo users.json en: ${filePath}`);
      return;
    }

    const rawData = fs.readFileSync(filePath, 'utf8');
    const usersData = JSON.parse(rawData);
    this.logger.log(`[UsersSeed] ${usersData.length} usuarios encontrados en el JSON.`);

    const countries = await this.countryRepo.find();
    if (!countries.length) {
      this.logger.error('[UsersSeed] No hay países registrados en la base.');
      return;
    }

    for (const u of usersData) {
      const randomCountry = countries[Math.floor(Math.random() * countries.length)];

      const normalizedRole = (u.role || '').toLowerCase();
      const userRole =
        normalizedRole === 'admin'
          ? Role.Admin
          : normalizedRole === 'provider'
          ? Role.Provider
          : Role.User;

      const user = this.userRepo.create({
        names: u.names,
        surnames: u.surnames,
        email: u.email,
        password: await bcrypt.hash(u.password, 10),
        phone: String(u.phone),
        role: userRole,
        status: UserStatus.ACTIVE,
        registrationDate: new Date(),
        country: randomCountry,
        profilePicture: u.profilePicture || null,
      });

      await this.userRepo.save(user);
      this.logger.log(`Usuario creado: ${u.names} (${randomCountry.name})`);
    }

    this.logger.log('[UsersSeed] Todos los usuarios creados correctamente.');
  }
}
