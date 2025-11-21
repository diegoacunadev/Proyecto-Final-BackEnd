import { Controller, Get, Param, Post, Body, Query } from '@nestjs/common';
import { ProviderPayoutsService } from './provider-payouts.service';

@Controller('payouts')
export class ProviderPayoutsController {
  constructor(private payoutsService: ProviderPayoutsService) {}

  // ✔ Balance pendiente del proveedor
  @Get('providerPending/:providerId/balance')
  getBalancePending(@Param('providerId') providerId: string) {
    return this.payoutsService.getBalancePending(providerId);
  }

  // ✔ Balance pendiente del proveedor
  @Get('providerPaid/:providerId/balance')
  getBalancePaid(@Param('providerId') providerId: string) {
    return this.payoutsService.getBalancePaid(providerId);
  }

  // ✔ Crear payout (liquidación)
  @Post('provider/:providerId')
  payout(@Param('providerId') providerId: string, @Body('note') note?: string) {
    return this.payoutsService.payout(providerId, note);
  }

  // ✔ Todos los payouts del proveedor
  @Get('providerAll/:providerId')
  getPayoutsByProvider(@Param('providerId') providerId: string) {
    return this.payoutsService.getPayouts(providerId);
  }

  // ✔ Comisiones dentro de un payout
  @Get(':payoutId/commissions')
  getPayoutCommissions(@Param('payoutId') payoutId: string) {
    return this.payoutsService.getPayoutCommissions(payoutId);
  }

  // ✔ Reporte semanal o mensual
  @Get('provider/:providerId/report')
  getProviderReport(
    @Param('providerId') providerId: string,
    @Query('period') period: 'weekly' | 'monthly',
  ) {
    return this.payoutsService.getReport(providerId, period);
  }
}
