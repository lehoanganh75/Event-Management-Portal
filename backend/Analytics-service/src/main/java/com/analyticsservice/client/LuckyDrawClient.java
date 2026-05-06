package com.analyticsservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;
import java.util.Optional;

@FeignClient(name = "Lucky-draw-service", url = "${app.services.lucky-draw-service.url}")
public interface LuckyDrawClient {

    @GetMapping("/lucky-draws/events/{eventId}")
    Optional<Map<String, Object>> getLuckyDrawByEventId(@PathVariable("eventId") String eventId);
}
