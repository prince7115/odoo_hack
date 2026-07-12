package com.assetflow.maintenance.dto;

import com.assetflow.common.enums.MaintenancePriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateMaintenanceRequest {
    
    @NotNull(message = "Asset ID is required")
    private Long assetId;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Priority is required")
    private MaintenancePriority priority;
}
