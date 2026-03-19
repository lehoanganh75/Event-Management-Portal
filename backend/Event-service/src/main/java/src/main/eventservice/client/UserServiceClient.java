package src.main.eventservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import src.main.eventservice.dto.UserDto;

@FeignClient(name = "user-service", url = "${identity.service.url}")
public interface UserServiceClient {

    @GetMapping("/api/profiles/internal/{id}")
    UserDto getUserById(@PathVariable("id") String id);
}