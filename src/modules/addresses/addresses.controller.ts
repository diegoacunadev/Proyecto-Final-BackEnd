import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { Role } from 'src/modules/auth/roles.enum';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard'; 

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @Roles(Role.User, Role.Admin)
  async create(@Body() dto: CreateAddressDto, @Req() req) {
    return this.addressesService.create(dto, req.user);
  }

  @Get()
  @Roles(Role.User, Role.Admin)
  async findAll(@Req() req) {
    return this.addressesService.findAll(req.user);
  }

  @Get(':id')
  @Roles(Role.User, Role.Admin)
  async findOne(@Param('id') id: string, @Req() req) {
    return this.addressesService.findOne(id, req.user);
  }

  @Patch(':id')
  @Roles(Role.User, Role.Admin)
  async update(@Param('id') id: string, @Body() dto: UpdateAddressDto, @Req() req) {
    return this.addressesService.update(id, dto, req.user);
  }

  @Patch('deactivate/:id')
  @Roles(Role.User, Role.Admin)
  async deactivate(@Param('id') id: string, @Req() req) {
    return this.addressesService.deactivate(id, req.user);
  }

  @Patch('reactivate/:id')
  @Roles(Role.User, Role.Admin)
  async reactivate(@Param('id') id: string, @Req() req) {
    return this.addressesService.reactivate(id, req.user);
  }
}
