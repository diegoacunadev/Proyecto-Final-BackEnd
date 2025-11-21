import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsUUID,
  IsEmail,
  IsPositive,
} from 'class-validator';

export class CreatePaymentDto {
  @IsOptional()
  @IsString()
  mpPaymentId?: string;

  @IsOptional()
  @IsString()
  mpPreferenceId?: string;

  @IsOptional()
  @IsEnum(['pending', 'approved', 'rejected', 'cancelled', 'in_process'])
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'in_process';

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  paymentType?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEmail()
  payerEmail?: string;

  @IsUUID()
  serviceOrderId: string;
}
