import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Country } from 'src/modules/locations/entities/country.entity';
import { Region } from 'src/modules/locations/entities/region.entity';
import { City } from 'src/modules/locations/entities/city.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { ServiceOrder } from 'src/modules/service-orders/entities/service-order.entity';
import { on } from 'events';

// Entidad que representa una dirección física asociada a un usuario.
@Entity('addresses')
export class Address {
  // Identificador único de la dirección (UUID).
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Nombre o etiqueta de la dirección (ej. "Casa", "Oficina").
  @Column({ length: 100 })
  name: string;

  // Dirección completa o descripción del domicilio.
  @Column({ length: 200 })
  address: string;

  // Barrio o zona (opcional).
  @Column({ length: 100, nullable: true })
  neighborhood: string;

  // Tipo de inmueble (opcional, ej. "Apartamento").
  @Column({ length: 100, nullable: true })
  buildingType: string;

  // Comentarios o referencias adicionales (opcional).
  @Column({ length: 200, nullable: true })
  comments: string;

  // Estado del registro (true = activo, false = inactivo).
  @Column({ default: true })
  status: boolean;

  // Coordenadas (opcional)
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lat: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lng: number;


  // Relación con el país correspondiente.
  @ManyToOne(() => Country, { eager: true })
  @JoinColumn({ name: 'country_id' })
  country: Country;

  // Relación con la región correspondiente.
  @ManyToOne(() => Region, { eager: true })
  @JoinColumn({ name: 'region_id' })
  region: Region;

  // Relación con la ciudad correspondiente.
  @ManyToOne(() => City, { eager: true })
  @JoinColumn({ name: 'city_id' })
  city: City;

  // Relación con el usuario propietario (eliminación en cascada).
  @ManyToOne(() => User, (user) => user.addresses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => ServiceOrder, (serviceOrder) => serviceOrder.address)
  serviceOrders: ServiceOrder[];
}
