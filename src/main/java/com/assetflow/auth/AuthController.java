package com.assetflow.auth;

import com.assetflow.auth.dto.UserInfo;
import com.assetflow.common.dto.ApiResponse;
import com.assetflow.employee.entity.Employee;
import com.assetflow.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserInfo>> getCurrentUser(@CurrentUser Employee employee) {
        UserInfo userInfo = UserInfo.builder()
                .id(employee.getId())
                .email(employee.getEmail())
                .name(employee.getName())
                .avatarUrl(employee.getAvatarUrl())
                .role(employee.getRole().name())
                .department(employee.getDepartment() != null
                        ? employee.getDepartment().getName()
                        : null)
                .designation(employee.getDesignation())
                .build();

        return ResponseEntity.ok(ApiResponse.success("User info retrieved successfully", userInfo));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully. Please remove the token on the client side.", null));
    }
}
