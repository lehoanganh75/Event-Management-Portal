package com.eventservice.config;

import org.springframework.http.HttpMethod;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import javax.crypto.spec.SecretKeySpec;
import java.util.Arrays;
import java.util.Base64;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
        // Default secret key for development if JWT_SECRET is missing
        @Value("${jwt.secret}")
        private String secretKey;

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                http
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .csrf(csrf -> csrf.disable())
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                                                // 1. Admin restricted routes
                                                .requestMatchers("/api/v1/events/admin/**")
                                                .hasAnyRole("ADMIN", "SUPER_ADMIN")
                                                .requestMatchers("/events/admin/**").hasAnyRole("ADMIN", "SUPER_ADMIN")

                                                // 2. Specific Authenticated routes (Highest priority for these paths)
                                                .requestMatchers("/events/my-events").authenticated()
                                                .requestMatchers("/events/organizer-roles").authenticated()
                                                .requestMatchers("/events/plans/my").authenticated()
                                                .requestMatchers("/events/plans/status/**").authenticated()

                                                // 3. Public routes
                                                .requestMatchers(
                                                                "/api/v1/chat/**",
                                                                "/api/v1/ai-planning/**",
                                                                "/",
                                                                "/posts/detail/**",
                                                                "/v3/api-docs/**",
                                                                "/swagger-ui/**",
                                                                "/swagger-ui.html",
                                                                "/uploads/**",
                                                                "/error")
                                                .permitAll()

                                                // 4. Public GET routes for events (Narrowed to avoid matching private
                                                // routes)
                                                // .requestMatchers(new AntPathRequestMatcher("/events", "GET"))
                                                // .permitAll()
                                                // .requestMatchers(new AntPathRequestMatcher("/events/ongoing", "GET"))
                                                // .permitAll()
                                                // .requestMatchers(new AntPathRequestMatcher("/events/upcoming-week",
                                                // "GET"))
                                                // .permitAll()
                                                // .requestMatchers(new AntPathRequestMatcher("/events/featured",
                                                // "GET"))
                                                // .permitAll()
                                                // .requestMatchers(new AntPathRequestMatcher("/events/news", "GET"))
                                                // .permitAll()
                                                // .requestMatchers(new AntPathRequestMatcher("/events/plans", "GET"))
                                                // .permitAll()
                                                // .requestMatchers(new AntPathRequestMatcher("/events/{id}", "GET"))
                                                // .permitAll()

                                                // .requestMatchers(new AntPathRequestMatcher("/quizzes/**", "GET"))
                                                // .permitAll()
                                                // .requestMatchers(new AntPathRequestMatcher("/surveys/**", "GET"))
                                                // .permitAll()
                                                // .requestMatchers(new AntPathRequestMatcher("/posts/**", "GET"))
                                                // .permitAll()

                                                // 5. Everything else
                                                .anyRequest().authenticated())
                                .oauth2ResourceServer(oauth2 -> oauth2
                                                .jwt(jwt -> jwt.jwtAuthenticationConverter(
                                                                jwtAuthenticationConverter()))
                                                .authenticationEntryPoint(authenticationEntryPoint()))
                                .exceptionHandling(ex -> ex
                                                .authenticationEntryPoint(authenticationEntryPoint())
                                                .accessDeniedHandler(accessDeniedHandler()));

                return http.build();
        }

        @Bean
        public WebSecurityCustomizer webSecurityCustomizer() {
                return (web) -> web.ignoring().requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html");
        }

        @Bean
        public AuthenticationEntryPoint authenticationEntryPoint() {
                return (request, response, authException) -> {
                        Logger logger = LoggerFactory.getLogger("SecurityConfig");
                        logger.error("Authentication Rejection (401): Unauthorized access to {} - Error: {}",
                                        request.getRequestURI(), authException.getMessage());

                        response.setStatus(401);
                        response.setContentType("application/json");
                        response.getWriter().write(
                                        "{\"code\": 401, \"message\": \"Phiên làm việc hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.\"}");
                };
        }

        @Bean
        public org.springframework.security.web.access.AccessDeniedHandler accessDeniedHandler() {
                return (request, response, accessDeniedException) -> {
                        Logger logger = LoggerFactory.getLogger("SecurityConfig");
                        logger.warn("Authorization Rejection (403): Forbidden access to {} - Error: {}",
                                        request.getRequestURI(), accessDeniedException.getMessage());

                        response.setStatus(403);
                        response.setContentType("application/json");
                        response.getWriter().write(
                                        "{\"code\": 403, \"message\": \"Bạn không có quyền truy cập tính năng này.\"}");
                };
        }

        @Bean
        public JwtAuthenticationConverter jwtAuthenticationConverter() {
                JwtGrantedAuthoritiesConverter authoritiesConverter = new JwtGrantedAuthoritiesConverter();
                authoritiesConverter.setAuthoritiesClaimName("role");
                authoritiesConverter.setAuthorityPrefix("ROLE_");

                JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
                converter.setJwtGrantedAuthoritiesConverter(authoritiesConverter);
                return converter;
        }

        @Bean
        public JwtDecoder jwtDecoder() {
                byte[] keyBytes = Base64.getDecoder().decode(secretKey);

                SecretKeySpec secretKeySpec = new SecretKeySpec(keyBytes, "HmacSHA512");

                return NimbusJwtDecoder
                                .withSecretKey(secretKeySpec)
                                .macAlgorithm(MacAlgorithm.HS512)
                                .build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                configuration.setAllowedOriginPatterns(Arrays.asList("*"));
                configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
                configuration.setAllowedHeaders(Arrays.asList("*"));
                configuration.setAllowCredentials(true);
                configuration.setMaxAge(3600L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }
}
