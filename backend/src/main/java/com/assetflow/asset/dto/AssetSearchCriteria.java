package com.assetflow.asset.dto;

import com.assetflow.asset.entity.AssetStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetSearchCriteria {
    private String search;
    private Long categoryId;
    private Long departmentId;
    private AssetStatus status;
    private Boolean bookable;
}
