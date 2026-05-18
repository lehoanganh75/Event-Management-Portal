package com.eventservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable simple broker for pub/sub
        config.enableSimpleBroker("/topic", "/queue");
        
        // Prefix for messages from client
        config.setApplicationDestinationPrefixes("/app");
        
        // Prefix for user-specific messages
        config.setUserDestinationPrefix("/user");
    }
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        String[] allowedOrigins = {
            "http://localhost:5173",
            "http://localhost:5174",
            "https://fitiuh-events.io.vn",
            "http://fitiuh-events.io.vn"
        };

        // General WebSocket endpoint
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(allowedOrigins)
                .withSockJS();

        // Native General WebSocket endpoint
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(allowedOrigins);

        // WebSocket endpoint for chat
        registry.addEndpoint("/ws/chat")
                .setAllowedOriginPatterns(allowedOrigins)
                .withSockJS();
        
        // Native WebSocket endpoint
        registry.addEndpoint("/ws/chat")
                .setAllowedOriginPatterns(allowedOrigins);
    }
}
