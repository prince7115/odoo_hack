package com.assetflow.security;

import com.assetflow.common.enums.Role;
import com.assetflow.config.AppProperties;
import com.assetflow.employee.entity.Employee;
import com.assetflow.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final EmployeeRepository employeeRepository;
    private final AppProperties appProperties;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String picture = (String) attributes.get("picture");
        String googleId = (String) attributes.get("sub");

        log.info("OAuth2 login attempt for email: {}", email);

        Optional<Employee> existingEmployee = employeeRepository.findByEmail(email);

        Employee employee;
        if (existingEmployee.isPresent()) {
            employee = existingEmployee.get();
            // Update fields if changed
            boolean updated = false;
            if (name != null && !name.equals(employee.getName())) {
                employee.setName(name);
                updated = true;
            }
            if (picture != null && !picture.equals(employee.getAvatarUrl())) {
                employee.setAvatarUrl(picture);
                updated = true;
            }
            if (googleId != null && !googleId.equals(employee.getGoogleId())) {
                employee.setGoogleId(googleId);
                updated = true;
            }
            if (updated) {
                employee = employeeRepository.save(employee);
                log.info("Updated existing employee: {}", email);
            }
        } else {
            // Create new employee
            Role role = Role.EMPLOYEE;
            if (email != null && email.equals(appProperties.getOauth2().getAdminEmail())) {
                role = Role.ADMIN;
                log.info("Assigning ADMIN role to: {}", email);
            }

            employee = Employee.builder()
                    .googleId(googleId)
                    .email(email)
                    .name(name != null ? name : "Unknown")
                    .avatarUrl(picture)
                    .role(role)
                    .active(true)
                    .build();

            employee = employeeRepository.save(employee);
            log.info("Created new employee: {} with role: {}", email, role);
        }

        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + employee.getRole().name());

        return new DefaultOAuth2User(
                Collections.singleton(authority),
                attributes,
                "email"
        );
    }
}
