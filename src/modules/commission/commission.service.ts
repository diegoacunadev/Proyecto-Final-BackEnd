import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Commission } from './entities/commission.entity';
import { ServiceOrder } from '../service-orders/entities/service-order.entity';

@Injectable()
export class CommissionService {
  constructor(
    @InjectRepository(Commission)
    private commissionRepo: Repository<Commission>,
  ) {}

  async createCommission(order: ServiceOrder) {
    const percentage = 20; // % comisión plataforma

    const total = Number(order.price);
    const platformAmount = (total * percentage) / 100;
    const providerAmount = total - platformAmount;

    const commission = this.commissionRepo.create({
      order,
      provider: order.provider,
      service: order.service,
      percentage,
      platformAmount,
      providerAmount,
    });

    return await this.commissionRepo.save(commission);
  }

  findByOrder(orderId: string) {
    return this.commissionRepo.find({
      where: { order: { id: orderId } },
      relations: ['order', 'provider'],
    });
  }

  findAll() {
    return this.commissionRepo.find();
  }

  findOne(id: string) {
    return this.commissionRepo.findOne({
      where: { id },
      relations: ['order', 'provider', 'service'],
    });
  }

  remove(id: string) {
    return this.commissionRepo.delete(id);
  }
}
