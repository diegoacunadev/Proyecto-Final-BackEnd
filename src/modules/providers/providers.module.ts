import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProvidersService } from './providers.service';
import { ProvidersController } from './providers.controller';
import { Provider } from './entities/provider.entity';
import { ProviderDocument } from './entities/provider-document.entity';
import { Schedule } from './entities/schedule.entity';
import { LocationsModule } from '../locations/locations.module';
import { AuthModule } from '../auth/auth.module';
import { ProvidersSeed } from './seeds/providers.seed';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([Provider, ProviderDocument, Schedule]),
    LocationsModule,
    CloudinaryModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [ProvidersController],
  providers: [ProvidersService, ProvidersSeed],
  exports: [ProvidersService, TypeOrmModule, ProvidersSeed],
})
export class ProvidersModule {}
