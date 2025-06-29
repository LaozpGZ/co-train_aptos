import {
  IsString,
  IsOptional,
  IsObject,
  IsArray,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContributorDto {
  @ApiProperty({
    description: 'Contributor display name',
    example: 'AI Trainer Pro',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Contributor location',
    example: 'San Francisco, CA',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @ApiPropertyOptional({
    description: 'Hardware specifications',
    example: {
      gpu: 'RTX 4090',
      ram: '32GB',
      cpu: 'Intel i9-13900K',
      storage: '2TB NVMe SSD',
    },
  })
  @IsOptional()
  @IsObject()
  hardwareSpecs?: {
    gpu?: string;
    ram?: string;
    cpu?: string;
    storage?: string;
    [key: string]: any;
  };

  @ApiPropertyOptional({
    description: 'Contributor capabilities and skills',
    example: [
      'Machine Learning',
      'Deep Learning',
      'Natural Language Processing',
      'Computer Vision',
    ],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  capabilities?: string[];

  @ApiPropertyOptional({
    description: 'Performance metrics and benchmarks',
    example: {
      avgTrainingTime: 120,
      successRate: 95.5,
      uptime: 99.8,
    },
  })
  @IsOptional()
  @IsObject()
  performanceMetrics?: {
    avgTrainingTime?: number;
    successRate?: number;
    uptime?: number;
    [key: string]: any;
  };

  @ApiPropertyOptional({
    description: 'Availability for training sessions',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  availability?: boolean;
}