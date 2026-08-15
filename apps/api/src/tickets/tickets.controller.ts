import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../auth/guards/roles.guard';

@ApiTags('tickets')
@Controller('tickets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post(':eventId/reserve')
  @ApiOperation({ summary: 'Забронировать билеты на событие' })
  async reserveTickets(
    @Param('eventId') eventId: string,
    @Request() req: any,
    @Body() body: { seatIds: string[]; orderId: string },
  ) {
    return this.ticketsService.reserveTickets(eventId, req.user.sub, body.seatIds, body.orderId);
  }

  @Post(':id/confirm-payment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Подтвердить оплату билета' })
  confirmPayment(@Param('id') id: string) {
    return this.ticketsService.confirmPayment(id);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Отменить билет' })
  cancelTicket(@Param('id') id: string) {
    return this.ticketsService.cancelTicket(id);
  }

  @Post(':id/use')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Отметить билет как использованный (ORGANIZER/ADMIN)' })
  useTicket(@Param('id') id: string) {
    return this.ticketsService.useTicket(id);
  }

  @Get('qr/:qrCode')
  @ApiOperation({ summary: 'Получить информацию о билете по QR-коду' })
  getTicketByQRCode(@Param('qrCode') qrCode: string) {
    return this.ticketsService.getTicketByQRCode(qrCode);
  }

  @Get(':id/qr-code')
  @ApiOperation({ summary: 'Сгенерировать QR-код для билета' })
  generateQRCode(@Param('id') id: string) {
    return this.ticketsService.generateTicketQRCode(id);
  }

  @Get('event/:eventId')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Получить все билеты события (ORGANIZER/ADMIN)' })
  getEventTickets(@Param('eventId') eventId: string, @Query('status') status?: string) {
    return this.ticketsService.getEventTickets(eventId, status as any);
  }

  @Get('event/:eventId/stats')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Получить статистику по билетам события' })
  getTicketStats(@Param('eventId') eventId: string) {
    return this.ticketsService.getTicketStats(eventId);
  }
}
