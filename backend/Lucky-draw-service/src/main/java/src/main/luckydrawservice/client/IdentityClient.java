package src.main.luckydrawservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import src.main.luckydrawservice.config.FeignClientConfig;
import src.main.luckydrawservice.dto.UserResponse;

import java.util.List;

@FeignClient(
        name = "identity-service",
        url = "http://localhost:8083",
        configuration = FeignClientConfig.class
)
public interface IdentityClient {
    @GetMapping("/profiles/batch")
    List<UserResponse> getUsersByIds(@RequestParam("ids") List<String> ids);
}
