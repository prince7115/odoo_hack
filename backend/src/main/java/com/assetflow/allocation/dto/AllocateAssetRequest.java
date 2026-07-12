package com.assetflow.allocation.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AllocateAssetRequest {
    @NotNull(message = "Asset ID is required")
    private Long assetId;
    
    private Long employeeId;
    
    private Long departmentId;
    
    private String notes;
}
