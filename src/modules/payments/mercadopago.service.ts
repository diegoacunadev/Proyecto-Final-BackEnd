import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Preference } from 'mercadopago';

@Injectable()
export class MercadoPagoService {
  private readonly logger = new Logger(MercadoPagoService.name);
  private readonly client: MercadoPagoConfig;
  private readonly preference: Preference;

  constructor(private readonly configService: ConfigService) {
    const accessToken = this.configService.get<string>(
      'MERCADOPAGO_ACCESS_TOKEN',
    );

    if (!accessToken) {
      throw new Error(
        '❌ MERCADOPAGO_ACCESS_TOKEN no está definido en las variables de entorno',
      );
    }

    // ✅ Inicializa el cliente principal
    this.client = new MercadoPagoConfig({ accessToken });

    // ✅ Crea instancia del recurso Preference
    this.preference = new Preference(this.client);
  }

  /** Crear una preferencia de pago */
  async createPreference(paymentData: any) {
    try {
      const preference = await this.preference.create({
        body: paymentData,
      });
      return preference;
    } catch (error) {
      this.logger.error('Error creando preferencia de pago', error);
      throw error;
    }
  }
}
