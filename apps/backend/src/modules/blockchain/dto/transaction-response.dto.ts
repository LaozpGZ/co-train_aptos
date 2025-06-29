import { ApiProperty } from '@nestjs/swagger';

export class TransactionResponseDto {
  @ApiProperty({
    description: 'Transaction hash on the Aptos blockchain',
    example: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  })
  hash: string;

  @ApiProperty({
    description: 'Whether the transaction was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Human-readable message about the transaction result',
    example: 'Training session created successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Additional transaction data (optional)',
    required: false,
  })
  data?: any;
}

export interface TransactionResponse {
  hash: string;
  success: boolean;
  message: string;
  data?: any;
}