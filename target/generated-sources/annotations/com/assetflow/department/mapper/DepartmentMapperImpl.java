package com.assetflow.department.mapper;

import com.assetflow.department.dto.CreateDepartmentRequest;
import com.assetflow.department.dto.DepartmentResponse;
import com.assetflow.department.entity.Department;
import com.assetflow.employee.entity.Employee;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-07-12T11:16:20+0530",
    comments = "version: 1.6.3, compiler: javac, environment: Java 23 (Oracle Corporation)"
)
@Component
public class DepartmentMapperImpl implements DepartmentMapper {

    @Override
    public DepartmentResponse toResponse(Department department) {
        if ( department == null ) {
            return null;
        }

        DepartmentResponse departmentResponse = new DepartmentResponse();

        departmentResponse.setParentDepartmentId( departmentParentDepartmentId( department ) );
        departmentResponse.setParentDepartmentName( departmentParentDepartmentName( department ) );
        departmentResponse.setHeadId( departmentHeadId( department ) );
        departmentResponse.setHeadName( departmentHeadName( department ) );
        departmentResponse.setId( department.getId() );
        departmentResponse.setName( department.getName() );
        departmentResponse.setCode( department.getCode() );
        departmentResponse.setDescription( department.getDescription() );
        departmentResponse.setActive( department.isActive() );

        return departmentResponse;
    }

    @Override
    public Department toEntity(CreateDepartmentRequest request) {
        if ( request == null ) {
            return null;
        }

        Department department = new Department();

        department.setName( request.getName() );
        department.setCode( request.getCode() );
        department.setDescription( request.getDescription() );

        department.setActive( true );

        return department;
    }

    private Long departmentParentDepartmentId(Department department) {
        Department parentDepartment = department.getParentDepartment();
        if ( parentDepartment == null ) {
            return null;
        }
        return parentDepartment.getId();
    }

    private String departmentParentDepartmentName(Department department) {
        Department parentDepartment = department.getParentDepartment();
        if ( parentDepartment == null ) {
            return null;
        }
        return parentDepartment.getName();
    }

    private Long departmentHeadId(Department department) {
        Employee head = department.getHead();
        if ( head == null ) {
            return null;
        }
        return head.getId();
    }

    private String departmentHeadName(Department department) {
        Employee head = department.getHead();
        if ( head == null ) {
            return null;
        }
        return head.getName();
    }
}
