package com.analyticsservice.config;

import feign.RequestInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Configuration
@Slf4j
public class FeignConfig {

    @Bean
    public RequestInterceptor requestInterceptor() {
        return requestTemplate -> {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String authHeader = request.getHeader("Authorization");
                if (authHeader != null) {
                    log.info("Propagating Authorization header to Feign request: {}...", 
                        authHeader.substring(0, Math.min(authHeader.length(), 15)));
                    requestTemplate.header("Authorization", authHeader);
                } else {
                    log.warn("No Authorization header found in current request context!");
                }
            } else {
                System.out.println("No request attributes found (RequestContextHolder)");
            }
        };
    }
}
