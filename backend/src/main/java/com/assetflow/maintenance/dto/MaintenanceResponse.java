package com.assetflow.maintenance.dto;

import com.assetflow.common.enums.MaintenancePriority;
import com.assetflow.common.enums.MaintenanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceResponse {
    private Long id;
    private Long assetId;
    private String assetName;
    private Long requestedById;
    private String requestedByName;
    private String description;
    private MaintenancePriority priority;
    private MaintenanceStatus status;
    private Long approvedById;
    private String approvedByName;
    private LocalDateTime completedAt;
    private BigDecimal cost;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
