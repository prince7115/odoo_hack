package com.assetflow.employee.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeResponse {
    private Long id;
    private String email;
    private String name;
    private String avatarUrl;
    private String role;
    private String departmentName;
    private String phone;
    private String designation;
    private boolean active;
}
