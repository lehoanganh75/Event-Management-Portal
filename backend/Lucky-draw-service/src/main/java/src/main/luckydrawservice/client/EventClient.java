package src.main.luckydrawservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import src.main.luckydrawservice.config.FeignClientConfig;

@FeignClient(name = "event-service", url = "http://localhost:8082")
public interface EventClient {

    @PutMapping("/events/{eventId}/lucky-draw")
    void updateLuckyDrawId(@PathVariable("eventId") String eventId, @RequestParam("hasLuckyDraw") boolean hasLuckyDraw);

    @org.springframework.web.bind.annotation.GetMapping("/events/{id}")
    src.main.luckydrawservice.dto.EventResponse getEventById(@PathVariable("id") String id, @org.springframework.web.bind.annotation.RequestHeader("Authorization") String token);
}
