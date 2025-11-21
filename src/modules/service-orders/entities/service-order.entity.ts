import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Provider } from 'src/modules/providers/entities/provider.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Service } from 'src/modules/services/entities/service.entity';
import { Address } from 'src/modules/addresses/entities/address.entity';
import { Payment } from 'src/modules/payments/entities/payment.entity';
import { Review } from 'src/modules/reviews/entities/review.entity';
import { Commission } from 'src/modules/commission/entities/commission.entity';

@Entity({ name: 'service_orders' })
export class ServiceOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'pending' })
  status: string; // pending | accepted | completed | cancelled

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  //Creacion de las relaciones
  @ManyToOne(() => Provider, (provider) => provider.serviceOrders, { eager: true })
  @JoinColumn({ name: 'providerId' })
  provider: Provider;

  @ManyToOne(() => User, (user) => user.serviceOrders)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Service, (service) => service.serviceOrders)
  @JoinColumn({ name: 'serviceId' })
  service: Service;

  @ManyToOne(() => Address, (address) => address.serviceOrders)
  @JoinColumn({ name: 'addressId' })
  address: Address;

  @OneToMany(() => Payment, (payment) => payment.serviceOrder)
  payments: Payment[];

  @OneToMany(() => Review, (review) => review.serviceOrders)
  reviews: Review[];

  @OneToMany(() => Commission, (commission) => commission.order)
  commissions: Commission[];

}
