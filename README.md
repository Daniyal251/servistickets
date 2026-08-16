# FairTicket - Сервис продажи билетов

🎯 **Современная платформа для покупки и продажи билетов на мероприятия**

Разработано с учетом лучших мировых практик (Ticketmaster, Eventbrite, Dice) и устраняющее ключевые недостатки конкурентов.

## ✨ Ключевые преимущества

- ✅ **Прозрачное ценообразование** — никаких скрытых комиссий
- ✅ **Мгновенный возврат** — автоматизированная система refunds
- ✅ **Защита от ботов** — queue system + rate limiting
- ✅ **Mobile-first дизайн** — оптимизировано для смартфонов
- ✅ **P2P биржа билетов** — безопасная перепродажа по face value
- ✅ **Real-time обновления** — WebSocket для актуальных данных
- ✅ **2000+ concurrent пользователей** — масштабируемая архитектура

## 🚀 Быстрый старт

### Требования
- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Docker >= 24.0.0

### Установка и запуск
```bash
# Установка зависимостей
pnpm install

# Запуск инфраструктуры (PostgreSQL, Redis, PgBouncer, NGINX)
pnpm docker:up

# Миграция базы данных
pnpm db:migrate

# Режим разработки
pnpm dev

# Production сборка
pnpm build && pnpm start
```

**Порты:**
- API: http://localhost:3000
- Swagger: http://localhost:3000/api/docs
- Client Web: http://localhost:3001
- Organizer Panel: http://localhost:3002
- Admin Dashboard: http://localhost:3003

## 📁 Структура проекта (Monorepo)

```
/workspace
├── apps/
│   ├── api/                  # Backend (NestJS + Prisma)
│   ├── client-web/           # Клиентское приложение (Next.js 14)
│   ├── organizer-panel/      # Панель организатора (React+Vite)
│   └── admin-dashboard/      # Админ-панель (React+Vite)
├── packages/
│   ├── ui-kit/               # Общая UI библиотека компонентов
│   ├── shared-types/         # Общие TypeScript типы
│   ├── eslint-config/        # ESLint конфигурация
│   └── tsconfig/             # TypeScript конфигурации
├── infra/
│   ├── docker/               # Docker Compose (БД, Redis, NGINX)
│   ├── nginx/                # NGINX конфигурация (rate limiting, LB)
│   └── k8s/                  # Kubernetes манифесты
├── MASTER_PLAN.md            # Детальный план разработки (32 этапа)
├── ARCHITECTURE.md           # Архитектурные решения
├── README.md                 # Этот файл
└── turbo.json                # Turborepo конфигурация
```

## 🏗 Архитектура

```
┌─────────────────────────────────────────────────────────┐
│                     NGINX (Load Balancer)                │
│              Rate Limiting: 20r/s (API), 5r/s (Auth)     │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐ ┌───────▼────────┐ ┌───────▼────────┐
│   Client Web   │ │ Organizer Panel│ │  Admin Dashboard│
│   (Next.js 14) │ │   (React+Vite) │ │   (React+Vite)  │
│   Port: 3001   │ │   Port: 3002   │ │   Port: 3003    │
└────────────────┘ └────────────────┘ └────────────────┘
                            │
                    ┌───────▼────────┐
                    │   NestJS API   │
                    │   Port: 3000   │
                    │   (3 replicas) │
                    └────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐ ┌───────▼────────┐ ┌───────▼────────┐
│   PostgreSQL   │ │     Redis      │ │   PgBouncer    │
│   (Primary DB) │ │  (Cache+Queue) │ │ (Connection Pool)│
│   Port: 5432   │ │   Port: 6379   │ │   Port: 6432   │
└────────────────┘ └────────────────┘ └────────────────┘
```

## 👥 Роли пользователей

### 1. Клиент (CLIENT)
Поиск и покупка билетов, управление заказами, возврат, P2P перепродажа, отзывы.

### 2. Организатор (ORGANIZER)
Создание мероприятий, управление ценами, схема зала, аналитика продаж, сканирование билетов.

### 3. Администратор (ADMIN)
Модерация событий, управление пользователями, финансовая отчетность, настройка комиссий.

### 4. Сотрудник поддержки (SUPPORT)
Обработка возвратов, консультации пользователей, работа с претензиями.

## 🔧 Технологический стек

### Backend
- **NestJS** — модульный серверный фреймворк
- **Prisma** — типобезопасная ORM
- **PostgreSQL 16** — реляционная база данных
- **Redis 7 + BullMQ** — очереди задач и кэширование
- **PgBouncer** — connection pooling (1000 conn)
- **JWT** — аутентификация (access + refresh tokens)
- **Swagger** — API документация

### Frontend
- **Next.js 14** — React фреймворк с SSR/ISR (client-web)
- **React 18 + Vite** — для панелей организатора и админа
- **Tailwind CSS** — утилитарные стили
- **Zustand** — state management
- **TanStack Query** — работа с серверным состоянием
- **Framer Motion** — анимации

### Инфраструктура
- **Docker + Docker Compose** — контейнеризация
- **NGINX** — reverse proxy, load balancing, rate limiting
- **Kubernetes** — оркестрация (опционально)
- **Prometheus + Grafana** — мониторинг (roadmap)

## 🔒 Безопасность

- Rate Limiting (защита от DDoS и brute-force)
- JWT Tokens (access + refresh)
- Role-based Access Control (RBAC)
- Input Validation (class-validator)
- SQL Injection Protection (Prisma ORM)
- XSS Protection
- CORS Policy
- HTTPS Required
- Audit Logging

## 📈 Производительность

### Целевые показатели
- **2000+ concurrent пользователей**
- **Response time < 200ms** (p95)
- **99.9% uptime**
- **Horizontal scaling** — автодобавление реплик API

### Оптимизации
- Database Connection Pooling (PgBouncer)
- Redis Caching (события, пользователи, сессии)
- CDN для статики и изображений
- Lazy Loading компонентов
- Image Optimization (WebP)
- Database Indexing

## 💳 Платежные интеграции

### Россия
- ЮKassa (карты, SBP, кошельки)
- CloudPayments (рекуррентные платежи)
- Тинькофф Касса

### Международные
- Stripe
- PayPal

## 🧪 Тестирование

```bash
# Unit тесты
pnpm test

# E2E тесты (Playwright)
pnpm test:e2e

# Load тесты (k6)
pnpm test:load
```

## 📝 Документация

- [MASTER_PLAN.md](./MASTER_PLAN.md) — Детальный план разработки (32 этапа)
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Архитектурные решения
- [API Docs](http://localhost:3000/api/docs) — Swagger документация

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменений (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📞 Контакты

- **Email**: support@fairticket.local
- **GitHub Issues**: [Сообщить об ошибке](https://github.com/fairticket/issues)

---

**FairTicket** © 2024. Построено с использованием современных технологий для лучшего пользовательского опыта.
Лицензия: MIT
