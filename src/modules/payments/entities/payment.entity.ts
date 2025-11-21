import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ServiceOrder } from '../../service-orders/entities/service-order.entity';

@Entity({ name: 'payments' })
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ID del pago en Mercado Pago (ej: "1234567890")
  @Column({ nullable: true })
  mpPaymentId: string;

  // ID de la preferencia creada (importante para reintentos)
  @Column({ nullable: true })
  mpPreferenceId: string;

  // Estado del pago
  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'in_process'],
    default: 'pending',
  })
  status: string;

  // Método de pago (tarjeta, PSE, efectivo, etc.)
  @Column({ nullable: true })
  paymentMethod: string;

  // Tipo de pago (credit_card, bank_transfer, etc.)
  @Column({ nullable: true })
  paymentType: string;

  // Monto total del pago
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  // Moneda
  @Column({ default: 'COP' })
  currency: string;

  // Descripción (ej: "Corte de cabello con Ana")
  @Column({ nullable: true })
  description: string;

  // Información de comprador (extraída desde Mercado Pago o tu sistema)
  @Column({ nullable: true })
  payerEmail: string;

  @ManyToOne(() => ServiceOrder, (serviceOrder) => serviceOrder.payments)
  @JoinColumn({ name: 'service_order_id' })
  serviceOrder: ServiceOrder;
}
