import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderPayout } from './entities/provider-payout.entity';
import { ProviderPayoutsService } from './provider-payouts.service';
import { ProviderPayoutsController } from './provider-payouts.controller';
import { Commission } from '../commission/entities/commission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProviderPayout, Commission])],
  controllers: [ProviderPayoutsController],
  providers: [ProviderPayoutsService],
  exports: [ProviderPayoutsService],
})
export class ProviderPayoutsModule {}
