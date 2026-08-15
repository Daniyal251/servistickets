import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../auth/guards/roles.guard';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Получить список пользователей (ADMIN)' })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number, @Query('role') role?: Role) {
    return this.usersService.findAll(
      parseInt(page as any, 10) || 1,
      parseInt(limit as any, 10) || 20,
      role,
    );
  }

  @Get('me')
  @ApiOperation({ summary: 'Получить свой профиль' })
  getProfile(@Request() req: any) {
    return this.usersService.getProfile(req.user.sub);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Обновить свой профиль' })
  updateProfile(@Request() req: any, @Body() body: { firstName?: string; lastName?: string; phone?: string }) {
    return this.usersService.updateProfile(req.user.sub, body);
  }

  @Get('me/orders')
  @ApiOperation({ summary: 'Получить свои заказы' })
  getMyOrders(@Request() req: any, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.usersService.getUserOrders(
      req.user.sub,
      parseInt(page as any, 10) || 1,
      parseInt(limit as any, 10) || 10,
    );
  }

  @Get('me/tickets')
  @ApiOperation({ summary: 'Получить свои билеты' })
  getMyTickets(@Request() req: any, @Query('status') status?: string) {
    return this.usersService.getUserTickets(req.user.sub, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить пользователя по ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Изменить роль пользователя (ADMIN)' })
  updateRole(@Param('id') id: string, @Body() body: { role: Role }) {
    return this.usersService.updateRole(id, body.role);
  }
}
