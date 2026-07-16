import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { EmployeeService } from '../../employee/employee.service';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    configService: ConfigService,
    private employeeService: EmployeeService,
  ) {
    super({
      clientID: configService.get<string>('google.clientId') ?? '',
      clientSecret: configService.get<string>('google.clientSecret') ?? '',
      callbackURL: configService.get<string>('google.callbackUrl') ?? '',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: {
      id: string;
      emails: { value: string }[];
      displayName: string;
      photos: { value: string }[];
    },
    done: VerifyCallback,
  ): Promise<void> {
    const email = profile.emails[0].value;
    const googleId = profile.id;
    const name = profile.displayName;
    const picture = profile.photos[0]?.value;

    let employee = await this.employeeService.findByEmail(email);

    if (employee) {
      // Update changed fields
      const updates: Record<string, unknown> = {};
      if (name && name !== employee.name) updates.name = name;
      if (picture && picture !== employee.avatarUrl) updates.avatarUrl = picture;
      if (googleId && googleId !== employee.googleId) updates.googleId = googleId;
      if (Object.keys(updates).length > 0) {
        employee = await this.employeeService.update(String(employee._id), updates as any);
      }
    } else {
      // Create new employee
      employee = await this.employeeService.create({
        email,
        name: name ?? 'Unknown',
        role: Role.EMPLOYEE,
      });
      // Manually set googleId and avatarUrl
      employee = await this.employeeService.update(String(employee._id), {
        name: name ?? 'Unknown',
      } as any);
    }

    done(null, employee);
  }
}
