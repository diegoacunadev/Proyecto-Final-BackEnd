import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateServiceOrderDto {
  @ApiProperty({ example: 'pending' })
  @IsOptional()
  @IsString()
  status?: string; // opcional, por defecto será "pending"

  @IsNumber()
  @ApiProperty({ example: 150.75 })
  price: number;

  @ApiProperty({ example: 'provider_id' })
  @IsString()
  @IsUUID()
  providerId: string;

  @ApiProperty({ example: 'user_id' })
  @IsUUID()
  userId: string;

  @ApiProperty({ example: 'service_id' })
  @IsUUID()
  serviceId: string;

  @ApiProperty({ example: 'address_id' })
  @IsUUID()
  addressId: string;
}
