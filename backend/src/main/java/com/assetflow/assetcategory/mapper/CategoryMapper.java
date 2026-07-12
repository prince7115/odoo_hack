package com.assetflow.assetcategory.mapper;

import com.assetflow.assetcategory.dto.CategoryResponse;
import com.assetflow.assetcategory.dto.CreateCategoryRequest;
import com.assetflow.assetcategory.dto.UpdateCategoryRequest;
import com.assetflow.assetcategory.entity.AssetCategory;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", builder = @org.mapstruct.Builder(disableBuilder = true))
public interface CategoryMapper {
    AssetCategory toEntity(CreateCategoryRequest request);
    
    CategoryResponse toResponse(AssetCategory entity);
    
    void updateEntityFromRequest(UpdateCategoryRequest request, @MappingTarget AssetCategory entity);
}
