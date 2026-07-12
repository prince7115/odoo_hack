package com.assetflow.allocation.controller;

import com.assetflow.allocation.dto.AllocateAssetRequest;
import com.assetflow.allocation.dto.AllocationResponse;
import com.assetflow.allocation.dto.ReturnAssetRequest;
import com.assetflow.allocation.service.AllocationService;
import com.assetflow.common.dto.ApiResponse;
import com.assetflow.security.CurrentUser;
import com.assetflow.auth.dto.UserInfo;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/allocations")
@RequiredArgsConstructor
public class AllocationController {

    private final AllocationService allocationService;

    @PostMapping("/allocate")
    @PreAuthorize("hasAnyRole('ADMIN', 'ASSET_MANAGER')")
    public ResponseEntity<ApiResponse<AllocationResponse>> allocateAsset(
            @Valid @RequestBody AllocateAssetRequest request,
            @CurrentUser UserInfo currentUser) {
        AllocationResponse response = allocationService.allocateAsset(request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Asset allocated successfully", response));
    }

    @PostMapping("/{id}/return")
    @PreAuthorize("hasAnyRole('ADMIN', 'ASSET_MANAGER')")
    public ResponseEntity<ApiResponse<AllocationResponse>> returnAsset(
            @PathVariable Long id,
            @Valid @RequestBody ReturnAssetRequest request) {
        AllocationResponse response = allocationService.returnAsset(id, request);
        return ResponseEntity.ok(ApiResponse.success("Asset returned successfully", response));
    }

    @GetMapping("/my-allocations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<AllocationResponse>>> getMyAllocations(
            @CurrentUser UserInfo currentUser) {
        List<AllocationResponse> responses = allocationService.getEmployeeAllocations(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Employee allocations retrieved successfully", responses));
    }

    @GetMapping("/asset/{assetId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<AllocationResponse>>> getAssetHistory(
            @PathVariable Long assetId) {
        List<AllocationResponse> responses = allocationService.getAssetHistory(assetId);
        return ResponseEntity.ok(ApiResponse.success("Asset history retrieved successfully", responses));
    }
}
