package com.assetflow.booking.controller;

import com.assetflow.booking.dto.BookingResponse;
import com.assetflow.booking.dto.CreateBookingRequest;
import com.assetflow.booking.dto.UpdateBookingStatusRequest;
import com.assetflow.booking.service.BookingService;
import com.assetflow.common.dto.ApiResponse;
import com.assetflow.employee.entity.Employee;
import com.assetflow.security.CurrentUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody CreateBookingRequest request,
            @CurrentUser Employee employee) {
        BookingResponse response = bookingService.createBooking(request, employee.getId());
        return ResponseEntity.ok(ApiResponse.success("Booking created successfully", response));
    }

    @GetMapping("/my-bookings")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMyBookings(
            @CurrentUser Employee employee) {
        List<BookingResponse> responses = bookingService.getMyBookings(employee.getId());
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'ASSET_MANAGER')")
    public ResponseEntity<ApiResponse<BookingResponse>> updateBookingStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateBookingStatusRequest request) {
        BookingResponse response = bookingService.updateBookingStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("Booking status updated successfully", response));
    }
}
