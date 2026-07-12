package com.assetflow.asset.mapper;

import com.assetflow.asset.dto.AssetResponse;
import com.assetflow.asset.entity.Asset;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", builder = @org.mapstruct.Builder(disableBuilder = true))
public interface AssetMapper {

    @Mapping(source = "category.id", target = "categoryId")
    @Mapping(source = "category.name", target = "categoryName")
    @Mapping(source = "department.id", target = "departmentId")
    @Mapping(source = "department.name", target = "departmentName")
    AssetResponse toResponse(Asset asset);
}
