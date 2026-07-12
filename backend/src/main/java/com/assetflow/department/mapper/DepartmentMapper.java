package com.assetflow.department.mapper;

import com.assetflow.department.dto.CreateDepartmentRequest;
import com.assetflow.department.dto.DepartmentResponse;
import com.assetflow.department.entity.Department;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", builder = @org.mapstruct.Builder(disableBuilder = true))
public interface DepartmentMapper {

    @Mapping(source = "parentDepartment.id", target = "parentDepartmentId")
    @Mapping(source = "parentDepartment.name", target = "parentDepartmentName")
    @Mapping(source = "head.id", target = "headId")
    @Mapping(source = "head.name", target = "headName")
    DepartmentResponse toResponse(Department department);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "parentDepartment", ignore = true)
    @Mapping(target = "head", ignore = true)
    @Mapping(target = "active", constant = "true")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Department toEntity(CreateDepartmentRequest request);
}
