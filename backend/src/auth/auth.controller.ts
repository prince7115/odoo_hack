import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { EmployeeService } from '../employee/employee.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiResponse } from '../common/dto/api-response.dto';
import type { EmployeeDocument } from '../employee/schemas/employee.schema';
import { IsEmail, IsString } from 'class-validator';
import { ApiTags } from '@nestjs/swagger';

class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private employeeService: EmployeeService,
    private configService: ConfigService,
  ) {}

  /**
   * Dev-mode login: looks up employee by email and returns a JWT.
   * Mirrors AuthController.java /api/auth/login
   */
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const employee = await this.employeeService.findByEmail(dto.email);
    if (!employee) {
      throw new UnauthorizedException(`No employee found with email: ${dto.email}`);
    }

    const token = this.authService.generateToken(employee);
    return ApiResponse.success('Login successful', {
      token,
      user: {
        id: String(employee._id),
        email: employee.email,
        name: employee.name,
        role: employee.role,
      },
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() employee: EmployeeDocument) {
    return ApiResponse.success('User info retrieved successfully', {
      id: String(employee._id),
      email: employee.email,
      name: employee.name,
      avatarUrl: employee.avatarUrl,
      role: employee.role,
      department: employee.department
        ? (employee.department as any).name ?? null
        : null,
      designation: employee.designation,
    });
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout() {
    return ApiResponse.success(
      'Logged out successfully. Please remove the token on the client side.',
    );
  }

  // ── Google OAuth2 ──────────────────────────────────────
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // Passport redirects to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Req() req: { user: EmployeeDocument }, @Res() res: Response) {
    const token = this.authService.generateToken(req.user);
    const frontendUrl = this.configService.get<string>('app.frontendUrl', 'http://localhost:5173');
    res.redirect(`${frontendUrl}/oauth2/callback?token=${token}`);
  }
}
