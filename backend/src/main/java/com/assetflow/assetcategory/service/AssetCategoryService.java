package com.assetflow.assetcategory.service;

import com.assetflow.assetcategory.dto.CategoryResponse;
import com.assetflow.assetcategory.dto.CreateCategoryRequest;
import com.assetflow.assetcategory.dto.UpdateCategoryRequest;
import com.assetflow.assetcategory.entity.AssetCategory;
import com.assetflow.assetcategory.mapper.CategoryMapper;
import com.assetflow.assetcategory.repository.AssetCategoryRepository;
import com.assetflow.asset.repository.AssetRepository;
import com.assetflow.common.exception.ConflictException;
import com.assetflow.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssetCategoryService {

    private final AssetCategoryRepository categoryRepository;
    private final AssetRepository assetRepository;
    private final CategoryMapper categoryMapper;

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(categoryMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        AssetCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AssetCategory", "id", id));
        return categoryMapper.toResponse(category);
    }

    @Transactional
    public CategoryResponse createCategory(CreateCategoryRequest request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new ConflictException("Category with name already exists");
        }

        AssetCategory category = categoryMapper.toEntity(request);
        AssetCategory savedCategory = categoryRepository.save(category);
        return categoryMapper.toResponse(savedCategory);
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, UpdateCategoryRequest request) {
        AssetCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AssetCategory", "id", id));

        if (!category.getName().equals(request.getName()) && categoryRepository.existsByName(request.getName())) {
            throw new ConflictException("Category with name already exists");
        }

        categoryMapper.updateEntityFromRequest(request, category);
        AssetCategory updatedCategory = categoryRepository.save(category);
        return categoryMapper.toResponse(updatedCategory);
    }

    @Transactional
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("AssetCategory", "id", id);
        }
        
        // Prevent deletion if there are assets tied to this category
        if (assetRepository.existsByCategoryId(id)) {
            throw new ConflictException("Cannot delete category because it is still assigned to one or more assets. Please reassign those assets first.");
        }
        
        categoryRepository.deleteById(id);
    }
}
