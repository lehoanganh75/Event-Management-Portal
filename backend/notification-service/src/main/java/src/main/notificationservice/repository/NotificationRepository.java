package src.main.notificationservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import src.main.notificationservice.entity.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification,String> {
}