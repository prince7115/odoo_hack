package com.assetflow.asset.entity;

import com.assetflow.common.entity.BaseEntity;
import com.assetflow.common.enums.AssetCondition;
import com.assetflow.common.enums.AssetStatus;
import com.assetflow.assetcategory.entity.AssetCategory;
import com.assetflow.department.entity.Department;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "assets")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Asset extends BaseEntity {

    @Column(unique = true, nullable = false)
    private String assetTag;
    
    @Column(nullable = false)
    private String name;
    
    private String description;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private AssetCategory category;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;
    
    @Column(unique = true)
    private String serialNumber;
    
    private LocalDate purchaseDate;
    
    private BigDecimal purchaseCost;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssetStatus status; // AVAILABLE, ALLOCATED, UNDER_MAINTENANCE, DISPOSED
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssetCondition assetCondition; // NEW, GOOD, FAIR, POOR, DAMAGED
    
    private String location;
    
    private String notes;
    
    private boolean bookable;
    
    private String photoUrl;
}
