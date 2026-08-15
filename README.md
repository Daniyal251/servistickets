# Ticket Service - Сервис продажи билетов

Высоконагруженная платформа для продажи билетов с поддержкой 2000+ concurrent пользователей.

## Структура проекта

```
/workspace
├── apps/
│   ├── client-web/          # Next.js для клиентов
│   ├── organizer-web/       # Next.js для организаторов
│   ├── admin-web/           # Next.js для сотрудников
│   └── api/                 # NestJS backend API
├── packages/
│   ├── ui/                  # Shared UI компоненты
│   ├── utils/               # Общие утилиты
│   ├── types/               # Общие TypeScript типы
│   └── config/              # Конфигурация
├── infra/
│   ├── docker/
│   └── k8s/
├── docs/
└── scripts/
```

## Стек технологий

### Frontend
- Next.js 14+, TypeScript, Tailwind CSS, shadcn/ui

### Backend  
- NestJS, PostgreSQL, Redis, Prisma, BullMQ

## Архитектурные решения для 2000+ пользователей

1. Rate limiting (100 запросов/мин на IP)
2. Redis кэширование
3. Очереди BullMQ
4. Connection pooling (PgBouncer)
5. Load balancing через NGINX

## Запуск

```bash
pnpm install
pnpm dev
```

API: http://localhost:4000
Swagger: http://localhost:4000/api/docs
