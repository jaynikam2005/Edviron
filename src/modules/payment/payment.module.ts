import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentService } from './payment.service';
import { WebhookService } from './webhook.service';
import { TransactionService } from './transaction.service';
import { PaymentController } from './payment.controller';
import { TransactionController, TransactionStatusController } from './transaction.controller';
import { Order, OrderSchema } from '../../schemas/order.schema';
import { OrderStatus, OrderStatusSchema } from '../../schemas/order-status.schema';
import { WebhookLogs, WebhookLogsSchema } from '../../schemas/webhook-logs.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: OrderStatus.name, schema: OrderStatusSchema },
      { name: WebhookLogs.name, schema: WebhookLogsSchema },
    ]),
  ],
  controllers: [PaymentController, TransactionController, TransactionStatusController],
  providers: [PaymentService, WebhookService, TransactionService],
  exports: [PaymentService, WebhookService, TransactionService],
})
export class PaymentModule {}