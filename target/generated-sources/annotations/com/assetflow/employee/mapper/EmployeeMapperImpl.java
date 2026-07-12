package com.assetflow.employee.mapper;

import com.assetflow.department.entity.Department;
import com.assetflow.employee.dto.EmployeeResponse;
import com.assetflow.employee.entity.Employee;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-07-12T11:16:20+0530",
    comments = "version: 1.6.3, compiler: javac, environment: Java 23 (Oracle Corporation)"
)
@Component
public class EmployeeMapperImpl implements EmployeeMapper {

    @Override
    public EmployeeResponse toResponse(Employee employee) {
        if ( employee == null ) {
            return null;
        }

        EmployeeResponse.EmployeeResponseBuilder employeeResponse = EmployeeResponse.builder();

        employeeResponse.departmentName( employeeDepartmentName( employee ) );
        employeeResponse.id( employee.getId() );
        employeeResponse.email( employee.getEmail() );
        employeeResponse.name( employee.getName() );
        employeeResponse.avatarUrl( employee.getAvatarUrl() );
        if ( employee.getRole() != null ) {
            employeeResponse.role( employee.getRole().name() );
        }
        employeeResponse.phone( employee.getPhone() );
        employeeResponse.designation( employee.getDesignation() );
        employeeResponse.active( employee.isActive() );

        return employeeResponse.build();
    }

    @Override
    public List<EmployeeResponse> toResponseList(List<Employee> employees) {
        if ( employees == null ) {
            return null;
        }

        List<EmployeeResponse> list = new ArrayList<EmployeeResponse>( employees.size() );
        for ( Employee employee : employees ) {
            list.add( toResponse( employee ) );
        }

        return list;
    }

    private String employeeDepartmentName(Employee employee) {
        Department department = employee.getDepartment();
        if ( department == null ) {
            return null;
        }
        return department.getName();
    }
}
