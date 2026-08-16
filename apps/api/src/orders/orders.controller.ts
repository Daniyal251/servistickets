import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создать заказ из зарезервированных билетов' })
  async createOrder(
    @Request() req: any,
    @Body() body: { ticketIds: string[] },
  ) {
    return this.ordersService.create(req.user.sub, body.ticketIds);
  }

  @Get()
  @ApiOperation({ summary: 'Получить свои заказы' })
  getMyOrders(@Request() req: any, @Query('page') page?: number, @Query('limit') limit?: number, @Query('status') status?: string) {
    return this.ordersService.findAll(
      req.user.sub,
      parseInt(page as any, 10) || 1,
      parseInt(limit as any, 10) || 10,
      status as any,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить детали заказа' })
  getOrder(@Param('id') id: string, @Request() req: any) {
    return this.ordersService.findOne(id, req.user.sub);
  }

  @Post(':id/confirm-payment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Подтвердить оплату заказа' })
  confirmPayment(@Param('id') id: string, @Body() body?: { paymentMethod?: string }) {
    return this.ordersService.confirmPayment(id, body?.paymentMethod);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Отменить заказ' })
  cancelOrder(@Param('id') id: string) {
    return this.ordersService.cancelOrder(id);
  }

  @Post(':id/refund')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вернуть деньги за заказ' })
  refundOrder(@Param('id') id: string) {
    return this.ordersService.refundOrder(id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Получить статистику по своим заказам' })
  getOrderStats(@Request() req: any) {
    return this.ordersService.getOrderStats(req.user.sub);
  }
}
