import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { ClaudinaryConfig } from 'src/config/cloudinary.config';

@Module({
  providers: [CloudinaryService, ClaudinaryConfig],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
