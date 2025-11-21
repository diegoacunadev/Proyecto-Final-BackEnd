import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProviderDocument } from './entities/provider-document.entity';
import { Provider } from './entities/provider.entity';
import { v2 as cloudinary } from 'cloudinary';
import { DocumentStatus } from './enums/document-status.enum';
import { Role } from '../auth/roles.enum';

@Injectable()
export class ProviderDocumentsService {
  constructor(
    @InjectRepository(ProviderDocument)
    private readonly providerDocumentRepo: Repository<ProviderDocument>,

    @InjectRepository(Provider)
    private readonly providerRepo: Repository<Provider>,
  ) {}

  /**
   * Sube un archivo a Cloudinary usando buffer (memoria)
   * Soporta PDFs, imágenes, etc. gracias a resource_type: 'auto'
   */
  private async uploadToCloudinary(
    file: Express.Multer.File,
    folder: string,
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningún archivo');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Solo se permiten imágenes.');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image', // 👈 SIEMPRE IMAGEN
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error || !result) {
            console.error('Cloudinary upload error:', error);
            return reject(new BadRequestException('Error al subir la imagen a Cloudinary'));
          }

          resolve(result.secure_url);
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async create(
    providerId: string,
    files: {
      file?: Express.Multer.File[];
      photoVerification?: Express.Multer.File[];
      accountFile?: Express.Multer.File[];
    },
    dto: any,
    user: any,
  ) {
    // Seguridad: proveedor solo sube sus propios docs
    if (user.role === Role.Provider && user.id !== providerId) {
      throw new ForbiddenException('No puedes subir documentos de otro proveedor.');
    }

    const provider = await this.providerRepo.findOne({ where: { id: providerId } });
    if (!provider) throw new NotFoundException('Proveedor no encontrado');

    const document = new ProviderDocument();
    document.provider = provider;
    document.documentType = dto.documentType;
    document.documentNumber = dto.documentNumber;
    document.description = dto.description || null;
    document.accountType = dto.accountType || null;
    document.accountNumber = dto.accountNumber || null;
    document.bank = dto.bank || null;
    document.status = DocumentStatus.PENDING;

    // Archivo principal (imagen)
    if (files.file?.[0]) {
      const image = files.file[0];
      if (!image.mimetype.startsWith('image/')) {
        throw new BadRequestException('El archivo principal debe ser una imagen');
      }
      document.file = await this.uploadToCloudinary(
        image,
        'serviyapp/providers/documents',
      );
    }

    // Foto de verificación (imagen)
    if (files.photoVerification?.[0]) {
      const photo = files.photoVerification[0];
      if (!photo.mimetype.startsWith('image/')) {
        throw new BadRequestException('La foto de verificación debe ser una imagen');
      }
      document.photoVerification = await this.uploadToCloudinary(
        photo,
        'serviyapp/providers/verifications',
      );
    }

    // Soporte bancario (imagen)
    if (files.accountFile?.[0]) {
      const acc = files.accountFile[0];
      if (!acc.mimetype.startsWith('image/')) {
        throw new BadRequestException('El soporte bancario debe ser una imagen');
      }
      document.accountFile = await this.uploadToCloudinary(
        acc,
        'serviyapp/providers/accounts',
      );
    }

    return await this.providerDocumentRepo.save(document);
  }

  async findAll(providerId: string) {
    return this.providerDocumentRepo.find({
      where: { provider: { id: providerId } },
      order: { date: 'DESC' },
    });
  }

  async updateStatus(id: string, status: DocumentStatus) {
    const doc = await this.providerDocumentRepo.findOne({ where: { id } });
    if (!doc) throw new NotFoundException('Documento no encontrado');
    doc.status = status;
    return this.providerDocumentRepo.save(doc);
  }

  async getPendingDocuments() {
    return this.providerDocumentRepo.find({
      where: { status: DocumentStatus.PENDING },
      relations: ['provider', 'provider.country', 'provider.region', 'provider.city'],
      order: { date: 'DESC' },
    });
  }

  async reviewDocument(
    documentId: string,
    status: DocumentStatus,
    comment?: string,
  ) {
    const document = await this.providerDocumentRepo.findOne({
      where: { id: documentId },
      relations: ['provider'],
    });

    if (!document) {
      throw new NotFoundException('Documento no encontrado');
    }

    // Asignar nuevo estado
    document.status = status;

    // Si hay comentario (solo para rechazo)
    if (comment) {
      document.adminComment = comment;
    }

    await this.providerDocumentRepo.save(document);

    // Si fue aprobado → marcar proveedor como completado
    if (status === DocumentStatus.APPROVED) {
      document.provider.isCompleted = true;
      await this.providerRepo.save(document.provider);
    }

    return {
      message: `Documento ${status}`,
      document,
    };
  }
}