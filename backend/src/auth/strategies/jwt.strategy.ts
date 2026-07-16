import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { EmployeeService } from '../../employee/employee.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private employeeService: EmployeeService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') ?? 'assetflow-secret',
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    const employee = await this.employeeService.findById(payload.sub);
    if (!employee || !employee.active) {
      throw new UnauthorizedException('User not found or inactive');
    }
    return employee;
  }
}
