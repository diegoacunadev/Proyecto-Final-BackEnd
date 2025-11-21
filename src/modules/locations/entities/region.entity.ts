import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Country } from './country.entity';
import { City } from './city.entity';

// Entidad que representa una región o estado dentro de un país.
// Está relacionada con un país y puede tener múltiples ciudades.
@Entity({ name: 'regions' })
export class Region {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @ManyToOne(() => Country, (country) => country.regions)
  country: Country;

  @OneToMany(() => City, (city) => city.region)
  cities: City[];
}
