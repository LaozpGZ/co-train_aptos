import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsObject,
  IsPositive,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TrainingType, DifficultyLevel } from '../entities/training-session.entity';

export class CreateTrainingSessionDto {
  @ApiProperty({
    description: 'Training session title',
    example: 'Language Model Fine-tuning',
    maxLength: 200,
  })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({
    description: 'Training session description',
    example: 'Fine-tune a language model for specific domain tasks',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Type of training',
    enum: TrainingType,
    example: TrainingType.LANGUAGE_MODEL,
  })
  @IsEnum(TrainingType)
  type: TrainingType;

  @ApiProperty({
    description: 'Difficulty level',
    enum: DifficultyLevel,
    example: DifficultyLevel.INTERMEDIATE,
  })
  @IsEnum(DifficultyLevel)
  difficulty: DifficultyLevel;

  @ApiPropertyOptional({
    description: 'Estimated duration in minutes',
    example: 120,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  estimatedDurationMinutes?: number;

  @ApiPropertyOptional({
    description: 'Maximum number of participants',
    example: 5,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  maxParticipants?: number;

  @ApiPropertyOptional({
    description: 'Hardware and software requirements',
    example: {
      minGPU: 'RTX 3080',
      minRAM: '16GB',
      bandwidth: '100Mbps',
    },
  })
  @IsOptional()
  @IsObject()
  requirements?: {
    minGPU?: string;
    minRAM?: string;
    bandwidth?: string;
    [key: string]: any;
  };

  @ApiPropertyOptional({
    description: 'Reward structure for participants',
    example: {
      tokens: 100,
      reputation: 50,
      nfts: 1,
    },
  })
  @IsOptional()
  @IsObject()
  rewards?: {
    tokens: number;
    reputation: number;
    nfts?: number;
    [key: string]: any;
  };

  @ApiPropertyOptional({
    description: 'Training configuration parameters',
    example: {
      learningRate: 0.001,
      batchSize: 32,
      epochs: 10,
    },
  })
  @IsOptional()
  @IsObject()
  configuration?: Record<string, any>;
}