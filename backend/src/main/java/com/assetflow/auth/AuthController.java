package com.assetflow.auth;

import com.assetflow.auth.dto.AuthResponse;
import com.assetflow.auth.dto.UserInfo;
import com.assetflow.common.dto.ApiResponse;
import com.assetflow.employee.entity.Employee;
import com.assetflow.employee.repository.EmployeeRepository;
import com.assetflow.security.CurrentUser;
import com.assetflow.security.JwtService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final EmployeeRepository employeeRepository;
    private final JwtService jwtService;

    /**
     * Dev-mode login: looks up the employee by email and returns a JWT.
     * Password is accepted as-is (no hashing yet — auth comes later).
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(@RequestBody LoginRequest request) {
        Employee employee = employeeRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("No employee found with email: " + request.getEmail()));

        String token = jwtService.generateToken(employee);

        Map<String, Object> payload = Map.of(
                "token", token,
                "user", Map.of(
                        "id",    employee.getId(),
                        "email", employee.getEmail(),
                        "name",  employee.getName(),
                        "role",  employee.getRole().name()
                )
        );
        return ResponseEntity.ok(ApiResponse.success("Login successful", payload));
    }

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

    @Data
    public static class LoginRequest {
        private String email;
        private String password;
    }
}
