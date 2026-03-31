package src.main.eventservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import src.main.eventservice.dto.UserDto;

import java.util.List;

@FeignClient(name = "identity-service", url = "http://localhost:8082")
public interface IdentityServiceClient {
    @GetMapping("/api/profiles/batch")
    List<UserDto> getUsersByIds(@RequestParam("ids") List<String> ids);
}