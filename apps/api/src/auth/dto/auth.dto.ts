import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email адрес пользователя' })
  @IsEmail({}, { message: 'Некорректный email' })
  email: string;

  @ApiProperty({ example: 'password123', description: 'Пароль пользователя', minLength: 6, maxLength: 50 })
  @IsString()
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  @MaxLength(50, { message: 'Пароль не должен превышать 50 символов' })
  password: string;

  @ApiProperty({ example: 'Иван', description: 'Имя пользователя', minLength: 2, maxLength: 50 })
  @IsString()
  @MinLength(2, { message: 'Имя должно содержать минимум 2 символа' })
  @MaxLength(50, { message: 'Имя не должно превышать 50 символов' })
  firstName: string;

  @ApiProperty({ example: 'Иванов', description: 'Фамилия пользователя', minLength: 2, maxLength: 50 })
  @IsString()
  @MinLength(2, { message: 'Фамилия должна содержать минимум 2 символа' })
  @MaxLength(50, { message: 'Фамилия не должна превышать 50 символов' })
  lastName: string;

  @ApiProperty({ example: '+7 (999) 123-45-67', description: 'Номер телефона', required: false })
  @IsString()
  phone?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email адрес пользователя' })
  @IsEmail({}, { message: 'Некорректный email' })
  email: string;

  @ApiProperty({ example: 'password123', description: 'Пароль пользователя' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'Refresh токен для обновления access токена' })
  @IsString()
  refreshToken: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email адрес для сброса пароля' })
  @IsEmail({}, { message: 'Некорректный email' })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'abc123xyz', description: 'Токен сброса пароля из email' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'newpassword123', description: 'Новый пароль', minLength: 6, maxLength: 50 })
  @IsString()
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  newPassword: string;
}
