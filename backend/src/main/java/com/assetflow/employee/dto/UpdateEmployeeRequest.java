package com.assetflow.employee.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateEmployeeRequest {
    @NotBlank(message = "Name is required")
    private String name;
    private String phone;
    private String designation;
}
