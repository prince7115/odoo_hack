package com.assetflow.assetcategory.repository;

import com.assetflow.assetcategory.entity.AssetCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssetCategoryRepository extends JpaRepository<AssetCategory, Long> {
    boolean existsByName(String name);
}
