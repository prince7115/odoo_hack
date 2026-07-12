package com.assetflow.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInfo {

    private Long id;
    private String email;
    private String name;
    private String avatarUrl;
    private String role;
    private String department;
    private String designation;
}
