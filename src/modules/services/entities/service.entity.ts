import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Provider } from 'src/modules/providers/entities/provider.entity';
import { Category } from 'src/modules/categories/entities/category.entity';
import { ServiceStatus } from '../enums/service-status.enum';
import { ServiceOrder } from 'src/modules/service-orders/entities/service-order.entity';
import { on } from 'events';
import { Commission } from 'src/modules/commission/entities/commission.entity';
import { Review } from 'src/modules/reviews/entities/review.entity';

// Entidad que representa los servicios ofrecidos por los proveedores.
// Incluye información básica, relación con el proveedor y su categoría.
@Entity({ name: 'services' })
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'simple-array', nullable: true })
  photos: string[];

  @Column({ type: 'enum', enum: ServiceStatus, default: ServiceStatus.ACTIVE })
  status: ServiceStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', nullable: true })
  duration: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => Provider, (provider) => provider.services)
  @JoinColumn({ name: 'providerId' })
  provider: Provider;

  @ManyToOne(() => Category, (category) => category.services)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @OneToMany(() => ServiceOrder, (serviceOrder) => serviceOrder.service)
  serviceOrders: ServiceOrder[];

  @OneToMany(() => Commission, (commission) => commission.service)
  commissions: Commission[];

  @OneToMany(() => Review, (review) => review.service)
  reviews: Review[];
}
