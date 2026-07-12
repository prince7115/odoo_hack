package com.assetflow.maintenance.service;

import com.assetflow.asset.entity.Asset;
import com.assetflow.asset.repository.AssetRepository;
import com.assetflow.common.enums.AssetStatus;
import com.assetflow.common.enums.MaintenanceStatus;
import com.assetflow.common.exception.ResourceNotFoundException;
import com.assetflow.employee.entity.Employee;
import com.assetflow.employee.repository.EmployeeRepository;
import com.assetflow.maintenance.dto.CompleteMaintenanceRequest;
import com.assetflow.maintenance.dto.CreateMaintenanceRequest;
import com.assetflow.maintenance.dto.MaintenanceResponse;
import com.assetflow.maintenance.entity.MaintenanceRequest;
import com.assetflow.maintenance.mapper.MaintenanceMapper;
import com.assetflow.maintenance.repository.MaintenanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;
    private final AssetRepository assetRepository;
    private final EmployeeRepository employeeRepository;
    private final MaintenanceMapper maintenanceMapper;

    @Transactional
    public MaintenanceResponse createRequest(CreateMaintenanceRequest request, Long employeeId) {
        Asset asset = assetRepository.findById(request.getAssetId())
                .orElseThrow(() -> new ResourceNotFoundException("Asset", "id", request.getAssetId()));

        Employee requestedBy = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        MaintenanceRequest maintenanceRequest = MaintenanceRequest.builder()
                .asset(asset)
                .requestedBy(requestedBy)
                .description(request.getDescription())
                .priority(request.getPriority())
                .status(MaintenanceStatus.PENDING)
                .build();

        maintenanceRequest = maintenanceRepository.save(maintenanceRequest);
        return maintenanceMapper.toDto(maintenanceRequest);
    }

    @Transactional
    public MaintenanceResponse approveRequest(Long id, Long adminId) {
        MaintenanceRequest request = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRequest", "id", id));

        Employee admin = employeeRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", adminId));

        request.setStatus(MaintenanceStatus.APPROVED);
        request.setApprovedBy(admin);

        Asset asset = request.getAsset();
        asset.setStatus(AssetStatus.UNDER_MAINTENANCE);
        assetRepository.save(asset);

        request = maintenanceRepository.save(request);
        return maintenanceMapper.toDto(request);
    }

    @Transactional
    public MaintenanceResponse completeRequest(Long id, CompleteMaintenanceRequest completeRequest) {
        MaintenanceRequest request = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRequest", "id", id));

        request.setStatus(MaintenanceStatus.COMPLETED);
        request.setCompletedAt(LocalDateTime.now());
        request.setCost(completeRequest.getCost());
        request.setNotes(completeRequest.getNotes());

        Asset asset = request.getAsset();
        asset.setStatus(AssetStatus.AVAILABLE);
        assetRepository.save(asset);

        request = maintenanceRepository.save(request);
        return maintenanceMapper.toDto(request);
    }

    @Transactional
    public MaintenanceResponse rejectRequest(Long id) {
        MaintenanceRequest request = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRequest", "id", id));

        request.setStatus(MaintenanceStatus.REJECTED);
        request = maintenanceRepository.save(request);
        return maintenanceMapper.toDto(request);
    }

    @Transactional(readOnly = true)
    public List<MaintenanceResponse> getAllRequests() {
        return maintenanceRepository.findAll().stream()
                .map(maintenanceMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MaintenanceResponse> getMyRequests(Long employeeId) {
        return maintenanceRepository.findByRequestedById(employeeId).stream()
                .map(maintenanceMapper::toDto)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public MaintenanceResponse getRequestById(Long id) {
        return maintenanceRepository.findById(id)
                .map(maintenanceMapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRequest", "id", id));
    }
}
