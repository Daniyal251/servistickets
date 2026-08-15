import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TicketStatus } from '@prisma/client';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async reserveTickets(eventId: string, userId: string, seatIds: string[], orderId: string) {
    // Проверяем существование события
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Событие с ID ${eventId} не найдено`);
    }

    // Проверяем доступность мест
    const existingTickets = await this.prisma.ticket.findMany({
      where: {
        eventId,
        seatId: { in: seatIds },
        status: { in: ['RESERVED', 'PAID'] },
      },
    });

    if (existingTickets.length > 0) {
      const busySeats = existingTickets.map(t => t.seatId);
      throw new ConflictException(`Места ${busySeats.join(', ')} уже заняты`);
    }

    // Создаем билеты со статусом RESERVED
    const tickets = [];
    for (const seatId of seatIds) {
      const qrCodeData = uuidv4();
      
      const ticket = await this.prisma.ticket.create({
        data: {
          eventId,
          seatId,
          userId,
          orderId,
          price: event.minPrice, // TODO: реальная цена места
          status: TicketStatus.RESERVED,
          qrCode: qrCodeData,
        },
        include: {
          event: {
            select: {
              title: true,
              startDate: true,
              venue: true,
            },
          },
        },
      });

      tickets.push(ticket);
    }

    return tickets;
  }

  async confirmPayment(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException(`Билет с ID ${ticketId} не найден`);
    }

    if (ticket.status !== TicketStatus.RESERVED) {
      throw new BadRequestException(`Билет не в статусе резервирования`);
    }

    return this.prisma.ticket.update({
      where: { id: ticketId },
      data: { status: TicketStatus.PAID },
      include: {
        event: {
          select: {
            title: true,
            startDate: true,
            venue: true,
          },
        },
        seat: true,
      },
    });
  }

  async cancelTicket(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { event: true },
    });

    if (!ticket) {
      throw new NotFoundException(`Билет с ID ${ticketId} не найден`);
    }

    if (ticket.status === TicketStatus.USED || ticket.status === TicketStatus.CANCELLED) {
      throw new BadRequestException(`Нельзя отменить билет со статусом ${ticket.status}`);
    }

    return this.prisma.ticket.update({
      where: { id: ticketId },
      data: { status: TicketStatus.CANCELLED },
    });
  }

  async useTicket(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException(`Билет с ID ${ticketId} не найден`);
    }

    if (ticket.status !== TicketStatus.PAID) {
      throw new BadRequestException(`Только оплаченные билеты могут быть использованы`);
    }

    return this.prisma.ticket.update({
      where: { id: ticketId },
      data: { status: TicketStatus.USED },
    });
  }

  async getTicketByQRCode(qrCode: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { qrCode },
      include: {
        event: {
          select: {
            title: true,
            startDate: true,
            description: true,
            venue: {
              select: {
                name: true,
                address: true,
                city: true,
              },
            },
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        seat: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Билет с QR-кодом ${qrCode} не найден`);
    }

    return ticket;
  }

  async generateTicketQRCode(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException(`Билет с ID ${ticketId} не найден`);
    }

    const qrCodeDataUrl = await QRCode.toDataURL(ticket.qrCode);
    
    return {
      qrCode: qrCodeDataUrl,
      qrCodeText: ticket.qrCode,
    };
  }

  async getEventTickets(eventId: string, status?: TicketStatus) {
    const where: any = { eventId };
    if (status) {
      where.status = status;
    }

    return this.prisma.ticket.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        seat: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getTicketStats(eventId: string) {
    const [total, reserved, paid, cancelled, used] = await Promise.all([
      this.prisma.ticket.count({ where: { eventId } }),
      this.prisma.ticket.count({ where: { eventId, status: TicketStatus.RESERVED } }),
      this.prisma.ticket.count({ where: { eventId, status: TicketStatus.PAID } }),
      this.prisma.ticket.count({ where: { eventId, status: TicketStatus.CANCELLED } }),
      this.prisma.ticket.count({ where: { eventId, status: TicketStatus.USED } }),
    ]);

    const revenue = await this.prisma.ticket.aggregate({
      where: { eventId, status: TicketStatus.PAID },
      _sum: { price: true },
    });

    return {
      total,
      reserved,
      paid,
      cancelled,
      used,
      revenue: revenue._sum.price || 0,
      available: total - reserved - paid,
    };
  }
}
