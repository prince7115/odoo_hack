package com.assetflow.asset.dto;

import com.assetflow.common.enums.AssetCondition;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAssetRequest {

    @NotBlank(message = "Name is required")
    private String name;
    
    private String description;
    
    @NotNull(message = "Category ID is required")
    private Long categoryId;
    
    private Long departmentId;
    
    private String serialNumber;
    
    private LocalDate purchaseDate;
    
    private BigDecimal purchaseCost;
    
    @NotNull(message = "Asset condition is required")
    private AssetCondition assetCondition;
    
    private String location;
    
    private String notes;
    
    private boolean bookable;
    
    private String photoUrl;
}
