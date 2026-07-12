package com.assetflow.assetcategory.entity;

import com.assetflow.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Builder;
import lombok.Setter;

@Entity
@Table(name = "asset_categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssetCategory extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    @Column(columnDefinition = "text")
    private String customFieldsJson; // Simple JSON string for custom attributes
}
