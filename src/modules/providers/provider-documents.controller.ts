import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Body,
  Param,
  Get,
  Patch,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ProviderDocumentsService } from './provider-documents.service';
import { DocumentStatus } from './enums/document-status.enum';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../auth/roles.enum';




@ApiTags('provider-documents')
@Controller('provider-documents')
export class ProviderDocumentsController {
  constructor(private readonly providerDocumentsService: ProviderDocumentsService) {}




  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyDocuments(@Req() req) {
    if (req.user.role !== Role.Provider) {
      throw new ForbiddenException('Solo los proveedores pueden ver esta ruta.');
    }

    return this.providerDocumentsService.findAll(req.user.id);
  }



    // LISTAR DOCUMENTOS PENDIENTES
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get('admin/pending')
  async getPendingDocuments() {
    return this.providerDocumentsService.getPendingDocuments();
  }


  // REVISAR DOCUMENTO (APROBAR / RECHAZAR)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Patch('admin/review/:id')
  async reviewDocument(
    @Param('id') id: string,
    @Body() body: { status: DocumentStatus; comment?: string },
  ) {
    return this.providerDocumentsService.reviewDocument(id, body.status, body.comment);
  }

  
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':providerId')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'file', maxCount: 1 },
      { name: 'photoVerification', maxCount: 1 },
      { name: 'accountFile', maxCount: 1 },
    ]),
  )
  async uploadDocuments(
    @Req() req,
    @Param('providerId') providerId: string,
    @UploadedFiles() files,
    @Body() dto: any,
  ) {
    return this.providerDocumentsService.create(providerId, files, dto, req.user);
  }






  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':providerId')
  async findAll(
    @Req() req,
    @Param('providerId') providerId: string,
  ) {
    // Solo el proveedor dueño o admin puede ver documentos
    if (req.user.role === Role.Provider && req.user.id !== providerId) {
      throw new ForbiddenException('No tienes permiso para ver estos documentos.');
    }

    return this.providerDocumentsService.findAll(providerId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Patch('status/:id')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: DocumentStatus
  ) {
    return this.providerDocumentsService.updateStatus(id, status);
  }
}
