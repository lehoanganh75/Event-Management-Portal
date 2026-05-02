package com.eventservice;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(excludeName = {
        "org.springframework.ai.autoconfigure.retry.SpringAiRetryAutoConfiguration",
        "org.springframework.ai.autoconfigure.vertexai.gemini.VertexAiGeminiAutoConfiguration",
        "org.springframework.ai.autoconfigure.vertexai.palm2.VertexAiPalm2AutoConfiguration",
        "org.springframework.ai.autoconfigure.chat.client.ChatClientAutoConfiguration",
        "org.springframework.ai.autoconfigure.vectorstore.mongo.MongoDBAtlasVectorStoreAutoConfiguration"
})
@EnableJpaRepositories(basePackages = "com.eventservice.repository", excludeFilters = @ComponentScan.Filter(type = FilterType.ASPECTJ, pattern = "com.eventservice.repository.mongodb.*"))
@EnableMongoRepositories(basePackages = "com.eventservice.repository.mongodb")
@EnableFeignClients
@EnableAsync
@EnableScheduling
public class EventServiceApplication {

    public static void main(String[] args) {
        // Try to load .env from several common locations
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        String loadedPath = ".";

        // If not found in current dir, try loading from other possible locations
        if (dotenv.get("JWT_SECRET") == null) {
            // Case 1: Running from project root
            dotenv = Dotenv.configure()
                    .directory("./backend/Event-service")
                    .ignoreIfMissing()
                    .load();
            loadedPath = "./backend/Event-service";
        }

        if (dotenv.get("JWT_SECRET") == null) {
            // Case 2: Running from 'backend' directory
            dotenv = Dotenv.configure()
                    .directory("./Event-service")
                    .ignoreIfMissing()
                    .load();
            loadedPath = "./Event-service";
        }

        dotenv.entries().forEach(entry -> {
            System.setProperty(entry.getKey(), entry.getValue());
        });

        System.out.println(">>> [Event-service] Configuration search completed.");
        if (dotenv.get("JWT_SECRET") != null) {
            System.out.println(">>> [Event-service] Found configuration in " + loadedPath);
        } else {
            System.err.println(">>> [Event-service] WARNING: JWT_SECRET is missing in all searched locations!");
        }

        if (dotenv.get("GEMINI_API_KEY") == null) {
            System.err.println(">>> [Event-service] WARNING: GEMINI_API_KEY is missing.");
        }

        SpringApplication.run(EventServiceApplication.class, args);
    }

}
