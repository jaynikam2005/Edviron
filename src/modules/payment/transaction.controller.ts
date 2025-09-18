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

interface AuthenticatedRequest {
  user: {
    userId?: string;
    email?: string;
    role?: string;
  };
}

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  async getAllTransactions(
    @Query(ValidationPipe) query: TransactionQueryDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<PaginatedTransactionResponseDto> {
    return this.transactionService.getAllTransactions(query, req.user);
  }

  @Get('school/:schoolId')
  async getTransactionsBySchool(
    @Param('schoolId') schoolId: string,
    @Query(ValidationPipe) query: TransactionQueryDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<PaginatedTransactionResponseDto> {
    return this.transactionService.getTransactionsBySchool(
      schoolId,
      query,
      req.user,
    );
  }
}

@Controller('transaction-status')
@UseGuards(JwtAuthGuard)
export class TransactionStatusController {
  constructor(private readonly transactionService: TransactionService) {}

    @Get(':custom_order_id')
  async getTransactionStatus(
    @Param('custom_order_id') customOrderId: string,
  ) {
    return await this.transactionService.getTransactionStatus(
      customOrderId,
    );
  }
}
