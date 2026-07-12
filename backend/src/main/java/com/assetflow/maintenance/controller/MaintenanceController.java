package com.assetflow.maintenance.controller;

import com.assetflow.auth.dto.UserInfo;
import com.assetflow.common.dto.ApiResponse;
import com.assetflow.maintenance.dto.CompleteMaintenanceRequest;
import com.assetflow.maintenance.dto.CreateMaintenanceRequest;
import com.assetflow.maintenance.dto.MaintenanceResponse;
import com.assetflow.maintenance.service.MaintenanceService;
import com.assetflow.security.CurrentUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<MaintenanceResponse>> createRequest(
            @Valid @RequestBody CreateMaintenanceRequest request,
            @CurrentUser UserInfo userInfo) {
        MaintenanceResponse response = maintenanceService.createRequest(request, userInfo.getId());
        return ResponseEntity.ok(ApiResponse.success("Maintenance request created successfully", response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ASSET_MANAGER')")
    public ResponseEntity<ApiResponse<List<MaintenanceResponse>>> getAllRequests() {
        List<MaintenanceResponse> response = maintenanceService.getAllRequests();
        return ResponseEntity.ok(ApiResponse.success("Maintenance requests retrieved successfully", response));
    }
    
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<MaintenanceResponse>>> getMyRequests(
            @CurrentUser UserInfo userInfo) {
        List<MaintenanceResponse> response = maintenanceService.getMyRequests(userInfo.getId());
        return ResponseEntity.ok(ApiResponse.success("My maintenance requests retrieved successfully", response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<MaintenanceResponse>> getRequest(
            @PathVariable Long id) {
        MaintenanceResponse response = maintenanceService.getRequestById(id);
        return ResponseEntity.ok(ApiResponse.success("Maintenance request retrieved successfully", response));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MaintenanceResponse>> approveRequest(
            @PathVariable Long id,
            @CurrentUser UserInfo userInfo) {
        MaintenanceResponse response = maintenanceService.approveRequest(id, userInfo.getId());
        return ResponseEntity.ok(ApiResponse.success("Maintenance request approved successfully", response));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MaintenanceResponse>> rejectRequest(
            @PathVariable Long id) {
        MaintenanceResponse response = maintenanceService.rejectRequest(id);
        return ResponseEntity.ok(ApiResponse.success("Maintenance request rejected successfully", response));
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MaintenanceResponse>> completeRequest(
            @PathVariable Long id,
            @Valid @RequestBody CompleteMaintenanceRequest request) {
        MaintenanceResponse response = maintenanceService.completeRequest(id, request);
        return ResponseEntity.ok(ApiResponse.success("Maintenance request completed successfully", response));
    }
}
