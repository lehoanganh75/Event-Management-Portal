package com.eventservice.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Centralized application configuration properties.
 * <p>
 * All properties are bound from {@code application.properties} with the {@code app.*} prefix.
 * To override at runtime, set the corresponding environment variable:
 * <ul>
 *   <li>{@code FRONTEND_BASE_URL} → overrides {@code app.frontend.base-url}</li>
 * </ul>
 */
@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private Frontend frontend = new Frontend();

    @Getter
    @Setter
    public static class Frontend {
        /** Base URL of the frontend application (e.g. http://localhost:5174 or https://yourdomain.com) */
        private String baseUrl = "http://localhost:5174";
    }
}
