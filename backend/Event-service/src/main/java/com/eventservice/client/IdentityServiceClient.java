package com.eventservice.client;

import com.eventservice.config.FeignClientConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import com.eventservice.dto.UserDto;
import java.util.List;

@FeignClient(
        name = "identity-service",
        url = "http://localhost:8083",
        configuration = FeignClientConfig.class
)
public interface IdentityServiceClient {
    @GetMapping("/profiles/batch")
    List<UserDto> getUsersByIds(@RequestParam("ids") List<String> ids);

    @GetMapping("/profiles/invite")
    UserDto getUsersById(@RequestParam("id") String id);

    @GetMapping("/accounts/admin-ids")
    List<String> getAdminAccountIds();

    @GetMapping("/profiles/by-emails")
    List<UserDto> getUsersByEmails(@RequestParam("emails") List<String> emails);
}
