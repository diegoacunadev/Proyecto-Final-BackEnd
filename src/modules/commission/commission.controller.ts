import { Controller, Get, Param } from '@nestjs/common';
import { CommissionService } from './commission.service';

@Controller('commissions')
export class CommissionController {
  constructor(private readonly commissionsService: CommissionService) {}

  @Get('order/:orderId')
  getCommissionsByOrder(@Param('orderId') orderId: string) {
    return this.commissionsService.findByOrder(orderId);
  }
}
