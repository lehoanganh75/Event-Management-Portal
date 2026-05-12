package com.analyticsservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Map;

@FeignClient(name = "Event-service", url = "${app.services.event-service.url}", configuration = com.analyticsservice.config.FeignConfig.class)
public interface EventClient {

    @GetMapping("/events/{id}")
    Map<String, Object> getEventById(@PathVariable("id") String id);

    @GetMapping("/registrations/event/{eventId}")
    List<Map<String, Object>> getRegistrationsByEvent(@PathVariable("eventId") String eventId);

    @GetMapping("/surveys/event/{eventId}")
    Map<String, Object> getSurveyByEvent(@PathVariable("eventId") String eventId);
}
