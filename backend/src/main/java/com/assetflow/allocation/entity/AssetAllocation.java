package com.assetflow.allocation.entity;

import com.assetflow.asset.entity.Asset;
import com.assetflow.common.entity.BaseEntity;
import com.assetflow.department.entity.Department;
import com.assetflow.employee.entity.Employee;
import com.assetflow.common.enums.AllocationStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "asset_allocations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssetAllocation extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "allocated_to_employee_id")
    private Employee allocatedTo;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "allocated_to_department_id")
    private Department allocatedToDept;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "allocated_by_id", nullable = false)
    private Employee allocatedBy;
    
    @Column(nullable = false)
    private LocalDate allocationDate;
    
    private LocalDate returnDate;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AllocationStatus status; // ACTIVE, RETURNED
    
    private String notes;
}
