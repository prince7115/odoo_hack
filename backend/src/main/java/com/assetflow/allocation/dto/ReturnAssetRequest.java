package com.assetflow.allocation.dto;

import com.assetflow.asset.entity.AssetCondition;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReturnAssetRequest {
    private String returnNotes;
    private AssetCondition assetCondition;
}
