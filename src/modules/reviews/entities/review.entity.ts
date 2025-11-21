import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Provider } from '../../providers/entities/provider.entity';
import { ServiceOrder } from '../../service-orders/entities/service-order.entity';
import { Service } from 'src/modules/services/entities/service.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // --- Relaciones de autor ---
  @Column({ type: 'uuid', nullable: true })
  authorUserId?: string;

  @Column({ type: 'uuid', nullable: true })
  authorProviderId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'authorUserId' })
  authorUser?: User;

  @ManyToOne(() => Provider, { nullable: true })
  @JoinColumn({ name: 'authorProviderId' })
  authorProvider?: Provider;

  // --- Relaciones de destino ---
  @Column({ type: 'uuid', nullable: true })
  targetUserId?: string;

  @Column({ type: 'uuid', nullable: true })
  targetProviderId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'targetUserId' })
  targetUser?: User;

  @ManyToOne(() => Provider, { nullable: true })
  @JoinColumn({ name: 'targetProviderId' })
  targetProvider?: Provider;

  @ManyToOne(() => ServiceOrder, (serviceOrders) => serviceOrders.reviews)
  @JoinColumn({ name: 'orderId' })
  serviceOrders: ServiceOrder;

  @Column({ type: 'uuid', nullable: true })
  serviceId?: string;

  @ManyToOne(() => Service, (service) => service.reviews, { nullable: true })
  @JoinColumn({ name: 'serviceId' })
  service?: Service;

  @Column()
  orderId: string;

  // --- Datos de review ---
  @Column({ type: 'int', width: 1 })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  // Array de URLs (hasta 5 fotos)
  @Column({ type: 'text', array: true, nullable: true })
  photoUrl?: string[] | null;

  @CreateDateColumn()
  createdAt: Date;
}
