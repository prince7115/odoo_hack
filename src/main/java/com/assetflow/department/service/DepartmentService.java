package com.assetflow.department.service;

import com.assetflow.common.exception.ConflictException;
import com.assetflow.common.exception.ResourceNotFoundException;
import com.assetflow.department.dto.AssignHeadRequest;
import com.assetflow.department.dto.CreateDepartmentRequest;
import com.assetflow.department.dto.DepartmentResponse;
import com.assetflow.department.dto.UpdateDepartmentRequest;
import com.assetflow.department.entity.Department;
import com.assetflow.department.mapper.DepartmentMapper;
import com.assetflow.department.repository.DepartmentRepository;
import com.assetflow.employee.entity.Employee;
import com.assetflow.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentMapper departmentMapper;

    @Transactional(readOnly = true)
    public List<DepartmentResponse> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(departmentMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DepartmentResponse getDepartmentById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));
        return departmentMapper.toResponse(department);
    }

    @Transactional
    public DepartmentResponse createDepartment(CreateDepartmentRequest request) {
        if (departmentRepository.existsByName(request.getName())) {
            throw new ConflictException("Department with name '" + request.getName() + "' already exists");
        }
        if (departmentRepository.existsByCode(request.getCode())) {
            throw new ConflictException("Department with code '" + request.getCode() + "' already exists");
        }

        Department department = departmentMapper.toEntity(request);
        
        if (request.getParentDepartmentId() != null) {
            Department parent = departmentRepository.findById(request.getParentDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", "id", request.getParentDepartmentId()));
            department.setParentDepartment(parent);
        }

        department = departmentRepository.save(department);
        return departmentMapper.toResponse(department);
    }

    @Transactional
    public DepartmentResponse updateDepartment(Long id, UpdateDepartmentRequest request) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));

        if (!department.getName().equals(request.getName()) && departmentRepository.existsByName(request.getName())) {
            throw new ConflictException("Department with name '" + request.getName() + "' already exists");
        }

        department.setName(request.getName());
        department.setDescription(request.getDescription());

        department = departmentRepository.save(department);
        return departmentMapper.toResponse(department);
    }

    @Transactional
    public void deleteDepartment(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));
        department.setActive(false);
        departmentRepository.save(department);
    }

    @Transactional
    public DepartmentResponse assignHead(Long id, AssignHeadRequest request) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));

        Employee head = employeeRepository.findById(request.getHeadId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.getHeadId()));

        department.setHead(head);
        department = departmentRepository.save(department);
        return departmentMapper.toResponse(department);
    }
}
