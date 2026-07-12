package com.assetflow.booking.service;

import com.assetflow.asset.entity.Asset;
import com.assetflow.asset.repository.AssetRepository;
import com.assetflow.booking.dto.BookingResponse;
import com.assetflow.booking.dto.CreateBookingRequest;
import com.assetflow.booking.dto.UpdateBookingStatusRequest;
import com.assetflow.booking.entity.AssetBooking;
import com.assetflow.common.enums.BookingStatus;
import com.assetflow.booking.mapper.BookingMapper;
import com.assetflow.booking.repository.BookingRepository;
import com.assetflow.common.exception.BadRequestException;
import com.assetflow.common.exception.ConflictException;
import com.assetflow.common.exception.ResourceNotFoundException;
import com.assetflow.employee.entity.Employee;
import com.assetflow.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final AssetRepository assetRepository;
    private final EmployeeRepository employeeRepository;
    private final BookingMapper bookingMapper;

    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request, Long employeeId) {
        if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().isEqual(request.getEndTime())) {
            throw new BadRequestException("Start time must be before end time");
        }

        Asset asset = assetRepository.findById(request.getAssetId())
                .orElseThrow(() -> new ResourceNotFoundException("Asset", "id", request.getAssetId()));

        if (!asset.isBookable()) {
            throw new BadRequestException("Asset is not available for booking");
        }

        boolean hasOverlap = bookingRepository.existsOverlappingBooking(
                request.getAssetId(),
                request.getStartTime(),
                request.getEndTime(),
                List.of(BookingStatus.PENDING, BookingStatus.APPROVED)
        );

        if (hasOverlap) {
            throw new ConflictException("The asset is already booked for the requested time period");
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        AssetBooking booking = AssetBooking.builder()
                .asset(asset)
                .bookedBy(employee)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose())
                .status(BookingStatus.PENDING)
                .build();

        booking = bookingRepository.save(booking);

        return bookingMapper.toResponse(booking);
    }

    @Transactional
    public BookingResponse updateBookingStatus(Long bookingId, UpdateBookingStatusRequest request) {
        AssetBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        booking.setStatus(request.getStatus());
        booking = bookingRepository.save(booking);

        return bookingMapper.toResponse(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(Long employeeId) {
        return bookingRepository.findByBookedById(employeeId).stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());
    }
}
