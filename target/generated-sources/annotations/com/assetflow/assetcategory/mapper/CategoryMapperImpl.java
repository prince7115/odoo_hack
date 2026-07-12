package com.assetflow.assetcategory.mapper;

import com.assetflow.assetcategory.dto.CategoryResponse;
import com.assetflow.assetcategory.dto.CreateCategoryRequest;
import com.assetflow.assetcategory.dto.UpdateCategoryRequest;
import com.assetflow.assetcategory.entity.AssetCategory;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-07-12T11:16:20+0530",
    comments = "version: 1.6.3, compiler: javac, environment: Java 23 (Oracle Corporation)"
)
@Component
public class CategoryMapperImpl implements CategoryMapper {

    @Override
    public AssetCategory toEntity(CreateCategoryRequest request) {
        if ( request == null ) {
            return null;
        }

        AssetCategory assetCategory = new AssetCategory();

        assetCategory.setName( request.getName() );
        assetCategory.setDescription( request.getDescription() );
        assetCategory.setCustomFieldsJson( request.getCustomFieldsJson() );

        return assetCategory;
    }

    @Override
    public CategoryResponse toResponse(AssetCategory entity) {
        if ( entity == null ) {
            return null;
        }

        CategoryResponse categoryResponse = new CategoryResponse();

        categoryResponse.setId( entity.getId() );
        categoryResponse.setName( entity.getName() );
        categoryResponse.setDescription( entity.getDescription() );
        categoryResponse.setCustomFieldsJson( entity.getCustomFieldsJson() );
        categoryResponse.setCreatedAt( entity.getCreatedAt() );
        categoryResponse.setUpdatedAt( entity.getUpdatedAt() );

        return categoryResponse;
    }

    @Override
    public void updateEntityFromRequest(UpdateCategoryRequest request, AssetCategory entity) {
        if ( request == null ) {
            return;
        }

        entity.setName( request.getName() );
        entity.setDescription( request.getDescription() );
        entity.setCustomFieldsJson( request.getCustomFieldsJson() );
    }
}
