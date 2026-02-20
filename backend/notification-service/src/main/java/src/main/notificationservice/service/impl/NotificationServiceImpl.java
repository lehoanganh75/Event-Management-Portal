package src.main.notificationservice.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import src.main.notificationservice.repository.NotificationRepository;
import src.main.notificationservice.service.NotificationService;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;
}
