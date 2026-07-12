package com.assetflow.employee.controller;

import com.assetflow.common.dto.ApiResponse;
import com.assetflow.employee.dto.EmployeeResponse;
import com.assetflow.employee.dto.PromoteRoleRequest;
import com.assetflow.employee.dto.UpdateEmployeeRequest;
import com.assetflow.employee.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<EmployeeResponse>>> getAllEmployees() {
        return ResponseEntity.ok(ApiResponse.success(employeeService.getAllEmployees()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getEmployeeById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(employeeService.getEmployeeById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateProfile(
            @PathVariable Long id, 
            @Valid @RequestBody UpdateEmployeeRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", employeeService.updateProfile(id, request)));
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EmployeeResponse>> promoteRole(
            @PathVariable Long id, 
            @Valid @RequestBody PromoteRoleRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Role promoted successfully", employeeService.promoteRole(id, request)));
    }
}
