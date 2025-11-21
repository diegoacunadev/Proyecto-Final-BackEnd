import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { ServiceOrder } from 'src/modules/service-orders/entities/service-order.entity';
import { Provider } from 'src/modules/providers/entities/provider.entity';
import { Service } from 'src/modules/services/entities/service.entity';
import { ProviderPayout } from 'src/modules/provider-payouts/entities/provider-payout.entity';

@Entity({ name: 'commissions' })
export class Commission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ServiceOrder, (order) => order.commissions)
  @JoinColumn({ name: 'orderId' })
  order: ServiceOrder;

  @ManyToOne(() => Provider, (provider) => provider.commissions)
  @JoinColumn({ name: 'providerId' })
  provider: Provider;

  @ManyToOne(() => Service, (service) => service.commissions)
  @JoinColumn({ name: 'serviceId' })
  service: Service;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  percentage: number; // Ejemplo: 20 = 20%

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  platformAmount: number; // Lo que gana la plataforma

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  providerAmount: number; // Lo que se le debe al proveedor

  @Column({ default: false })
  paidOut: boolean;

  @Column({ type: 'timestamp', nullable: true })
  paidOutAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => ProviderPayout, (payout) => payout.commissions, {
    nullable: true, // si quieres que la comisión pueda no tener payout
  })
  @JoinColumn({ name: 'payoutId' })
  payout: ProviderPayout;
}
