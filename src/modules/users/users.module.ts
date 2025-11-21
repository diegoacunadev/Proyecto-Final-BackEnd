import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Address } from '../addresses/entities/address.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersSeed } from './seeds/users.seed';
import { LocationsModule } from '../locations/locations.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';


// Módulo encargado de la gestión de usuarios.
// Incluye controladores, servicios, entidades y precarga inicial (seed).
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Address]),
    forwardRef(() => AuthModule), // Evita dependencias circulares entre Auth y Users.
    LocationsModule,
    CloudinaryModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersSeed],
  exports: [UsersService, TypeOrmModule, UsersSeed],
})
export class UsersModule {}
