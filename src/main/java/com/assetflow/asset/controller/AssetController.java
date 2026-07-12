package com.assetflow.asset.controller;

import com.assetflow.asset.dto.AssetResponse;
import com.assetflow.asset.dto.AssetSearchCriteria;
import com.assetflow.asset.dto.CreateAssetRequest;
import com.assetflow.asset.dto.UpdateAssetRequest;
import com.assetflow.asset.entity.AssetStatus;
import com.assetflow.asset.service.AssetService;
import com.assetflow.common.dto.ApiResponse;
import com.assetflow.common.dto.PagedResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ASSET_MANAGER')")
    public ResponseEntity<ApiResponse<AssetResponse>> createAsset(@Valid @RequestBody CreateAssetRequest request) {
        AssetResponse response = assetService.createAsset(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Asset created successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ASSET_MANAGER')")
    public ResponseEntity<ApiResponse<AssetResponse>> updateAsset(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAssetRequest request) {
        AssetResponse response = assetService.updateAsset(id, request);
        return ResponseEntity.ok(ApiResponse.success("Asset updated successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AssetResponse>> getAssetById(@PathVariable Long id) {
        AssetResponse response = assetService.getAssetById(id);
        return ResponseEntity.ok(ApiResponse.success("Asset fetched successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AssetResponse>>> getAllAssets() {
        List<AssetResponse> responses = assetService.getAllAssets();
        return ResponseEntity.ok(ApiResponse.success("Assets fetched successfully", responses));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PagedResponse<AssetResponse>>> searchAssets(
            AssetSearchCriteria criteria, Pageable pageable) {
        PagedResponse<AssetResponse> responses = assetService.searchAssets(criteria, pageable);
        return ResponseEntity.ok(ApiResponse.success("Assets searched successfully", responses));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'ASSET_MANAGER')")
    public ResponseEntity<ApiResponse<AssetResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam AssetStatus status) {
        AssetResponse response = assetService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Asset status updated successfully", response));
    }
}
