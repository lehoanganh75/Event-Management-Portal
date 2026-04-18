package src.main.eventservice;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
<<<<<<< Updated upstream:backend/Event-service/src/main/java/src/main/eventservice/EventServiceApplication.java

@SpringBootApplication
@EnableFeignClients
=======
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableFeignClients
@EnableAsync
@EnableScheduling
>>>>>>> Stashed changes:backend/Event-service/src/main/java/com/eventservice/EventServiceApplication.java
public class EventServiceApplication {

    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

        dotenv.entries().forEach(entry -> {
            System.setProperty(entry.getKey(), entry.getValue());
        });

        SpringApplication.run(EventServiceApplication.class, args);
    }

}
