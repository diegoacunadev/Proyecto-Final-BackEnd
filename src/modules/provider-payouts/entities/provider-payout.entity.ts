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
import { Commission } from 'src/modules/commission/entities/commission.entity';

@Entity({ name: 'provider_payouts' })
export class ProviderPayout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relación con provider
  @ManyToOne(() => Provider, (provider) => provider.payouts, { eager: true })
  @JoinColumn({ name: 'providerId' })
  provider: Provider;

  // Total pagado al proveedor
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  // Cantidad de comisiones incluidas en este pago
  @Column({ type: 'int' })
  commissionCount: number;

  // Periodo del payout — semanal, mensual, etc
  @Column()
  period: string;

  // Nota opcional
  @Column({ nullable: true })
  note: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Commission, (commission) => commission.payout)
  commissions: Commission[];
}
