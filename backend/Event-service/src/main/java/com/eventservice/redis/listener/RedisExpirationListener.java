package com.eventservice.redis.listener;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.listener.KeyExpirationEventMessageListener;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.stereotype.Component;
import com.eventservice.constant.RedisConstant;
import com.eventservice.entity.enums.InvitationStatus;
import com.eventservice.repository.EventInvitationRepository;

@Component
@Slf4j
public class RedisExpirationListener extends KeyExpirationEventMessageListener {

    private final EventInvitationRepository invitationRepository;

    public RedisExpirationListener(RedisMessageListenerContainer listenerContainer,
                                   EventInvitationRepository invitationRepository) {
        super(listenerContainer);
        this.invitationRepository = invitationRepository;
    }

    @Override
    public void onMessage(Message message, byte[] pattern) {
        // key chính là cái Redis Key đã hết hạn (ví dụ: event:invite:token:uuid-abc-123)
        String expiredKey = message.toString();
        log.info("Redis Key expired: {}", expiredKey);

        if (expiredKey.startsWith(RedisConstant.EVENT_INVITE_PREFIX)) {
            String token = expiredKey.replace(RedisConstant.EVENT_INVITE_PREFIX, "");

            // Cập nhật Database
            invitationRepository.findByToken(token).ifPresent(invitation -> {
                if (invitation.getStatus() == InvitationStatus.PENDING) {
                    invitation.setStatus(InvitationStatus.EXPIRED); // Hoặc EXPIRED nếu bạn có
                    invitation.setRejectionReason("Hết thời gian phản hồi (30s)");
                    invitationRepository.save(invitation);
                    log.info("Đã cập nhật trạng thái EXPIRED cho lời mời: {}", token);
                }
            });
        }
    }
}