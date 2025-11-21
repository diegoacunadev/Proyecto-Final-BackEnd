import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { ProviderPayout } from './entities/provider-payout.entity';
import { Commission } from '../commission/entities/commission.entity';

@Injectable()
export class ProviderPayoutsService {
  constructor(
    @InjectRepository(ProviderPayout)
    private payoutRepo: Repository<ProviderPayout>,

    @InjectRepository(Commission)
    private commissionRepo: Repository<Commission>,
  ) {}

  // Obtener balance pendiente del proveedor
  async getBalancePending(providerId: string) {
    const commissions = await this.commissionRepo.find({
      where: {
        provider: { id: providerId },
        paidOut: false,
      },
      relations: ['order', 'service'], // ✔ Traemos todo lo necesario
    });

    const total = commissions.reduce(
      (sum, c) => sum + Number(c.providerAmount),
      0,
    );

    // Construimos la lista detallada
    const details = commissions.map((c) => ({
      commissionId: c.id,
      orderDate: c.order?.createdAt,
      serviceName: c.service?.name,
      servicePrice: c.service?.price, // ← LISTO ✔
      commissionPercentage: Number(c.percentage),
      platformAmount: Number(c.platformAmount),
      providerAmount: Number(c.providerAmount),
    }));

    return {
      pendingBalance: total,
      commissionsCount: commissions.length,
      details, // ✔ Se envía el detalle por comisión
    };
  }

  async getBalancePaid(providerId: string) {
    const commissions = await this.commissionRepo.find({
      where: {
        provider: { id: providerId },
        paidOut: true,
      },
      relations: ['order', 'service'], // ✔ Traemos todo lo necesario
    });

    const total = commissions.reduce(
      (sum, c) => sum + Number(c.providerAmount),
      0,
    );

    // Construimos la lista detallada
    const details = commissions.map((c) => ({
      commissionId: c.id,
      orderDate: c.order?.createdAt,
      serviceName: c.service?.name,
      servicePrice: c.service?.price, // ← LISTO ✔
      commissionPercentage: Number(c.percentage),
      platformAmount: Number(c.platformAmount),
      providerAmount: Number(c.providerAmount),
    }));

    return {
      pendingBalance: total,
      commissionsCount: commissions.length,
      details, // ✔ Se envía el detalle por comisión
    };
  }

  // Liquidar pagos al proveedor
  async payout(providerId: string, note?: string) {
    const commissions = await this.commissionRepo.find({
      where: {
        provider: { id: providerId },
        paidOut: false,
      },
    });

    if (commissions.length === 0) {
      throw new BadRequestException(
        'No hay comisiones pendientes por pagar para este proveedor.',
      );
    }

    const total = commissions.reduce(
      (sum, c) => sum + Number(c.providerAmount),
      0,
    );

    // Crear el payout
    const payout = await this.payoutRepo.save(
      this.payoutRepo.create({
        provider: { id: providerId },
        amount: total,
        commissionCount: commissions.length,
        period: new Date().toISOString().slice(0, 10),
        note,
      }),
    );

    // Actualizar comisiones
    await Promise.all(
      commissions.map((c) =>
        this.commissionRepo.update(c.id, {
          paidOut: true,
          paidOutAt: new Date(),
          payout: { id: payout.id }, // ✔️ RELACIÓN CORRECTA
        }),
      ),
    );

    return {
      message: 'Pago registrado correctamente',
      payout,
    };
  }

  // Listar payouts del proveedor
  async getPayouts(providerId: string) {
    return this.payoutRepo.find({
      where: { provider: { id: providerId } },
      order: { createdAt: 'DESC' },
    });
  }

  // Comisiones dentro de un payout
  async getPayoutCommissions(payoutId: string) {
    return this.commissionRepo.find({
      where: { payout: { id: payoutId } },
      relations: ['order', 'service', 'provider', 'payout'],
    });
  }

  // Reporte semanal o mensual
  async getReport(providerId: string, period: 'weekly' | 'monthly') {
    if (!period) {
      throw new BadRequestException(
        'Debes enviar ?period=weekly o ?period=monthly',
      );
    }

    let start: Date;
    const end = new Date();

    if (period === 'weekly') {
      start = new Date();
      start.setDate(start.getDate() - 7);
    } else {
      start = new Date();
      start.setMonth(start.getMonth() - 1);
    }

    const commissions = await this.commissionRepo.find({
      where: {
        provider: { id: providerId },
        createdAt: Between(start, end),
        paidOut: true,
      },
      relations: ['order', 'service'],
    });

    const totalProvider = commissions.reduce(
      (a, c) => a + Number(c.providerAmount),
      0,
    );

    const totalPlatform = commissions.reduce(
      (a, c) => a + Number(c.platformAmount),
      0,
    );

    return {
      period,
      from: start,
      to: end,
      commissionsCount: commissions.length,
      providerAmountTotal: totalProvider,
      platformAmountTotal: totalPlatform,
      commissions,
    };
  }
}
