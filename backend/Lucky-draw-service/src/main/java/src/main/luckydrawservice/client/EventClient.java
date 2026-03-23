package src.main.luckydrawservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import src.main.luckydrawservice.config.FeignClientConfig;

@FeignClient(name = "event-service", configuration = FeignClientConfig.class)
public interface EventClient {
    @PutMapping("/api/events/{id}/lucky-draw")
    void updateLuckyDrawId(
            @PathVariable("id") String id,
            @RequestParam("luckyDrawId") String luckyDrawId
    );
}
