package com.assetflow.employee.mapper;

import com.assetflow.employee.dto.EmployeeResponse;
import com.assetflow.employee.entity.Employee;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface EmployeeMapper {
    
    @Mapping(target = "departmentName", source = "department.name")
    EmployeeResponse toResponse(Employee employee);
    
    List<EmployeeResponse> toResponseList(List<Employee> employees);
}
