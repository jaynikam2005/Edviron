import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { WebhookService } from './webhook.service';
import { CreatePaymentDto, PaymentResponseDto } from '../../dto/create-payment.dto';
import { WebhookPayloadDto, WebhookResponseDto } from '../../dto/webhook.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Public } from '../../decorators/public.decorator';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly webhookService: WebhookService,
  ) {}

  @Public()
  @Post('create-payment')
  @HttpCode(HttpStatus.OK)
  async createPayment(
    @Body(ValidationPipe) createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.createPayment(createPaymentDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('order/:id')
  async getOrder(@Param('id') orderId: string) {
    return this.paymentService.getOrderById(orderId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders/school/:schoolId')
  async getOrdersBySchool(@Param('schoolId') schoolId: string) {
    return this.paymentService.getOrdersBySchool(schoolId);
  }

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body(ValidationPipe) webhookPayload: WebhookPayloadDto,
  ): Promise<WebhookResponseDto> {
    return this.webhookService.processWebhook(webhookPayload);
  }

  @UseGuards(JwtAuthGuard)
  @Get('webhook-logs')
  async getWebhookLogs(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.webhookService.getWebhookLogs(limitNum);
  }

  @UseGuards(JwtAuthGuard)
  @Get('webhook-logs/status/:status')
  async getWebhookLogsByStatus(@Param('status') status: string) {
    return this.webhookService.getWebhookLogsByStatus(status);
  }
}