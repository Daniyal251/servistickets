// Общие типы для всего приложения

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'client' | 'organizer' | 'admin';

export interface Event {
  id: string;
  title: string;
  description: string;
  venue: Venue;
  startDate: Date;
  endDate: Date;
  status: EventStatus;
  organizerId: string;
  imageUrl?: string;
  categoryIds: string[];
  minPrice: number;
  maxPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';

export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  capacity: number;
  seatingChart?: SeatingChart;
}

export interface SeatingChart {
  rows: Row[];
}

export interface Row {
  id: string;
  name: string;
  seats: Seat[];
}

export interface Seat {
  id: string;
  number: string;
  status: SeatStatus;
  price: number;
}

export type SeatStatus = 'available' | 'reserved' | 'sold' | 'blocked';

export interface Ticket {
  id: string;
  eventId: string;
  seatId: string;
  userId: string;
  orderId: string;
  price: number;
  status: TicketStatus;
  qrCode: string;
  createdAt: Date;
}

export type TicketStatus = 'reserved' | 'paid' | 'cancelled' | 'used';

export interface Order {
  id: string;
  userId: string;
  tickets: Ticket[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'refunded';

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
}

export interface Analytics {
  views: number;
  ticketsSold: number;
  revenue: number;
  conversionRate: number;
}
