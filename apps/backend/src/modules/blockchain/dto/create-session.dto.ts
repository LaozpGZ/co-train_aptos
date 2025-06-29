import { IsString, IsNumber, IsOptional, Min, Max, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateSessionDto {
  @ApiProperty({
    description: 'Name of the training session',
    example: 'AI Model Training Session #1',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Total reward amount in APT (smallest unit)',
    example: 1000000000, // 10 APT
    minimum: 1,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  rewardAmount: number;

  @ApiProperty({
    description: 'Maximum number of participants allowed',
    example: 10,
    minimum: 1,
    maximum: 1000,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(1000)
  maxParticipants: number;

  @ApiProperty({
    description: 'Optional description of the training session',
    example: 'Training session for improving AI model accuracy',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Duration of the session in minutes',
    example: 60,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  duration?: number;
}

export interface CreateSessionParams {
  name: string;
  rewardAmount: number;
  maxParticipants: number;
  description?: string;
  duration?: number;
}