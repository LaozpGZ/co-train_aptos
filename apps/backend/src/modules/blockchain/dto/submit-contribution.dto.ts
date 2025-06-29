import { IsString, IsNumber, IsNotEmpty, Matches, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SubmitContributionDto {
  @ApiProperty({
    description: 'Training session ID',
    example: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({
    description: 'Participant wallet address (Aptos address format)',
    example: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    pattern: '^0x[a-fA-F0-9]{64}$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^0x[a-fA-F0-9]{64}$/, {
    message: 'participantAddress must be a valid Aptos address format (0x followed by 64 hex characters)',
  })
  participantAddress: string;

  @ApiProperty({
    description: 'Contribution score (0-100)',
    example: 85,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(100)
  score: number;

  @ApiProperty({
    description: 'Hash of the contribution data (optional)',
    example: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  contributionHash?: string;

  @ApiProperty({
    description: 'Additional metadata about the contribution (optional)',
    example: 'Model accuracy: 95.2%, Training time: 2.5 hours',
    required: false,
  })
  @IsString()
  @IsOptional()
  metadata?: string;
}