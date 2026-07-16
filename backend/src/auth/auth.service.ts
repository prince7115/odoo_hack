import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmployeeDocument } from '../employee/schemas/employee.schema';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: NestJwtService,
    private configService: ConfigService,
  ) {}

  generateToken(employee: EmployeeDocument): string {
    const payload = {
      sub: String(employee._id),
      email: employee.email,
      name: employee.name,
      role: employee.role,
    };
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get<number>('jwt.expirationMs', 86400000) / 1000,
    });
  }
}
