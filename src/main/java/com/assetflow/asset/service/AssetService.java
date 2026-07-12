package com.assetflow.asset.service;

import com.assetflow.asset.dto.AssetResponse;
import com.assetflow.asset.dto.AssetSearchCriteria;
import com.assetflow.asset.dto.CreateAssetRequest;
import com.assetflow.asset.dto.UpdateAssetRequest;
import com.assetflow.asset.entity.Asset;
import com.assetflow.asset.entity.AssetStatus;
import com.assetflow.asset.mapper.AssetMapper;
import com.assetflow.asset.repository.AssetRepository;
import com.assetflow.common.dto.PagedResponse;
import com.assetflow.common.exception.ResourceNotFoundException;
import com.assetflow.assetcategory.entity.AssetCategory;
import com.assetflow.department.entity.Department;
import com.assetflow.assetcategory.repository.AssetCategoryRepository;
import com.assetflow.department.repository.DepartmentRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AssetService {

    private final AssetRepository assetRepository;
    private final AssetCategoryRepository assetCategoryRepository;
    private final DepartmentRepository departmentRepository;
    private final AssetMapper assetMapper;

    @Transactional
    public AssetResponse createAsset(CreateAssetRequest request) {
        if (request.getSerialNumber() != null && !request.getSerialNumber().isBlank() &&
                assetRepository.existsBySerialNumber(request.getSerialNumber())) {
            throw new IllegalArgumentException("Asset with serial number " + request.getSerialNumber() + " already exists");
        }

        AssetCategory category = assetCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("AssetCategory", "id", request.getCategoryId()));

        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", "id", request.getDepartmentId()));
        }

        String assetTag = "AST-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Asset asset = Asset.builder()
                .assetTag(assetTag)
                .name(request.getName())
                .description(request.getDescription())
                .category(category)
                .department(department)
                .serialNumber(request.getSerialNumber())
                .purchaseDate(request.getPurchaseDate())
                .purchaseCost(request.getPurchaseCost())
                .assetCondition(request.getAssetCondition())
                .location(request.getLocation())
                .notes(request.getNotes())
                .bookable(request.isBookable())
                .photoUrl(request.getPhotoUrl())
                .status(AssetStatus.AVAILABLE)
                .build();

        Asset savedAsset = assetRepository.save(asset);
        return assetMapper.toResponse(savedAsset);
    }

    @Transactional
    public AssetResponse updateAsset(Long id, UpdateAssetRequest request) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset", "id", id));

        if (request.getSerialNumber() != null && !request.getSerialNumber().isBlank() &&
                !request.getSerialNumber().equals(asset.getSerialNumber()) &&
                assetRepository.existsBySerialNumber(request.getSerialNumber())) {
            throw new IllegalArgumentException("Asset with serial number " + request.getSerialNumber() + " already exists");
        }

        AssetCategory category = assetCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("AssetCategory", "id", request.getCategoryId()));

        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", "id", request.getDepartmentId()));
        }

        asset.setName(request.getName());
        asset.setDescription(request.getDescription());
        asset.setCategory(category);
        asset.setDepartment(department);
        asset.setSerialNumber(request.getSerialNumber());
        asset.setPurchaseDate(request.getPurchaseDate());
        asset.setPurchaseCost(request.getPurchaseCost());
        asset.setAssetCondition(request.getAssetCondition());
        asset.setLocation(request.getLocation());
        asset.setNotes(request.getNotes());
        asset.setBookable(request.isBookable());
        asset.setPhotoUrl(request.getPhotoUrl());

        Asset updatedAsset = assetRepository.save(asset);
        return assetMapper.toResponse(updatedAsset);
    }

    @Transactional(readOnly = true)
    public AssetResponse getAssetById(Long id) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset", "id", id));
        return assetMapper.toResponse(asset);
    }

    @Transactional(readOnly = true)
    public List<AssetResponse> getAllAssets() {
        return assetRepository.findAll().stream()
                .map(assetMapper::toResponse)
                .toList();
    }

    @Transactional
    public AssetResponse updateStatus(Long id, AssetStatus status) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset", "id", id));
        asset.setStatus(status);
        Asset updatedAsset = assetRepository.save(asset);
        return assetMapper.toResponse(updatedAsset);
    }

    @Transactional(readOnly = true)
    public PagedResponse<AssetResponse> searchAssets(AssetSearchCriteria criteria, Pageable pageable) {
        Specification<Asset> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (criteria.getSearch() != null && !criteria.getSearch().isBlank()) {
                String searchPattern = "%" + criteria.getSearch().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), searchPattern),
                        cb.like(cb.lower(root.get("assetTag")), searchPattern),
                        cb.like(cb.lower(root.get("serialNumber")), searchPattern)
                ));
            }

            if (criteria.getCategoryId() != null) {
                predicates.add(cb.equal(root.get("category").get("id"), criteria.getCategoryId()));
            }

            if (criteria.getDepartmentId() != null) {
                predicates.add(cb.equal(root.get("department").get("id"), criteria.getDepartmentId()));
            }

            if (criteria.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), criteria.getStatus()));
            }

            if (criteria.getBookable() != null) {
                predicates.add(cb.equal(root.get("bookable"), criteria.getBookable()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Asset> page = assetRepository.findAll(spec, pageable);
        List<AssetResponse> content = page.getContent().stream()
                .map(assetMapper::toResponse)
                .toList();
        
        return new PagedResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }
}
