package com.eventservice.client;

import com.eventservice.config.FeignClientConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import com.eventservice.dto.user.UserResponse;
import java.util.List;

@FeignClient(
        name = "identity-service",
        url = "${IDENTITY_SERVICE_URL:http://localhost:8083}",
        configuration = FeignClientConfig.class
)
public interface IdentityServiceClient {
    @PostMapping("/profiles/batch")
    List<UserResponse> getUsersByIds(@RequestBody List<String> ids);

    @GetMapping("/profiles/invite")
    UserResponse getUsersById(@RequestParam("id") String id);

    @GetMapping("/profiles/admin-ids")
    List<String> getAdminAccountIds();
    
    @GetMapping("/profiles/super-admin-ids")
    List<String> getSuperAdminAccountIds();

    @GetMapping("/profiles/by-emails")
    List<UserResponse> getUsersByEmails(@RequestParam("emails") List<String> emails);
}
