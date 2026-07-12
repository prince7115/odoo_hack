package com.assetflow.allocation.mapper;

import com.assetflow.allocation.dto.AllocationResponse;
import com.assetflow.allocation.entity.AssetAllocation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", builder = @org.mapstruct.Builder(disableBuilder = true))
public interface AllocationMapper {

    @Mapping(target = "assetId", source = "asset.id")
    @Mapping(target = "assetTag", source = "asset.assetTag")
    @Mapping(target = "assetName", source = "asset.name")
    @Mapping(target = "allocatedToId", source = "allocatedTo.id")
    @Mapping(target = "allocatedToName", source = "allocatedTo.name")
    @Mapping(target = "allocatedToDeptId", source = "allocatedToDept.id")
    @Mapping(target = "allocatedToDeptName", source = "allocatedToDept.name")
    @Mapping(target = "allocatedById", source = "allocatedBy.id")
    @Mapping(target = "allocatedByName", source = "allocatedBy.name")
    AllocationResponse toResponse(AssetAllocation allocation);
}
