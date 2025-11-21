import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Region } from './region.entity';

// Entidad que representa una ciudad dentro del sistema.
// Está relacionada con una región mediante una relación ManyToOne.
@Entity({ name: 'cities' })
export class City {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @ManyToOne(() => Region, (region) => region.cities)
  region: Region;
}
