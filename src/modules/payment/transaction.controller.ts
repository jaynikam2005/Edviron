import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
  Request,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import {
  TransactionQueryDto,
  PaginatedTransactionResponseDto,
  TransactionStatusResponseDto,
} from '../../dto/transaction-query.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  async getAllTransactions(
    @Query(ValidationPipe) query: TransactionQueryDto,
    @Request() req: any,
  ): Promise<PaginatedTransactionResponseDto> {
    return this.transactionService.getAllTransactions(query, req.user);
  }

  @Get('school/:schoolId')
  async getTransactionsBySchool(
    @Param('schoolId') schoolId: string,
    @Query(ValidationPipe) query: TransactionQueryDto,
    @Request() req: any,
  ): Promise<PaginatedTransactionResponseDto> {
    return this.transactionService.getTransactionsBySchool(schoolId, query, req.user);
  }
}

@Controller('transaction-status')
@UseGuards(JwtAuthGuard)
export class TransactionStatusController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get(':customOrderId')
  async getTransactionStatus(
    @Param('customOrderId') customOrderId: string,
    @Request() req: any,
  ): Promise<TransactionStatusResponseDto> {
    return this.transactionService.getTransactionStatus(customOrderId, req.user);
  }
}
