import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderDocument } from './entities/provider-document.entity';
import { ProviderDocumentsService } from './provider-documents.service';
import { ProviderDocumentsController } from './provider-documents.controller';
import { Provider } from './entities/provider.entity';
import { ClaudinaryConfig } from 'src/config/cloudinary.config';

@Module({
  imports: [TypeOrmModule.forFeature([ProviderDocument, Provider])],
  controllers: [ProviderDocumentsController],
  providers: [ProviderDocumentsService, ClaudinaryConfig],
  exports: [ProviderDocumentsService],
})
export class ProviderDocumentsModule {}
