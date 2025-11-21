import { Module } from '@nestjs/common';
import { GeocodingService } from './geocoding/geocoding.service';

@Module({
  providers: [GeocodingService],
  exports: [GeocodingService],
})
export class CommonModule {}