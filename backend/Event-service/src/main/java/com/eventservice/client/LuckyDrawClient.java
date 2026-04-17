package com.eventservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "lucky-draw-service", url = "http://localhost:8084")
public interface LuckyDrawClient {

    @DeleteMapping("/lucky-draws/events/{eventId}/soft-delete")
    void softDeleteByEventId(@PathVariable("eventId") String eventId);
}
