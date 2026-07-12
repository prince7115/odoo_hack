package com.assetflow.allocation.service;

import com.assetflow.allocation.dto.AllocateAssetRequest;
import com.assetflow.allocation.dto.AllocationResponse;
import com.assetflow.allocation.dto.ReturnAssetRequest;
import com.assetflow.common.enums.AllocationStatus;
import com.assetflow.allocation.entity.AssetAllocation;
import com.assetflow.allocation.mapper.AllocationMapper;
import com.assetflow.allocation.repository.AllocationRepository;
import com.assetflow.asset.entity.Asset;
import com.assetflow.common.enums.AssetStatus;
import com.assetflow.asset.repository.AssetRepository;
import com.assetflow.common.exception.ConflictException;
import com.assetflow.common.exception.ResourceNotFoundException;
import com.assetflow.department.entity.Department;
import com.assetflow.department.repository.DepartmentRepository;
import com.assetflow.employee.entity.Employee;
import com.assetflow.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AllocationService {

    private final AllocationRepository allocationRepository;
    private final AssetRepository assetRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final AllocationMapper allocationMapper;

    @Transactional
    public AllocationResponse allocateAsset(AllocateAssetRequest request, Long allocatedById) {
        Asset asset = assetRepository.findById(request.getAssetId())
                .orElseThrow(() -> new ResourceNotFoundException("Asset", "id", request.getAssetId()));

        if (asset.getStatus() != AssetStatus.AVAILABLE) {
            throw new ConflictException("Asset is not available for allocation");
        }

        Employee allocatedBy = employeeRepository.findById(allocatedById)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", allocatedById));

        AssetAllocation.AssetAllocationBuilder builder = AssetAllocation.builder()
                .asset(asset)
                .allocatedBy(allocatedBy)
                .allocationDate(LocalDate.now())
                .status(AllocationStatus.ACTIVE)
                .notes(request.getNotes());

        if (request.getEmployeeId() != null) {
            Employee allocatedTo = employeeRepository.findById(request.getEmployeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.getEmployeeId()));
            builder.allocatedTo(allocatedTo);
        }

        if (request.getDepartmentId() != null) {
            Department allocatedToDept = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", "id", request.getDepartmentId()));
            builder.allocatedToDept(allocatedToDept);
        }

        asset.setStatus(AssetStatus.ALLOCATED);
        assetRepository.save(asset);

        AssetAllocation allocation = allocationRepository.save(builder.build());
        return allocationMapper.toResponse(allocation);
    }

    @Transactional
    public AllocationResponse returnAsset(Long allocationId, ReturnAssetRequest request) {
        AssetAllocation allocation = allocationRepository.findById(allocationId)
                .orElseThrow(() -> new ResourceNotFoundException("AssetAllocation", "id", allocationId));

        if (allocation.getStatus() == AllocationStatus.RETURNED) {
            throw new ConflictException("Asset is already returned");
        }

        allocation.setReturnDate(LocalDate.now());
        allocation.setStatus(AllocationStatus.RETURNED);
        allocation.setNotes(allocation.getNotes() + (request.getReturnNotes() != null ? "\nReturn notes: " + request.getReturnNotes() : ""));

        Asset asset = allocation.getAsset();
        asset.setStatus(AssetStatus.AVAILABLE);
        
        if (request.getAssetCondition() != null) {
            asset.setAssetCondition(request.getAssetCondition());
        }
        
        assetRepository.save(asset);
        allocation = allocationRepository.save(allocation);

        return allocationMapper.toResponse(allocation);
    }

    @Transactional(readOnly = true)
    public List<AllocationResponse> getEmployeeAllocations(Long employeeId) {
        return allocationRepository.findByAllocatedToIdAndStatus(employeeId, AllocationStatus.ACTIVE)
                .stream()
                .map(allocationMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AllocationResponse> getAssetHistory(Long assetId) {
        return allocationRepository.findByAssetIdOrderByAllocationDateDesc(assetId)
                .stream()
                .map(allocationMapper::toResponse)
                .collect(Collectors.toList());
    }
}
