package com.assetflow.allocation.repository;

import com.assetflow.common.enums.AllocationStatus;
import com.assetflow.allocation.entity.AssetAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AllocationRepository extends JpaRepository<AssetAllocation, Long> {
    List<AssetAllocation> findByAssetIdOrderByAllocationDateDesc(Long assetId);
    List<AssetAllocation> findByAllocatedToIdAndStatus(Long employeeId, AllocationStatus status);
}
