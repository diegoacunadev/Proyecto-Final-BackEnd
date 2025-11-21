import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity';
import { ServiceOrder } from '../service-orders/entities/service-order.entity';
import { MercadoPagoService } from './mercadopago.service';
import { MailerModule } from '../auth/mailer.module';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, ServiceOrder]),
  MailerModule   
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, MercadoPagoService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
