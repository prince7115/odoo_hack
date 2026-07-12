package com.assetflow.asset.mapper;

import com.assetflow.asset.dto.AssetResponse;
import com.assetflow.asset.entity.Asset;
import com.assetflow.assetcategory.entity.AssetCategory;
import com.assetflow.department.entity.Department;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-07-12T11:16:20+0530",
    comments = "version: 1.6.3, compiler: javac, environment: Java 23 (Oracle Corporation)"
)
@Component
public class AssetMapperImpl implements AssetMapper {

    @Override
    public AssetResponse toResponse(Asset asset) {
        if ( asset == null ) {
            return null;
        }

        AssetResponse assetResponse = new AssetResponse();

        assetResponse.setCategoryId( assetCategoryId( asset ) );
        assetResponse.setCategoryName( assetCategoryName( asset ) );
        assetResponse.setDepartmentId( assetDepartmentId( asset ) );
        assetResponse.setDepartmentName( assetDepartmentName( asset ) );
        assetResponse.setId( asset.getId() );
        assetResponse.setAssetTag( asset.getAssetTag() );
        assetResponse.setName( asset.getName() );
        assetResponse.setDescription( asset.getDescription() );
        assetResponse.setSerialNumber( asset.getSerialNumber() );
        assetResponse.setPurchaseDate( asset.getPurchaseDate() );
        assetResponse.setPurchaseCost( asset.getPurchaseCost() );
        assetResponse.setStatus( asset.getStatus() );
        assetResponse.setAssetCondition( asset.getAssetCondition() );
        assetResponse.setLocation( asset.getLocation() );
        assetResponse.setNotes( asset.getNotes() );
        assetResponse.setBookable( asset.isBookable() );
        assetResponse.setPhotoUrl( asset.getPhotoUrl() );

        return assetResponse;
    }

    private Long assetCategoryId(Asset asset) {
        AssetCategory category = asset.getCategory();
        if ( category == null ) {
            return null;
        }
        return category.getId();
    }

    private String assetCategoryName(Asset asset) {
        AssetCategory category = asset.getCategory();
        if ( category == null ) {
            return null;
        }
        return category.getName();
    }

    private Long assetDepartmentId(Asset asset) {
        Department department = asset.getDepartment();
        if ( department == null ) {
            return null;
        }
        return department.getId();
    }

    private String assetDepartmentName(Asset asset) {
        Department department = asset.getDepartment();
        if ( department == null ) {
            return null;
        }
        return department.getName();
    }
}
