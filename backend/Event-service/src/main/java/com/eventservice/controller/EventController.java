package com.eventservice.controller;

import com.eventservice.dto.core.request.EventCreateRequest;
import com.eventservice.dto.core.response.EventResponse;
import com.eventservice.dto.core.response.EventSummaryResponse;
import com.eventservice.dto.plan.request.EventPlanCreateRequest;
import com.eventservice.dto.plan.response.EventPlanResponse;
import com.eventservice.entity.core.*;
import com.eventservice.entity.people.*;
import com.eventservice.entity.registration.*;
import com.eventservice.entity.enums.OrganizerRole;
import com.eventservice.service.EventOrganizerService;
import com.eventservice.service.EventPresenterService;
import com.eventservice.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import com.eventservice.entity.enums.EventStatus;
import com.eventservice.entity.enums.EventType;
import com.eventservice.repository.OrganizationRepository;
import com.eventservice.repository.EventTemplateRepository;
import com.eventservice.service.S3Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.MediaType;

import java.util.*;
import java.util.stream.Collectors;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
@Slf4j
public class EventController {
    private final EventService eventService;
    private final EventPresenterService presenterService;
    private final EventOrganizerService organizerService;
    private final OrganizationRepository organizationRepository;
    private final EventTemplateRepository templateRepository;
    private final S3Service s3Service;

    // --- 1. NHÓM CÔNG KHAI (DÀNH CHO USER & GUEST) ---

    @GetMapping
    public ResponseEntity<List<EventResponse>> getEventsForUser() {
        return ResponseEntity.ok(eventService.findEventsForUser());
    }

    @GetMapping("/ongoing")
    public ResponseEntity<List<EventResponse>> getOngoingEvents() {
        return ResponseEntity.ok(eventService.getOngoingEvents());
    }

    @GetMapping("/upcoming-week")
    public ResponseEntity<List<EventResponse>> getUpcomingEvents() {
        return ResponseEntity.ok(eventService.getUpcomingEventsThisWeek());
    }

    @GetMapping("/featured")
    public ResponseEntity<List<EventResponse>> getFeaturedEvents() {
        return ResponseEntity.ok(eventService.getFeaturedEvents());
    }

    @GetMapping("/news")
    public ResponseEntity<List<EventResponse>> getCompletedEvents() {
        return ResponseEntity.ok(eventService.getCompletedEvents());
    }

    // --- 2. NHÓM QUẢN TRỊ (DÀNH CHO ADMIN) ---

    @GetMapping("/admin/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<EventResponse>> getEventsForAdmin() {
        return ResponseEntity.ok(eventService.findEventsForAdmin());
    }

    @GetMapping("/by-statuses")
    public ResponseEntity<List<EventResponse>> getEventsByStatuses(
            @RequestParam List<String> statuses,
            @AuthenticationPrincipal Jwt jwt) {
        String accountId = (jwt != null) ? jwt.getSubject() : null;
        return ResponseEntity.ok(eventService.getEventsByStatuses(statuses, accountId));
    }

    // --- 3. NHÓM CÁ NHÂN HÓA (DÀNH CHO TRANG CÁ NHÂN) ---
    @GetMapping("/my-events")
    public ResponseEntity<List<EventResponse>> getMyEvents(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(value = "role", required = false, defaultValue = "ALL") String role) {

        String accountId = jwt.getSubject();
        return ResponseEntity.ok(eventService.findMyEventsByRole(accountId, role));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventResponse> getEventById(
            @PathVariable String id,
            @AuthenticationPrincipal Jwt jwt) {
        String accountId = jwt != null ? jwt.getSubject() : null;
        return ResponseEntity.ok(eventService.getEventById(id, accountId));
    }

    @PostMapping("/{eventId}/organizers/leave")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> requestToLeave(
            @PathVariable String eventId,
            @AuthenticationPrincipal Jwt jwt) {
        String accountId = jwt.getSubject();
        organizerService.requestToLeave(eventId, accountId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/organizers/{organizerId}/approve-leave")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> approveLeaveRequest(
            @PathVariable String organizerId,
            @AuthenticationPrincipal Jwt jwt) {
        String approverAccountId = jwt.getSubject();
        organizerService.approveLeaveRequest(organizerId, approverAccountId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/organizers/{organizerId}/reject-leave")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> rejectLeaveRequest(
            @PathVariable String organizerId,
            @AuthenticationPrincipal Jwt jwt) {
        String approverAccountId = jwt.getSubject();
        organizerService.rejectLeaveRequest(organizerId, approverAccountId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/organizer-roles")
    public ResponseEntity<List<String>> getMyOrganizerRoles(@AuthenticationPrincipal Jwt jwt) {
        String accountId = jwt.getSubject();
        return ResponseEntity.ok(eventService.getOrganizerRoles(accountId));
    }

    @PutMapping("/{eventId}/lucky-draw")
    public ResponseEntity<?> updateLuckyDrawId(
            @PathVariable String eventId,
            @RequestParam(required = false, defaultValue = "true") boolean hasLuckyDraw) {

        eventService.updateLuckyDrawId(eventId, hasLuckyDraw);
        return ResponseEntity.ok().build();
    }

    ////////////////////////////////

    // 1. Dành cho Sinh viên/Người dùng (Chỉ lấy sự kiện chưa xóa)

    @GetMapping("/plans")
    public ResponseEntity<List<EventPlanResponse>> getAllPlans() {
        return ResponseEntity.ok(eventService.getAllPlansEnriched());
    }

    @GetMapping("/plans/my")
    public ResponseEntity<List<EventPlanResponse>> getMyPlans(@AuthenticationPrincipal Jwt jwt) {
        String accountId = jwt.getSubject();
        return ResponseEntity.ok(eventService.getPlansByAccountId(accountId));
    }

    @GetMapping("/plans/status/{statusName}")
    public ResponseEntity<List<EventPlanResponse>> getPlansByStatus(
            @PathVariable String statusName,
            @AuthenticationPrincipal Jwt jwt) {
        String accountId = jwt.getSubject();
        try {
            EventStatus status = Arrays.stream(EventStatus.values())
                    .filter(s -> s.name().equalsIgnoreCase(statusName))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Invalid status: " + statusName));

            if (!isPlanStatus(status)) {
                return ResponseEntity.badRequest().build();
            }

            List<EventPlanResponse> plans = eventService.getPlansByAccountId(accountId)
                    .stream()
                    .filter(p -> p.getStatus().equals(status.name()))
                    .collect(Collectors.toList());

            for (EventPlanResponse plan : plans) {
                log.info("Plan {} - targetObjects: {}", plan.getId(), plan.getTargetObjects());
                log.info("Plan {} - presentersList: {}", plan.getId(), plan.getPresentersList());
                log.info("Plan {} - organizersList: {}", plan.getId(), plan.getOrganizersList());
            }

            return ResponseEntity.ok(plans);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/plans")
    public ResponseEntity<?> createPlan(@Valid @RequestBody EventPlanCreateRequest request) {
        try {
            Event event = new Event();

            // Mapping Organization (Required)
            String orgId = request.getOrganizationId();
            if (orgId == null || orgId.equals("org-it")) {
                // Fallback: Tìm organization đầu tiên hoặc xử lý theo nghiệp vụ
                orgId = organizationRepository.findAll().stream()
                        .findFirst()
                        .map(Organization::getId)
                        .orElse(null);
            }

            if (orgId != null) {
                organizationRepository.findById(orgId).ifPresent(event::setOrganization);
            }

            // Mapping Template (Optional)
            if (request.getTemplateId() != null && !request.getTemplateId().equals("0")) {
                templateRepository.findById(request.getTemplateId()).ifPresent(event::setTemplate);
            }

            String title = request.getTitle();
            if (title == null || title.trim().isEmpty()) {
                title = request.getEventTopic();
            }
            event.setTitle(title);

            event.setDescription(request.getDescription());
            event.setCoverImage(request.getCoverImage());
            event.setEventTopic(request.getEventTopic());
            event.setLocation(request.getLocation());
            event.setEventMode(request.getEventMode());

            // Safe Enum mapping
            try {
                event.setType(EventType.valueOf(request.getType().toUpperCase()));
            } catch (Exception e) {
                event.setType(EventType.OTHER);
            }

            event.setStartTime(request.getStartTime());
            event.setEndTime(request.getEndTime());
            event.setRegistrationDeadline(request.getRegistrationDeadline());
            event.setMaxParticipants(request.getMaxParticipants());
            event.setRecipients(request.getRecipients());
            event.setNotes(request.getNotes());
            event.setCustomFieldsJson(request.getCustomFieldsJson());
            event.setCreatedByAccountId(request.getCreatedByAccountId());

            event.setTargetObjects(request.getTargetObjects());

            if (request.getPresenters() != null) {
                log.info("Converting {} presenters", request.getPresenters().size());
                Set<EventPresenter> presenters = request.getPresenters().stream()
                        .map(dto -> {
                            EventPresenter p = new EventPresenter();
                            p.setPresenterAccountId(dto.getAccountId());
                            // Bio and session mapping if needed
                            return p;
                        })
                        .collect(Collectors.toSet());
                event.setPresenters(presenters);
            }

            if (request.getOrganizers() != null) {
                log.info("Converting {} organizers", request.getOrganizers().size());
                Set<EventOrganizer> organizers = request.getOrganizers().stream()
                        .map(dto -> {
                            EventOrganizer o = new EventOrganizer();
                            o.setAccountId(dto.getAccountId());

                            // Safe role mapping
                            try {
                                String roleStr = dto.getRole();
                                if (roleStr != null) {
                                    o.setRole(OrganizerRole.valueOf(roleStr.toUpperCase()));
                                } else {
                                    o.setRole(OrganizerRole.MEMBER);
                                }
                            } catch (Exception e) {
                                o.setRole(OrganizerRole.MEMBER);
                            }

                            return o;
                        })
                        .collect(Collectors.toSet());

                // Gán organization cho từng organizer
                if (event.getOrganization() != null) {
                    organizers.forEach(o -> o.setOrganization(event.getOrganization()));
                }

                event.setOrganizers(organizers);
            }

            event.setStatus(EventStatus.DRAFT);

            Event created = eventService.createPlan(event);
            log.info("Plan created successfully with ID: {}", created.getId());
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (Exception e) {
            log.error("Error creating plan", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/plans/{id}")
    public ResponseEntity<?> updatePlan(@PathVariable String id, @RequestBody Event planDetails) {
        try {
            Event updated = eventService.updatePlan(id, planDetails);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/plans/{id}")
    public ResponseEntity<Void> deletePlan(@PathVariable String id) {
        eventService.deletePlan(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/plans/{id}/submit")
    public ResponseEntity<?> submitPlanForApproval(@PathVariable String id) {
        try {
            Event plan = eventService.submitPlanForApproval(id);
            return ResponseEntity.ok(plan);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/admin/plans/pending")
    public ResponseEntity<List<EventPlanResponse>> getPlansPendingApproval() {
        return ResponseEntity.ok(eventService.getPlansPendingApproval());
    }

    @GetMapping("/admin/events/pending")
    public ResponseEntity<List<EventPlanResponse>> getEventsPendingApproval() {
        return ResponseEntity.ok(eventService.getEventsPendingApproval());
    }

    @PatchMapping("/admin/plans/{id}/approve")
    public ResponseEntity<?> approvePlan(@PathVariable String id,
            @AuthenticationPrincipal Jwt jwt) {
        try {
            String approverId = jwt.getSubject();
            Event approved = eventService.approvePlan(id, approverId);
            return ResponseEntity.ok(approved);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/admin/plans/{id}/reject")
    public ResponseEntity<?> rejectPlan(@PathVariable String id,
            @RequestParam(required = false) String reason,
            @AuthenticationPrincipal Jwt jwt) {
        try {
            String approverId = jwt.getSubject();
            Event rejected = eventService.rejectPlan(id, approverId, reason);
            return ResponseEntity.ok(rejected);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/admin/events/{id}/approve")
    public ResponseEntity<?> approveEvent(@PathVariable String id,
            @AuthenticationPrincipal Jwt jwt) {
        try {
            String approverId = jwt.getSubject();
            Event approved = eventService.approveEvent(id, approverId);
            return ResponseEntity.ok(approved);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/admin/events/{id}/reject")
    public ResponseEntity<?> rejectEvent(@PathVariable String id,
            @RequestParam(required = false) String reason,
            @AuthenticationPrincipal Jwt jwt) {
        try {
            String approverId = jwt.getSubject();
            Event rejected = eventService.rejectEvent(id, approverId, reason);
            return ResponseEntity.ok(rejected);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/plans/{planId}/create-event")
    public ResponseEntity<?> createEventFromPlan(@PathVariable String planId,
            @RequestBody Event eventDetails,
            @AuthenticationPrincipal Jwt jwt) {
        try {
            String accountId = jwt.getSubject();
            eventDetails.setCreatedByAccountId(accountId);
            Event newEvent = eventService.createEventFromPlan(planId, eventDetails);
            return new ResponseEntity<>(newEvent, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/start")
    public ResponseEntity<?> startEvent(@PathVariable String id) {
        try {
            Event event = eventService.startEvent(id);
            return ResponseEntity.ok(event);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<?> completeEvent(@PathVariable String id) {
        try {
            Event event = eventService.completeEvent(id);
            return ResponseEntity.ok(event);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancelEvent(@PathVariable String id,
            @RequestParam(required = false) String reason) {
        try {
            Event event = eventService.cancelEvent(id, reason);
            return ResponseEntity.ok(event);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/summary")
    public ResponseEntity<EventSummaryResponse> getEventSummary(@PathVariable String id) {
        return ResponseEntity.ok(eventService.getEventSummary(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Event> createEvent(
            @RequestPart("request") EventCreateRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @AuthenticationPrincipal Jwt jwt) {
        Event event = request.getEvent();

        if (event == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Event null");
        }

        event.setCreatedByAccountId(jwt.getSubject());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(eventService.createEvent(event, request.getOrganizerIds(), request.getPresenterIds(),
                        request.getInvitations(), file));
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Event> createEvent(
            @RequestBody EventCreateRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        Event event = request.getEvent();

        if (event == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Event null");
        }

        event.setCreatedByAccountId(jwt.getSubject());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(eventService.createEvent(event, request.getOrganizerIds(), request.getPresenterIds(),
                        request.getInvitations(), null));
    }

    @PostMapping("/upload-image")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        String url = s3Service.uploadFile(file);
        return ResponseEntity.ok(Map.of("url", url));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable String id,
            @Valid @RequestBody Event eventDetails) {
        Event updated = eventService.updateEvent(id, eventDetails);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable String id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    private boolean isPlanStatus(EventStatus status) {
        return status == EventStatus.DRAFT ||
                status == EventStatus.PLAN_PENDING_APPROVAL ||
                status == EventStatus.PLAN_APPROVED;
    }

    @GetMapping("/{eventId}/presenters")
    public ResponseEntity<List<EventPresenter>> getPresenters(@PathVariable String eventId) {
        return ResponseEntity.ok(presenterService.getPresenters(eventId));
    }

    @PostMapping("/{eventId}/presenters")
    public ResponseEntity<EventPresenter> addPresenter(
            @PathVariable String eventId,
            @RequestBody EventPresenter presenter,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(presenterService.addPresenter(eventId, presenter));
    }

    @DeleteMapping("/presenters/{presenterId}")
    public ResponseEntity<Void> removePresenter(@PathVariable String presenterId) {
        presenterService.removePresenter(presenterId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/presenters/{presenterId}/topic")
    public ResponseEntity<EventPresenter> updatePresenterTopic(
            @PathVariable String presenterId,
            @RequestParam String topic) {
        return ResponseEntity.ok(presenterService.updatePresenterTopic(presenterId, topic));
    }

    @PatchMapping("/presenters/{presenterId}/order")
    public ResponseEntity<EventPresenter> updatePresenterOrder(
            @PathVariable String presenterId,
            @RequestParam Integer orderIndex) {
        return ResponseEntity.ok(presenterService.updatePresenterOrder(presenterId, orderIndex));
    }

    @GetMapping("/{eventId}/organizers")
    public ResponseEntity<List<EventOrganizer>> getOrganizers(@PathVariable String eventId) {
        return ResponseEntity.ok(organizerService.getOrganizers(eventId));
    }

    @PostMapping("/{eventId}/organizers")
    public ResponseEntity<EventOrganizer> addOrganizer(
            @PathVariable String eventId,
            @RequestBody EventOrganizer organizer,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(organizerService.addOrganizer(eventId, organizer));
    }

    @DeleteMapping("/organizers/{organizerId}")
    public ResponseEntity<Void> removeOrganizer(@PathVariable String organizerId) {
        organizerService.removeOrganizer(organizerId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/organizers/{organizerId}/role")
    public ResponseEntity<EventOrganizer> updateOrganizerRole(
            @PathVariable String organizerId,
            @RequestParam String role) {
        OrganizerRole organizerRole = OrganizerRole.valueOf(role.toUpperCase());
        return ResponseEntity.ok(organizerService.updateOrganizerRole(organizerId, organizerRole));
    }

    @PostMapping("/{eventId}/invite")
    public ResponseEntity<Map<String, String>> inviteParticipants(
            @PathVariable String eventId,
            @RequestBody com.eventservice.dto.registration.request.EventInvitationRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        String organizerId = jwt.getSubject();
        Map<String, String> response = eventService.inviteParticipants(eventId, organizerId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{eventId}/invitations")
    public ResponseEntity<EventInvitation> getInvitationDetails(
            @PathVariable String eventId,
            @RequestParam String token) {
        return ResponseEntity.ok(eventService.getInvitationByToken(eventId, token));
    }

    @PostMapping("/{eventId}/reject-invite")
    public ResponseEntity<Map<String, String>> rejectInvite(
            @PathVariable String eventId,
            @RequestParam String token,
            @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(eventService.rejectInvite(eventId, token, reason));
    }

    @PostMapping("/{eventId}/accept-invite")
    public ResponseEntity<Map<String, String>> acceptInvite(
            @PathVariable String eventId,
            @RequestParam String token) {

        log.info("Xác nhận lời mời cho sự kiện: {} với token: {}", eventId, token);
        Map<String, String> response = eventService.acceptInvite(eventId, token);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{eventId}/organizer-invitations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> sendOrganizerInvitations(
            @PathVariable String eventId,
            @RequestBody Map<String, List<Map<String, Object>>> request) {
        eventService.sendOrganizerInvitations(eventId, request.get("invitations"));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{eventId}/presenter-invitations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> sendPresenterInvitations(
            @PathVariable String eventId,
            @RequestBody Map<String, List<Map<String, Object>>> request) {
        eventService.sendPresenterInvitations(eventId, request.get("invitations"));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/invitations/{invitationId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> cancelInvitation(@PathVariable String invitationId) {
        eventService.cancelInvitation(invitationId);
        return ResponseEntity.noContent().build();
    }
}
