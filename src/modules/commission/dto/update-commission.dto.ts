import { PartialType } from '@nestjs/swagger';
import { CreateCommissionDto } from './create-commission.dto';

export class UpdateCommissionDto extends PartialType(CreateCommissionDto) {}
