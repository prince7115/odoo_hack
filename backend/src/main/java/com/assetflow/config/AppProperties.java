package com.assetflow.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.annotation.Validated;

import java.util.List;

@Data
@Validated
@Configuration
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private Jwt jwt = new Jwt();
    private Cors cors = new Cors();
    private OAuth2 oauth2 = new OAuth2();

    @Data
    public static class Jwt {
        private String secret;
        private long expirationMs = 86400000; // 24 hours default
        private String issuer = "AssetFlow";
    }

    @Data
    public static class Cors {
        private List<String> allowedOrigins = List.of("http://localhost:3000");
        private List<String> allowedMethods = List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS");
        private List<String> allowedHeaders = List.of("*");
        private boolean allowCredentials = true;
    }

    @Data
    public static class OAuth2 {
        private String redirectUri = "http://localhost:3000/oauth2/redirect";
        private String adminEmail;
    }
}
