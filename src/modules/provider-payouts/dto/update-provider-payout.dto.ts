import { PartialType } from '@nestjs/swagger';
import { CreateProviderPayoutDto } from './create-provider-payout.dto';

export class UpdateProviderPayoutDto extends PartialType(CreateProviderPayoutDto) {}
