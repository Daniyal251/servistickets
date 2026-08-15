import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, ticketIds: string[]) {
    // Проверяем существование билетов
    const tickets = await this.prisma.ticket.findMany({
      where: { id: { in: ticketIds } },
      include: { event: true },
    });

    if (tickets.length !== ticketIds.length) {
      throw new NotFoundException('Один или несколько билетов не найдены');
    }

    // Проверяем, что все билеты принадлежат пользователю и зарезервированы
    const invalidTickets = tickets.filter(
      t => t.userId !== userId || t.status !== 'RESERVED',
    );

    if (invalidTickets.length > 0) {
      throw new BadRequestException('Некоторые билеты недоступны для оплаты');
    }

    // Рассчитываем общую сумму
    const totalAmount = tickets.reduce((sum, ticket) => sum + ticket.price, 0);

    // Создаем заказ
    const order = await this.prisma.order.create({
      data: {
        userId,
        totalAmount,
        status: OrderStatus.PENDING,
      },
      include: {
        tickets: {
          include: {
            event: {
              select: {
                title: true,
                startDate: true,
                venue: true,
              },
            },
          },
        },
      },
    });

    return order;
  }

  async findOne(id: string, userId?: string) {
    const where: any = { id };
    if (userId) {
      where.userId = userId;
    }

    const order = await this.prisma.order.findUnique({
      where,
      include: {
        tickets: {
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
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Заказ с ID ${id} не найден`);
    }

    return order;
  }

  async findAll(userId: string, page = 1, limit = 10, status?: OrderStatus) {
    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          tickets: {
            include: {
              event: {
                select: {
                  title: true,
                  startDate: true,
                  imageUrl: true,
                  venue: { select: { name: true, city: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async confirmPayment(orderId: string, paymentMethod?: string) {
    const order = await this.findOne(orderId);

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(`Заказ уже имеет статус ${order.status}`);
    }

    // Обновляем статус заказа и всех билетов
    const [updatedOrder] = await this.prisma.$transaction([
      this.prisma.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.PAID,
          paymentMethod,
        },
      }),
      this.prisma.ticket.updateMany({
        where: { orderId },
        data: { status: 'PAID' },
      }),
    ]);

    return updatedOrder;
  }

  async cancelOrder(orderId: string) {
    const order = await this.findOne(orderId);

    if (order.status === OrderStatus.PAID || order.status === OrderStatus.REFUNDED) {
      throw new BadRequestException(`Нельзя отменить заказ со статусом ${order.status}`);
    }

    // Отменяем заказ и все билеты
    const [updatedOrder] = await this.prisma.$transaction([
      this.prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED },
      }),
      this.prisma.ticket.updateMany({
        where: { orderId },
        data: { status: 'CANCELLED' },
      }),
    ]);

    return updatedOrder;
  }

  async refundOrder(orderId: string) {
    const order = await this.findOne(orderId);

    if (order.status !== OrderStatus.PAID) {
      throw new BadRequestException(`Можно вернуть только оплаченный заказ`);
    }

    // Возвращаем деньги и отменяем билеты
    const [updatedOrder] = await this.prisma.$transaction([
      this.prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.REFUNDED },
      }),
      this.prisma.ticket.updateMany({
        where: { orderId },
        data: { status: 'CANCELLED' },
      }),
    ]);

    return updatedOrder;
  }

  async getOrderStats(userId: string) {
    const [totalOrders, pendingOrders, paidOrders, cancelledOrders, totalSpent] = await Promise.all([
      this.prisma.order.count({ where: { userId } }),
      this.prisma.order.count({ where: { userId, status: OrderStatus.PENDING } }),
      this.prisma.order.count({ where: { userId, status: OrderStatus.PAID } }),
      this.prisma.order.count({ where: { userId, status: OrderStatus.CANCELLED } }),
      this.prisma.order.aggregate({
        where: { userId, status: OrderStatus.PAID },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      totalOrders,
      pendingOrders,
      paidOrders,
      cancelledOrders,
      totalSpent: totalSpent._sum.totalAmount || 0,
    };
  }
}
