import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Service } from 'src/modules/services/entities/service.entity';

// Entidad que representa una categoría de servicios.
@Entity({ name: 'categories' })
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string; // Identificador único de la categoría.

  @Column({ length: 100 })
  name: string; // Nombre de la categoría.

  @Column({ type: 'text', nullable: true })
  description: string; // Descripción opcional de la categoría.

  @Column({ default: true })
  status: boolean; // Estado de la categoría (activa/inactiva).

  // Relación uno a muchos con los servicios asociados.
  @OneToMany(() => Service, (service) => service.category)
  services: Service[];
}