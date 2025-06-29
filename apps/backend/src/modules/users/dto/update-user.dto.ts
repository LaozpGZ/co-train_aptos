import { CreateUserDto } from './create-user.dto';
import {
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType, OmitType } from '@nestjs/mapped-types';
import { UserStatus } from '../entities/user.entity';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['email'] as const),
) {
  @ApiPropertyOptional({
    description: 'User status',
    enum: UserStatus,
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({
    description: 'Email verification status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;

  @ApiPropertyOptional({
    description: 'Token balance',
    example: 100.5,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tokenBalance?: number;

  @ApiPropertyOptional({
    description: 'Reputation score',
    example: 850,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  reputationScore?: number;

  @ApiPropertyOptional({
    description: 'Total contributions count',
    example: 25,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalContributions?: number;

  @ApiPropertyOptional({
    description: 'Avatar URL',
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  avatar?: string;
}