import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { BookingService, CreateBookingDto, UpdateBookingDto } from './booking.service';
import { ApiResponse } from '../common/dto/api-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  async create(@Body() dto: CreateBookingDto, @CurrentUser() user: any) {
    // Auto-set bookedById from current user if not provided
    if (!dto.bookedById) dto.bookedById = String(user._id);
    const booking = await this.bookingService.create(dto);
    return ApiResponse.success('Booking created successfully', booking);
  }

  @Get()
  async findAll() {
    const bookings = await this.bookingService.findAll();
    return ApiResponse.success('Bookings fetched successfully', bookings);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const booking = await this.bookingService.findById(id);
    return ApiResponse.success('Booking fetched successfully', booking);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  async update(@Param('id') id: string, @Body() dto: UpdateBookingDto) {
    const booking = await this.bookingService.update(id, dto);
    return ApiResponse.success('Booking updated successfully', booking);
  }
}
