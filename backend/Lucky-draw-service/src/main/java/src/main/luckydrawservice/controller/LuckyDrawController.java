package src.main.luckydrawservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import src.main.luckydrawservice.dto.DrawResultResponse;
import src.main.luckydrawservice.dto.LuckyDrawCreateRequest;
import src.main.luckydrawservice.dto.LuckyDrawResponse;
import src.main.luckydrawservice.entity.DrawEntry;
import src.main.luckydrawservice.entity.LuckyDraw;
import src.main.luckydrawservice.service.LuckyDrawService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/lucky-draws")
public class LuckyDrawController {
    private final LuckyDrawService luckyDrawService;

    public LuckyDrawController(LuckyDrawService luckyDrawService) {
        this.luckyDrawService = luckyDrawService;
    }

    @GetMapping
    public ResponseEntity<List<LuckyDraw>> getAllLuckyDraws() {
        return ResponseEntity.ok(luckyDrawService.getAllLuckyDraws());
    }

    @GetMapping("/{luckyDrawId}")
    public ResponseEntity<LuckyDraw> getLuckyDrawByLuckyDrawId(@PathVariable String luckyDrawId) {
        return ResponseEntity.ok(luckyDrawService.findById(luckyDrawId));
    }

    @GetMapping("/events/{eventId}")
    public ResponseEntity<Optional<LuckyDrawResponse>> getLuckyDrawByEventId(@PathVariable String eventId) {
        return ResponseEntity.ok(luckyDrawService.findByEventId(eventId));
    }

    @PostMapping
    public ResponseEntity<LuckyDraw> createLuckyDraw(
            @Valid @RequestBody LuckyDrawCreateRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        String accountId = jwt.getSubject();
        return ResponseEntity.ok(luckyDrawService.createLuckyDraw(request, accountId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LuckyDraw> updateLuckyDraw(
            @PathVariable String id, // Lấy ID từ URL
            @Valid @RequestBody LuckyDrawCreateRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        String accountId = jwt.getSubject();
        return ResponseEntity.ok(luckyDrawService.updateLuckyDraw(id, request, accountId));
    }

    @GetMapping("/{luckyDrawId}/participants")
    public ResponseEntity<List<src.main.luckydrawservice.dto.UserResponse>> getParticipants(@PathVariable String luckyDrawId) {
        return ResponseEntity.ok(luckyDrawService.getParticipants(luckyDrawId));
    }

    @PostMapping("/{luckyDrawId}/spin")
    public ResponseEntity<DrawResultResponse> performLuckyDraw(
            @PathVariable String luckyDrawId,
            @RequestParam(required = false) String prizeId,
            @AuthenticationPrincipal Jwt jwt) {
        String userProfileId = jwt.getSubject();
        return ResponseEntity.ok(luckyDrawService.performLuckyDraw(luckyDrawId, null, userProfileId, prizeId));
    }

    @PostMapping("/{luckyDrawId}/admin-spin")
    public ResponseEntity<DrawResultResponse> performAdminLuckyDraw(
            @PathVariable String luckyDrawId,
            @RequestParam(required = false) String prizeId,
            @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(luckyDrawService.performLuckyDraw(luckyDrawId, token, null, prizeId));
    }

    @GetMapping("/draw-entry/{luckyDrawId}")
    public  ResponseEntity<Optional<DrawEntry>> getDrawEntry(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String luckyDrawId
    ) {
        String userId = jwt.getSubject();
        return ResponseEntity.ok(luckyDrawService.findByLuckyDrawIdAndUserProfileId(luckyDrawId, userId));
    }

    @PostMapping("/{luckyDrawId}")
    public ResponseEntity<DrawEntry> createDrawEntry(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String luckyDrawId
    ) {
        String userId = jwt.getSubject();
        return ResponseEntity.ok(luckyDrawService.createDrawEntry(userId, luckyDrawId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLuckyDraw(@PathVariable String id) {
        luckyDrawService.deleteLuckyDraw(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/events/{eventId}/soft-delete")
    public ResponseEntity<?> softDeleteByEventId(@PathVariable String eventId) {
        luckyDrawService.deleteLuckyDrawByEventId(eventId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{luckyDrawId}/activate")
    public ResponseEntity<Void> activateDraw(
            @PathVariable String luckyDrawId,
            @AuthenticationPrincipal Jwt jwt) {

        String accountId = jwt.getSubject();
        luckyDrawService.activateLuckyDraw(luckyDrawId, accountId);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/internal/events/{eventId}/check-in")
    public ResponseEntity<Void> handleCheckIn(
            @PathVariable String eventId,
            @RequestParam String userProfileId) {
        luckyDrawService.handleCheckIn(eventId, userProfileId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/internal/events/{eventId}/cancel-check-in")
    public ResponseEntity<Void> handleCancelCheckIn(
            @PathVariable String eventId,
            @RequestParam String userProfileId) {
        luckyDrawService.handleCancelCheckIn(eventId, userProfileId);
        return ResponseEntity.ok().build();
    }
}
