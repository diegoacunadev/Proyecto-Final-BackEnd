import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Region } from './region.entity';

// Entidad que representa un país dentro del sistema.
// Contiene información básica como nombre, código y lada telefónica.
@Entity({ name: 'countries' })
export class Country {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ length: 5, unique: true })
  code: string; // Ejemplo: CO, AR, MX

  @Column({ type: 'varchar' })
  lada: string;

  @OneToMany(() => Region, (region) => region.country)
  regions: Region[];
}
