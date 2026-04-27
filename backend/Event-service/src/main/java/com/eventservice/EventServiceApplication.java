package com.eventservice;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableFeignClients
@EnableAsync
@EnableScheduling
public class EventServiceApplication {

    public static void main(String[] args) {
        // Try to load .env from current directory
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        String loadedPath = ".";
        
        // If not found in current dir, try loading from backend/Event-service subdirectory
        if (dotenv.entries().isEmpty() || dotenv.get("GEMINI_API_KEY") == null) {
            dotenv = Dotenv.configure()
                    .directory("./backend/Event-service")
                    .ignoreIfMissing()
                    .load();
            loadedPath = "./backend/Event-service";
        }

        dotenv.entries().forEach(entry -> {
            System.setProperty(entry.getKey(), entry.getValue());
        });
        
        System.out.println(">>> [Event-service] Configuration search completed.");
        if (dotenv.get("GEMINI_API_KEY") != null) {
            System.out.println(">>> [Event-service] Found GEMINI_API_KEY in " + loadedPath);
        } else {
            System.err.println(">>> [Event-service] WARNING: GEMINI_API_KEY is missing in BOTH locations.");
        }

        SpringApplication.run(EventServiceApplication.class, args);
    }

}
