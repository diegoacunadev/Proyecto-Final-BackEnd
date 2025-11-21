import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { ServiceOrdersService } from './service-orders.service';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
// import { UpdateServiceOrderDto } from './dto/update-service-order.dto';
import { ServiceOrder } from './entities/service-order.entity';

@Controller('service-orders')
export class ServiceOrdersController {
  constructor(private readonly serviceOrdersService: ServiceOrdersService) {}

  @Post('create')
  create(
    @Body() createServiceOrderDto: CreateServiceOrderDto,
  ): Promise<ServiceOrder> {
    return this.serviceOrdersService.create(createServiceOrderDto);
  }

  @Get('orders-all')
  findAll(): Promise<ServiceOrder[]> {
    return this.serviceOrdersService.findAll();
  }

  @Get('provider/:providerId')
  findByProvider(
    @Param('providerId') providerId: string,
  ): Promise<ServiceOrder[]> {
    return this.serviceOrdersService.findByProvider(providerId);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string): Promise<ServiceOrder[]> {
    return this.serviceOrdersService.findByUser(userId);
  }

  @Get('orders/:id')
  findOne(@Param('id') id: string): Promise<ServiceOrder> {
    return this.serviceOrdersService.findOne(id);
  }

  //lo que hace es cambiar el estado de la orden a cancelada
  @Patch(':id/cancel')
  cancelOrder(@Param('id') id: string): Promise<ServiceOrder> {
    return this.serviceOrdersService.cancelOrder(id);
  }

  //lo que hace es cambiar el estado de la orden a cancelada
  @Patch(':id/confirm')
  confirmOrder(@Param('id') id: string): Promise<ServiceOrder> {
    return this.serviceOrdersService.confirmOrder(id);
  }

  //lo que hace es cambiar el estado de la orden a cancelada
  @Patch(':id/finish')
  finishOrder(@Param('id') id: string): Promise<ServiceOrder> {
    return this.serviceOrdersService.finishOrder(id);
  }
}
