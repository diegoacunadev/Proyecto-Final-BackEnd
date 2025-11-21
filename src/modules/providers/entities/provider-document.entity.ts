import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Provider } from './provider.entity';
import { DocumentStatus } from '../enums/document-status.enum';

// Entidad que representa los documentos asociados a un proveedor.
// Incluye datos de identificación, soporte bancario y verificación.
@Entity({ name: 'provider_documents' })
export class ProviderDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Provider, (provider) => provider.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @Column({ type: 'varchar', length: 50 })
  documentType: string; // Ejemplo: "ID", "RUT", "Certificado Bancario"

  @Column({ type: 'varchar', length: 50 })
  documentNumber: string;

  @Column({ type: 'varchar', nullable: true, length: 300 })
  file: string; // URL del documento

  @CreateDateColumn({ type: 'timestamp' })
  date: Date;

  @Column({ type: 'enum', enum: DocumentStatus })
  status: DocumentStatus;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  photoVerification: string;

  // Datos bancarios opcionales
  @Column({ type: 'varchar', length: 300, nullable: true })
  accountType: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  accountNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  bank: string;

  @Column({ type: 'varchar', nullable: true })
  accountFile: string; // URL del soporte bancario

  @Column({ type: 'text', nullable: true })
  adminComment: string;
}
