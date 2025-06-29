import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateContributorDto } from './create-contributor.dto';
import { ContributorStatus, ContributorTier } from '../entities/contributor.entity';

export class UpdateContributorDto extends PartialType(CreateContributorDto) {
  @ApiPropertyOptional({
    description: 'Contributor status',
    enum: ContributorStatus,
    example: ContributorStatus.ONLINE,
  })
  @IsOptional()
  @IsEnum(ContributorStatus)
  status?: ContributorStatus;

  @ApiPropertyOptional({
    description: 'Contributor tier level',
    enum: ContributorTier,
    example: ContributorTier.SILVER,
  })
  @IsOptional()
  @IsEnum(ContributorTier)
  tier?: ContributorTier;

  @ApiPropertyOptional({
    description: 'Total number of contributions',
    example: 25,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalContributions?: number;

  @ApiPropertyOptional({
    description: 'Total earnings in tokens',
    example: 1500.50,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalEarnings?: number;

  @ApiPropertyOptional({
    description: 'Reputation score',
    example: 85.5,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  reputationScore?: number;

  @ApiPropertyOptional({
    description: 'Success rate percentage',
    example: 92.5,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  successRate?: number;

  @ApiPropertyOptional({
    description: 'Total online time in hours',
    example: 240,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalOnlineHours?: number;
}