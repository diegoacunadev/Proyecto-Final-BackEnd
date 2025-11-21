import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ServiceOrder } from '../service-orders/entities/service-order.entity';
import { MailerService } from '../auth/mailer.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,

    @InjectRepository(ServiceOrder)
    private readonly serviceOrdersRepository: Repository<ServiceOrder>,
    private readonly mailerService: MailerService,
  ) {}

  /**
   * 🧾 Crear un nuevo registro de pago
   */
  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const { serviceOrderId, mpPreferenceId, ...paymentData } = createPaymentDto;

    const serviceOrder = await this.serviceOrdersRepository.findOne({
      where: { id: serviceOrderId },
    });

    if (!serviceOrder) {
      throw new NotFoundException('Service order not found');
    }

    const newPayment = this.paymentsRepository.create({
      ...paymentData,
      mpPreferenceId,
      status: 'pending',
      serviceOrder,
    });

    return this.paymentsRepository.save(newPayment);
  }

  async findByMpId(mpId: string): Promise<Payment | null> {
    return this.paymentsRepository.findOne({
      where: [{ mpPaymentId: mpId }, { mpPreferenceId: mpId }],
      relations: ['serviceOrder'],
    });
  }

  async updatePaymentInfo(
    mpPaymentId: string,
    status: string,
    preferenceId?: string,
    externalReference?: string,
  ): Promise<void> {
    let payment = await this.findByMpId(mpPaymentId);

    if (!payment && preferenceId) {
      payment = await this.paymentsRepository.findOne({
        where: { mpPreferenceId: preferenceId },
        relations: ['serviceOrder'],
      });
    }

    // 🔍 Nuevo: buscar también por external_reference (serviceOrder.id)
    if (!payment && externalReference) {
      payment = await this.paymentsRepository.findOne({
        where: { serviceOrder: { id: externalReference } },
        relations: ['serviceOrder'],
      });
    }

    if (!payment) {
      this.logger.warn(
        `⚠️ No se encontró el pago relacionado con MP id: ${mpPaymentId}`,
      );
      return;
    }

    payment.status = status;
    if (!payment.mpPaymentId) payment.mpPaymentId = mpPaymentId;

    await this.paymentsRepository.save(payment);

    // Enviar correo si fue APROBADO
    if (status === 'approved') {
      const payerEmail =
        payment.payerEmail ||
        payment.serviceOrder?.user?.email ||
        null;

      if (payerEmail) {
        await this.mailerService.sendPaymentSuccessMail(payerEmail, {
          name: payment.serviceOrder?.user?.names || 'Usuario',
          amount: payment.amount.toString(),
          currency: payment.currency,
          status: payment.status,
          payment_method: payment.paymentMethod || 'N/A',
          payment_type: payment.paymentType || 'N/A',
          mp_payment_id: mpPaymentId,
          service_order_id: payment.serviceOrder?.id,
        });
      }
    }

    //  Enviar correo al PROVEEDOR
    if (status === 'approved') {
      const provider = payment.serviceOrder?.provider;
      const service = payment.serviceOrder?.service;

      if (provider?.email) {
        await this.mailerService.sendPaymentToProviderMail(provider.email, {
          provider_name: provider.names,
          service_name: service?.name || payment.description || 'Servicio',
          amount: payment.amount.toString(),
          currency: payment.currency,
          status: payment.status,
          payment_method: payment.paymentMethod || 'N/A',
          mp_payment_id: mpPaymentId,
          service_order_id: payment.serviceOrder.id,
        });
      }
    }

    if (payment.serviceOrder) {
      payment.serviceOrder.status =
        status === 'approved'
          ? 'paid'
          : status === 'pending'
            ? 'pending'
            : 'rejected';
      await this.serviceOrdersRepository.save(payment.serviceOrder);
    }

    this.logger.log(
      `✅ Pago actualizado → mpPaymentId=${mpPaymentId}, status=${status}`,
    );
  }

  /**
   * 📄 Obtener un pago por ID
   */
  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { id },
      relations: ['serviceOrder'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  /**
   * 🔍 Obtener todos los pagos
   */
  async findAll(): Promise<Payment[]> {
    return this.paymentsRepository.find({ relations: ['serviceOrder'] });
  }

  /**
   * 🔄 Actualizar el estado del pago
   */
  async updateStatus(id: string, status: string): Promise<Payment> {
    const payment = await this.findOne(id);
    payment.status = status;
    this.logger.log(
      `💾 Estado de pago actualizado a "${status}" para ID ${id}`,
    );
    return this.paymentsRepository.save(payment);
  }

  /**
   * 🔄 Actualizar estado usando el ID de Mercado Pago
   * (cuando llega un webhook)
   */
  async updateStatusByMpId(mpPaymentId: string, status: string): Promise<void> {
    await this.paymentsRepository
      .createQueryBuilder()
      .update(Payment)
      .set({ status, mpPaymentId })
      .where('mpPaymentId = :mpPaymentId OR mpPreferenceId = :mpPaymentId', {
        mpPaymentId,
      })
      .execute();
  }
  async updateServiceOrderStatus(
    orderId: string,
    status: string,
  ): Promise<void> {
    await this.serviceOrdersRepository
      .createQueryBuilder()
      .update(ServiceOrder)
      .set({ status })
      .where('id = :orderId', { orderId })
      .execute();
  }
}
