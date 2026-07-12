package com.assetflow.employee.entity;

import com.assetflow.common.entity.BaseEntity;
import com.assetflow.common.enums.Role;
import com.assetflow.department.entity.Department;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "employees")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee extends BaseEntity {

    @Column(unique = true)
    private String googleId;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String name;

    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    private String phone;

    private String designation;

    @Builder.Default
    private boolean active = true;
}
