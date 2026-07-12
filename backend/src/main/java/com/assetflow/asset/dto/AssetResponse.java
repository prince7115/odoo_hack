package com.assetflow.asset.dto;

import com.assetflow.common.enums.AssetCondition;
import com.assetflow.common.enums.AssetStatus;
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
public class AssetResponse {
    private Long id;
    private String assetTag;
    private String name;
    private String description;
    
    private Long categoryId;
    private String categoryName;
    
    private Long departmentId;
    private String departmentName;
    
    private String serialNumber;
    
    private LocalDate purchaseDate;
    private BigDecimal purchaseCost;
    
    private AssetStatus status;
    private AssetCondition assetCondition;
    
    private String location;
    private String notes;
    private boolean bookable;
    private String photoUrl;
}
