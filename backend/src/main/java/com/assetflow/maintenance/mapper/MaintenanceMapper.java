package com.assetflow.maintenance.mapper;

import com.assetflow.maintenance.dto.MaintenanceResponse;
import com.assetflow.maintenance.entity.MaintenanceRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", builder = @org.mapstruct.Builder(disableBuilder = true))
public interface MaintenanceMapper {

    @Mapping(source = "asset.id", target = "assetId")
    @Mapping(source = "asset.name", target = "assetName")
    @Mapping(source = "requestedBy.id", target = "requestedById")
    @Mapping(source = "requestedBy.name", target = "requestedByName")
    @Mapping(source = "approvedBy.id", target = "approvedById")
    @Mapping(source = "approvedBy.name", target = "approvedByName")
    MaintenanceResponse toDto(MaintenanceRequest request);
}
