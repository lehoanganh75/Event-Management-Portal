package com.eventservice.security;

import lombok.RequiredArgsConstructor;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Map;

@Aspect
@Component
@RequiredArgsConstructor
public class EventSecurityAspect {

    private final EventSecurityService securityService;

    @Before("@annotation(requireEventRole)")
    public void authorize(JoinPoint joinPoint, RequireEventRole requireEventRole) {
        String eventId = extractEventId(joinPoint);
        String accountId = getCurrentAccountId();

        if (eventId == null || accountId == null) {
            throw new RuntimeException("Missing context for authorization");
        }

        // Global SuperAdmin Bypass
        if (isSuperAdmin()) return;

        securityService.checkPermission(eventId, accountId, requireEventRole.value(), requireEventRole.requireOngoing());
    }

    private String extractEventId(JoinPoint joinPoint) {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            @SuppressWarnings("unchecked")
            Map<String, String> pathVariables = (Map<String, String>) attributes.getRequest()
                    .getAttribute("org.springframework.web.servlet.HandlerMapping.uriTemplateVariables");
            if (pathVariables != null) {
                if (pathVariables.get("eventId") != null) return pathVariables.get("eventId");
                if (pathVariables.get("id") != null) return pathVariables.get("id");
            }
        }
        return null;
    }

    private String getCurrentAccountId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Jwt) {
            return ((Jwt) auth.getPrincipal()).getSubject();
        }
        return null;
    }

    private boolean isSuperAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));
    }
}
