import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);

  async geocode(address: string): Promise<{ lat: number; lng: number } | null> {
    try {
      // const clean = address.replace(/#/g, '');
      const url = 'https://nominatim.openstreetmap.org/search.php';
      // const url = "https://nominatim.openstreetmap.org/";

      const response = await axios.get(url, {
        params: {
          q: address,
          format: 'json',
          addressdetails: 1,
          limit: 1,
        },
        headers: {
          // OBLIGATORIO para no ser bloqueado
          'User-Agent': 'ServiYApp/1.0 - contact: serviyapp.auth@gmail.com',
        },
        timeout: 5000, // evita cuelgues
      });

      if (!response.data || response.data.length === 0) {
        this.logger.warn(`No results found for address: ${address}`);
        return null;
      }

      const result = response.data[0];

      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
      };
    } catch (error) {
      this.logger.error(`Geocoding error for address: ${address}`);
      this.logger.error(error.message);
      return null;
    }
  }
}
