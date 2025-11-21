import {
  Controller,
  Post,
  Body,
  Logger,
  Get,
  Query,
  Res,
  Req,
} from '@nestjs/common';
import express from 'express';
import * as crypto from 'crypto';
import { MercadoPagoService } from './mercadopago.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentsService } from './payments.service';
import MercadoPagoConfig from 'mercadopago';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  private client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || '',
  });

  constructor(
    private readonly mercadoPagoService: MercadoPagoService,
    private readonly paymentsService: PaymentsService,
  ) {}

  // ✅ Crear preferencia
  @Post('create-preference')
  async createPreference(@Body() createPaymentDto: CreatePaymentDto) {
    try {
      const preferenceData = {
        items: [
          {
            title: createPaymentDto.description,
            quantity: 1,
            currency_id: createPaymentDto.currency || 'COP',
            unit_price: createPaymentDto.amount,
          },
        ],
        payer: { email: createPaymentDto.payerEmail },
        back_urls: {
          success: `${process.env.FRONTEND_URL}/payments/success`,
          failure: `${process.env.FRONTEND_URL}/payments/failure`,
          pending: `${process.env.FRONTEND_URL}/payments/pending`,
        },
        external_reference: createPaymentDto.serviceOrderId, // ← referencia a tu orden
        notification_url: `${process.env.BACKEND_URL}/payments/webhook`,
        auto_return: 'approved',
        binary_mode: true,
      };

      const preference =
        await this.mercadoPagoService.createPreference(preferenceData);

      const newPayment = await this.paymentsService.create({
        ...createPaymentDto,
        mpPreferenceId: preference.id,
        status: 'pending',
      });

      return {
        message: 'Preferencia creada exitosamente',
        init_point: preference.init_point,
        preference_id: preference.id,
        payment: newPayment,
      };
    } catch (error) {
      this.logger.error('Error creando preferencia de pago', error);
      throw error;
    }
  }

  // ✅ Webhook robusto (funciona con o sin firma)
  @Post('webhook')
  async receiveWebhook(
    @Query() query: any,
    @Body() body: any,
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    try {
      const { id, topic } = query;
      const signature = req.headers['x-signature'] as string;
      const secret = process.env.MP_WEBHOOK_SECRET;

      this.logger.log('📦 Contenido recibido:', body);

      // Validar firma solo si viene (modo test a veces no la envía)
      if (signature && secret && id && topic) {
        const parts = signature.split(',');
        const tsPart = parts.find((p) => p.startsWith('t='));
        const v1Part = parts.find((p) => p.startsWith('v1='));

        if (tsPart && v1Part) {
          const ts = tsPart.split('=')[1];
          const v1 = v1Part.split('=')[1];

          // 👇 Cadena correcta según documentación oficial
          const data = `t=${ts}&id=${id}&topic=${topic}`;

          const expectedHash = crypto
            .createHmac('sha256', secret)
            .update(data)
            .digest('hex');

          if (v1 !== expectedHash) {
            this.logger.warn('🚫 Firma inválida — posible fraude');
          } else {
            this.logger.log('✅ Firma válida — webhook autenticado');
          }
        }
      }

      if (topic === 'payment') {
        const response = await fetch(
          `https://api.mercadopago.com/v1/payments/${id}`,
          {
            headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
          },
        ).then((r) => r.json());

        this.logger.log('💰 Detalle del pago:', response);

        const mpPaymentId = response.id?.toString();
        const preferenceId =
          response.order?.id || response.metadata?.preference_id;
        const status = response.status || 'unknown';

        if (mpPaymentId) {
          await this.paymentsService.updatePaymentInfo(
            mpPaymentId,
            status,
            preferenceId,
            response.external_reference,
          );
        } else {
          this.logger.warn('⚠️ No se recibió mpPaymentId del webhook');
        }
      }

      return res.status(200).send('Webhook procesado');
    } catch (error) {
      this.logger.error('❌ Error en webhook:', error);
      return res.status(500).send('Error interno');
    }
  }

  // ✅ Rutas de prueba
  @Get('success') success() {
    return { message: 'Pago exitoso' };
  }
  @Get('failure') failure() {
    return { message: 'Pago fallido' };
  }
  @Get('pending') pending() {
    return { message: 'Pago pendiente' };
  }
}
