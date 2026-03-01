package src.main.authservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service", url = "http://localhost:8082")
public interface UserClient {
    @GetMapping("/api/profiles/by-account/{accountId}")
    String getUserProfileIdByAccountId(@PathVariable String accountId);
}
