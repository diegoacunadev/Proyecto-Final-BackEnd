import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Provider } from './provider.entity';
import { ScheduleStatus } from '../enums/schedule-status.enum';

// Entidad que representa los horarios de atención de un proveedor.
// Define los días, horas de inicio y fin, y su estado actual.
@Entity({ name: 'schedules' })
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 10 })
  day: string; // Mon | Tue | Wed | Thu | Fri | Sat | Sun

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ type: 'enum', enum: ScheduleStatus })
  status: ScheduleStatus;

  @ManyToOne(() => Provider, (provider) => provider.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;
}
