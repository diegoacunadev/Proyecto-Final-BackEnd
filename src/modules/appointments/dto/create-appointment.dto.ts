import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsDateString } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({ example: 'ec0511d7-7d74-4e9b-9edd-1e009b3d2c81' })
  @IsUUID()
  providerId: string;

  @ApiProperty({ example: 'f8acac0a-3481-47a1-8df5-81eaac58cfee' })
  @IsUUID()
  userId: string;

  @ApiProperty({ example: '06b2d2bd-b661-4673-b38e-ae5874a1ee4b' })
  @IsUUID()
  scheduleId: string;

  @ApiProperty({ example: 'YYYY-MM-DDT00:00:00Z' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ example: 'YYYY-MM-DDT00:00:00Z' })
  @IsDateString()
  endTime: string;
}