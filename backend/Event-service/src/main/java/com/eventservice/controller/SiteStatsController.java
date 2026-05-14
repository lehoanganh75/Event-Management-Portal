package com.eventservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/events/site-stats")
@RequiredArgsConstructor
public class SiteStatsController {

    private final StringRedisTemplate redisTemplate;

    private static final String TOTAL_VISITS_KEY = "site:total_visits";
    private static final String ONLINE_ZSET_KEY = "site:online_zset";
    private static final long BASE_VISITS = 288704603L;
    private static final int BASE_ONLINE = 212;

    @GetMapping
    public Map<String, Object> getStats() {
        String totalStr = redisTemplate.opsForValue().get(TOTAL_VISITS_KEY);
        long total = (totalStr != null) ? Long.parseLong(totalStr) : BASE_VISITS;
        
        Long onlineCount = redisTemplate.opsForZSet().zCard(ONLINE_ZSET_KEY);
        long online = (onlineCount != null) ? onlineCount : 0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalVisits", total);
        stats.put("online", online + BASE_ONLINE); // Add base for "busy" feel
        return stats;
    }

    @PostMapping("/heartbeat")
    public Map<String, Object> heartbeat(@RequestParam String sessionId) {
        long now = System.currentTimeMillis();
        // Update session timestamp
        redisTemplate.opsForZSet().add(ONLINE_ZSET_KEY, sessionId, now);
        
        // Increment total visits if first time in session (handled by frontend call logic, 
        // but let's just increment if it's a new heartbeat interval for simplicity or a specific /visit call)
        
        // Cleanup sessions older than 60 seconds
        redisTemplate.opsForZSet().removeRangeByScore(ONLINE_ZSET_KEY, 0, now - 60000);
        
        return getStats();
    }

    @PostMapping("/visit")
    public void recordVisit() {
        redisTemplate.opsForValue().increment(TOTAL_VISITS_KEY);
    }
}
