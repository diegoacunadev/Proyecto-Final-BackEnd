import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @IsUUID()
  orderId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;

  // Acepta múltiples URLs
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photoUrl?: string[];

  @IsOptional()
  @IsUUID()
  authorUserId?: string;

  @IsOptional()
  @IsUUID()
  authorProviderId?: string;

  @IsOptional()
  @IsUUID()
  targetUserId?: string;

  @IsOptional()
  @IsUUID()
  targetProviderId?: string;

  serviceId: string;
}
