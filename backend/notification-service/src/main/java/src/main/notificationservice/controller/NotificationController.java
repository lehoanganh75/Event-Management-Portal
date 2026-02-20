package src.main.notificationservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import src.main.notificationservice.service.NotificationService;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;
}