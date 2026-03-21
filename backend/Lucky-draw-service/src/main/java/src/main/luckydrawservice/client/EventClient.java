package src.main.luckydrawservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "event-service")
public interface EventClient {
    @PutMapping("/api/events/{id}/lucky-draw")
    void updateLuckyDrawId(
            @PathVariable("id") String id,
            @RequestParam("luckyDrawId") String luckyDrawId
    );
}
