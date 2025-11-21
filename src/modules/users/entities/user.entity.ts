import { Length } from 'class-validator';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  Check,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ServiceOrder } from 'src/modules/service-orders/entities/service-order.entity';
import { Role } from 'src/modules/auth/roles.enum';
import { Address } from 'src/modules/addresses/entities/address.entity';
import { UserStatus } from '../enums/user-status.enum';
import { Country } from 'src/modules/locations/entities/country.entity';

// Entidad que representa a los usuarios del sistema.
// Contiene datos personales, de autenticación y relaciones con pedidos y direcciones.
@Check(`"names" ~ '^[A-Za-zÁÉÍÓÚáéíóúÑñ\\s]{2,50}$'`)
@Check(`"surnames" ~ '^[A-Za-zÁÉÍÓÚáéíóúÑñ\\s]{2,50}$'`)
@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150, nullable: false })
  names: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  surnames: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', nullable: false })
  password: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @ManyToOne(() => Country, { eager: true, nullable: true })
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @Column({ type: 'enum', enum: Role, default: Role.User })
  role: Role;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ type: 'varchar', nullable: true })
  profilePicture: string;

  @CreateDateColumn({ type: 'timestamp' })
  registrationDate: Date;

  @OneToMany(() => ServiceOrder, (serviceOrder) => serviceOrder.user)
  serviceOrders: ServiceOrder[];

  @OneToMany(() => Address, (address) => address.user)
  addresses: Address[];
}
