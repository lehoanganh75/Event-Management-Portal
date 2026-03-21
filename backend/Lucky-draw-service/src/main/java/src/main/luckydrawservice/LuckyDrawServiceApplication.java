package src.main.luckydrawservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class LuckyDrawServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(LuckyDrawServiceApplication.class, args);
    }

}
