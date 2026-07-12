package com.assetflow.booking.dto;

import com.assetflow.common.enums.BookingStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateBookingStatusRequest {
    
    @NotNull(message = "Status is required")
    private BookingStatus status;
}
