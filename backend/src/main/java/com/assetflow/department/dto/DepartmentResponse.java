package com.assetflow.department.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentResponse {
    private Long id;
    private String name;
    private String code;
    private String description;
    private Long parentDepartmentId;
    private String parentDepartmentName;
    private Long headId;
    private String headName;
    private boolean active;
}
