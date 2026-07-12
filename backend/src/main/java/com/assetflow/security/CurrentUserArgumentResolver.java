package com.assetflow.security;

import com.assetflow.employee.entity.Employee;
import com.assetflow.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.MethodParameter;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

@Component
@RequiredArgsConstructor
public class CurrentUserArgumentResolver implements HandlerMethodArgumentResolver {

    private final EmployeeRepository employeeRepository;

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(CurrentUser.class)
                && Employee.class.isAssignableFrom(parameter.getParameterType());
    }

    @Override
    public Object resolveArgument(MethodParameter parameter,
                                  ModelAndViewContainer mavContainer,
                                  NativeWebRequest webRequest,
                                  WebDataBinderFactory binderFactory) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // --------------------------------------------------------------------------------
        // HACKATHON BYPASS: If no authentication is present, return the first user (Admin)
        // so that the API can be tested openly without throwing NullPointerExceptions!
        // --------------------------------------------------------------------------------
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return employeeRepository.findAll().stream().findFirst()
                    .orElse(null); // Return the first user in the DB (usually System Admin)
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof Long userId) {
            return employeeRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Authenticated user not found with id: " + userId));
        }

        return null;
    }
}
