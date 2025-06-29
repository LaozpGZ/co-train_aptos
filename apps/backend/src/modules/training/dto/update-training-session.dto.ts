import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateTrainingSessionDto } from './create-training-session.dto';
import { TrainingStatus } from '../entities/training-session.entity';

export class UpdateTrainingSessionDto extends PartialType(CreateTrainingSessionDto) {
  @ApiPropertyOptional({
    description: 'Training session status',
    enum: TrainingStatus,
    example: TrainingStatus.RUNNING,
  })
  @IsOptional()
  @IsEnum(TrainingStatus)
  status?: TrainingStatus;

  @ApiPropertyOptional({
    description: 'Training progress percentage',
    example: 75,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;

  @ApiPropertyOptional({
    description: 'Current number of participants',
    example: 3,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  participantCount?: number;
}