package com.assetflow.employee.service;

import com.assetflow.common.exception.ResourceNotFoundException;
import com.assetflow.employee.dto.EmployeeResponse;
import com.assetflow.employee.dto.PromoteRoleRequest;
import com.assetflow.employee.dto.UpdateEmployeeRequest;
import com.assetflow.employee.entity.Employee;
import com.assetflow.employee.mapper.EmployeeMapper;
import com.assetflow.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeMapper employeeMapper;

    @Transactional(readOnly = true)
    public List<EmployeeResponse> getAllEmployees() {
        return employeeMapper.toResponseList(employeeRepository.findAll());
    }

    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        return employeeMapper.toResponse(employee);
    }

    @Transactional
    public EmployeeResponse updateProfile(Long id, UpdateEmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        
        employee.setName(request.getName());
        employee.setPhone(request.getPhone());
        employee.setDesignation(request.getDesignation());
        
        return employeeMapper.toResponse(employeeRepository.save(employee));
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public EmployeeResponse promoteRole(Long id, PromoteRoleRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        
        employee.setRole(request.getRole());
        
        return employeeMapper.toResponse(employeeRepository.save(employee));
    }
}
