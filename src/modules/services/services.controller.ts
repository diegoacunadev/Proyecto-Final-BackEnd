import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  Query,
  Delete,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';
import { ServiceStatus } from './enums/service-status.enum';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { count } from 'console';
import { Service } from './entities/service.entity';
import { UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get('admin/all')
  async findAllAdmin() {
    return this.servicesService.findAllAdmin();
  }

  // PÚBLICOS
  @Get('find-all')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAllPublic(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.servicesService.findAllPublicPaginated(page, limit);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('find-all-paged')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAllPaged(
    @Req() req,
    @Query('page') page = 1,
    @Query('limit') limit = 5,
  ) {
    return this.servicesService.findAllPaged(req.user, page, limit);
  }

  // Ordenar por Parametro ('price' o 'duration')
  @Get('find-all-by-param')
  @ApiQuery({ name: 'param', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: String })
  @ApiQuery({ name: 'country', required: false, type: String })
  findAllBy(
    @Query('param') param: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('country') country?: string,
  ) {
    return this.servicesService.findAllBy(
      param,
      country,
      page ? +page : undefined,
      limit ? +limit : undefined,
    );
  }

  // Filtrar resultados por Ciudad, Region, cCategoria y Servicio
  //
  @Get('filtered-find/')
  @ApiQuery({ name: 'region', required: false, type: String })
  @ApiQuery({ name: 'city', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'serviceName', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: String })
  filteredFind(
    @Query('region') region?: string,
    @Query('city') city?: string,
    @Query('category') category?: string,
    @Query('serviceName') serviceName?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.servicesService.filteredFind(
      { region, city, category, serviceName },
      page ? +page : undefined,
      limit ? +limit : undefined,
    );
  }

  @Get('find/:id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOnePublic(id);
  }

  // PROTEGIDOS

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('approve/:id')
  @Roles(Role.Admin)
  async approveService(@Param('id') id: string, @Req() req) {
    // Cambia el estado a ACTIVE
    return this.servicesService.changeStatus(
      id,
      req.user,
      ServiceStatus.ACTIVE,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('delete/:id')
  @Roles(Role.Admin)
  async deleteService(@Param('id') id: string) {
    // Elimina el servicio físicamente
    return this.servicesService.deleteService(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('pending')
  @Roles(Role.Admin)
  async findAllPending() {
    return this.servicesService.findAllPending();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('provider/:providerId')
  @Roles(Role.Admin, Role.Provider)
  async findByProvider(@Param('providerId') providerId: string, @Req() req) {
    return this.servicesService.findByProvider(providerId, req.user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('create')
  @Roles(Role.Provider, Role.Admin)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'photos', maxCount: 5 }]))
  async create(
    @UploadedFiles() files: { photos?: Express.Multer.File[] },
    @Body() dto: CreateServiceDto,
    @Req() req,
  ) {
    return this.servicesService.create(dto, req.user, files?.photos);
  }

  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Post('create')
  // @Roles(Role.Provider, Role.Admin)
  // create(@Body() dto: CreateServiceDto, @Req() req) {
  //   return this.servicesService.create(dto, req.user);
  // }

  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Patch('update/:id')
  // @Roles(Role.Provider, Role.Admin)
  // update(@Param('id') id: string, @Body() dto: UpdateServiceDto, @Req() req) {
  //   return this.servicesService.update(id, dto, req.user);
  // }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('update/:id')
  @Roles(Role.Provider, Role.Admin)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'photos', maxCount: 5 }]))
  async update(
    @Param('id') id: string,
    @UploadedFiles() files: { photos?: Express.Multer.File[] },
    @Body() dto: UpdateServiceDto,
    @Req() req,
  ) {
    return this.servicesService.update(id, dto, req.user, files?.photos);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('deactivate/:id')
  @Roles(Role.Provider, Role.Admin)
  deactivate(@Param('id') id: string, @Req() req) {
    return this.servicesService.changeStatus(
      id,
      req.user,
      ServiceStatus.INACTIVE,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('activate/:id')
  @Roles(Role.Provider, Role.Admin)
  activate(@Param('id') id: string, @Req() req) {
    return this.servicesService.changeStatus(
      id,
      req.user,
      ServiceStatus.ACTIVE,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('status/:id')
  @Roles(Role.Provider, Role.Admin)
  async changeStatus(
    @Param('id') id: string,
    @Body('status') status: ServiceStatus,
    @Req() req,
  ) {
    return this.servicesService.changeStatus(id, req.user, status);
  }
}
