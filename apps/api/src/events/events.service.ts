import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto, UpdateEventDto, FilterEventsDto } from './dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(createEventDto: CreateEventDto, organizerId: string) {
    return this.prisma.event.create({
      data: {
        ...createEventDto,
        organizerId,
      },
      include: {
        venue: true,
        categories: true,
      },
    });
  }

  async findAll(filters: FilterEventsDto) {
    const { search, city, categoryId, startDate, endDate, status, page = 1, limit = 20 } = filters;
    
    const where: any = {};
    
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }
    
    if (city) {
      where.venue = { city: { contains: city, mode: 'insensitive' } };
    }
    
    if (categoryId) {
      where.categories = { some: { id: categoryId } };
    }
    
    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) where.startDate.gte = new Date(startDate);
      if (endDate) where.startDate.lte = new Date(endDate);
    }
    
    if (status) {
      where.status = status;
    } else {
      where.status = { in: ['PUBLISHED'] }; // По умолчанию только опубликованные
    }

    const skip = (page - 1) * limit;
    
    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDate: 'asc' },
        include: {
          venue: true,
          categories: true,
          organizer: { select: { firstName: true, lastName: true } },
        },
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      data: events,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        venue: true,
        categories: true,
        tickets: {
          where: { status: 'RESERVED' },
          include: { seat: true },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`Событие с ID ${id} не найдено`);
    }

    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    await this.findOne(id); // Проверка существования
    
    return this.prisma.event.update({
      where: { id },
      data: updateEventDto,
      include: { venue: true, categories: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.event.delete({ where: { id } });
  }

  async getAnalytics(eventId: string) {
    const event = await this.findOne(eventId);
    
    const [totalTickets, soldTickets, revenue] = await Promise.all([
      this.prisma.ticket.count({ where: { eventId } }),
      this.prisma.ticket.count({ where: { eventId, status: 'PAID' } }),
      this.prisma.ticket.aggregate({
        where: { eventId, status: 'PAID' },
        _sum: { price: true },
      }),
    ]);

    return {
      views: 0, // TODO: добавить счетчик просмотров
      ticketsSold: soldTickets,
      totalTickets,
      revenue: revenue._sum.price || 0,
      conversionRate: totalTickets > 0 ? (soldTickets / totalTickets) * 100 : 0,
    };
  }
}
