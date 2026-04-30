package com.eventservice.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.eventservice.entity.core.Event;
import com.eventservice.entity.people.EventOrganizer;
import com.eventservice.entity.enums.OrganizerRole;
import com.eventservice.repository.EventOrganizerRepository;
import com.eventservice.repository.EventRepository;
import com.eventservice.service.EventOrganizerService;

import com.eventservice.dto.engagement.NotificationEventDto;
import com.eventservice.kafka.NotificationProducer;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventOrganizerServiceImpl implements EventOrganizerService {
    private final EventOrganizerRepository organizerRepository;
    private final EventRepository eventRepository;
    private final NotificationProducer notificationProducer;

    @Override
    @Transactional
    public EventOrganizer addOrganizer(String eventId, EventOrganizer organizer) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sự kiện với ID: " + eventId));
        organizer.setEvent(event);
        organizer.setAssignedAt(LocalDateTime.now());
        return organizerRepository.save(organizer);
    }

    @Override
    public List<EventOrganizer> getOrganizers(String eventId) {
        return organizerRepository.findByEventId(eventId);
    }

    @Override
    @Transactional
    public void removeOrganizer(String organizerId) {
        if (!organizerRepository.existsById(organizerId)) {
            throw new RuntimeException("Không tìm thấy thành viên ban tổ chức với ID: " + organizerId);
        }
        organizerRepository.deleteById(organizerId);
    }

    @Transactional
    @Override
    public EventOrganizer updateOrganizerRole(String organizerId, OrganizerRole role) {
        EventOrganizer organizer = organizerRepository.findById(organizerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thành viên ban tổ chức với ID: " + organizerId));
        organizer.setRole(role);
        return organizerRepository.save(organizer);
    }

    @Override
    @Transactional
    public void requestToLeave(String eventId, String accountId) {
        EventOrganizer organizer = organizerRepository.findFirstByEventIdAndAccountId(eventId, accountId)
                .orElseThrow(() -> new RuntimeException("Bạn không thuộc ban tổ chức sự kiện này"));

        if (organizer.getRole() == OrganizerRole.LEADER) {
            // Ban tổ chức (LEADER) rời không cần duyệt
            organizerRepository.delete(organizer);
            log.info("Leader {} left event {} immediately", accountId, eventId);
        } else {
            // Các role khác cần duyệt
            organizer.setStatus(com.eventservice.entity.enums.OrganizerStatus.LEAVING_PENDING);
            organizerRepository.save(organizer);
            log.info("Member {} requested to leave event {}", accountId, eventId);

            // Gửi thông báo cho người đã mời (addedByAccountId) hoặc Leader nếu không có
            String recipientId = organizer.getAddedByAccountId();
            if (recipientId == null) {
                // Nếu không có người mời cụ thể, tìm Leader của sự kiện
                recipientId = organizerRepository.findByEventId(eventId).stream()
                        .filter(o -> o.getRole() == OrganizerRole.LEADER)
                        .map(EventOrganizer::getAccountId)
                        .findFirst()
                        .orElse(null);
            }

            if (recipientId != null) {
                notificationProducer.sendNotification(NotificationEventDto.builder()
                        .recipientId(recipientId)
                        .senderId(accountId)
                        .title("Yêu cầu rời ban tổ chức")
                        .message("Thành viên " + accountId + 
                                " đã gửi yêu cầu rời khỏi sự kiện " + organizer.getEvent().getTitle())
                        .type("LEAVE_REQUEST")
                        .relatedEntityId(organizer.getId())
                        .actionUrl("/lecturer/events/" + eventId)
                        .build());
            }
        }
    }

    @Override
    @Transactional
    public void approveLeaveRequest(String organizerId, String approverAccountId) {
        EventOrganizer organizer = organizerRepository.findById(organizerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu rời đi"));

        EventOrganizer approver = organizerRepository.findFirstByEventIdAndAccountId(organizer.getEvent().getId(), approverAccountId)
                .orElseThrow(() -> new RuntimeException("Người duyệt không thuộc ban tổ chức sự kiện này"));

        boolean canApprove = false;
        if (organizer.getRole() == OrganizerRole.COORDINATOR || organizer.getRole() == OrganizerRole.ADVISOR) {
            // Cần LEADER duyệt
            if (approver.getRole() == OrganizerRole.LEADER) canApprove = true;
        } else if (organizer.getRole() == OrganizerRole.MEMBER) {
            // Cần COORDINATOR hoặc LEADER duyệt
            if (approver.getRole() == OrganizerRole.COORDINATOR || approver.getRole() == OrganizerRole.LEADER) canApprove = true;
        }

        if (!canApprove) {
            throw new RuntimeException("Bạn không có quyền duyệt yêu cầu rời đi của thành viên này");
        }

        organizerRepository.delete(organizer);
        log.info("Leave request for {} approved by {}", organizerId, approverAccountId);
    }

    @Override
    @Transactional
    public void rejectLeaveRequest(String organizerId, String approverAccountId) {
        EventOrganizer organizer = organizerRepository.findById(organizerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu rời đi"));

        EventOrganizer approver = organizerRepository.findFirstByEventIdAndAccountId(organizer.getEvent().getId(), approverAccountId)
                .orElseThrow(() -> new RuntimeException("Người duyệt không thuộc ban tổ chức sự kiện này"));

        // Logic check quyền tương tự approve
        boolean canReject = false;
        if (organizer.getRole() == OrganizerRole.COORDINATOR || organizer.getRole() == OrganizerRole.ADVISOR) {
            if (approver.getRole() == OrganizerRole.LEADER) canReject = true;
        } else if (organizer.getRole() == OrganizerRole.MEMBER) {
            if (approver.getRole() == OrganizerRole.COORDINATOR || approver.getRole() == OrganizerRole.LEADER) canReject = true;
        }

        if (!canReject) {
            throw new RuntimeException("Bạn không có quyền từ chối yêu cầu rời đi của thành viên này");
        }

        organizer.setStatus(com.eventservice.entity.enums.OrganizerStatus.ACTIVE);
        organizerRepository.save(organizer);
        log.info("Leave request for {} rejected by {}", organizerId, approverAccountId);
    }
}
