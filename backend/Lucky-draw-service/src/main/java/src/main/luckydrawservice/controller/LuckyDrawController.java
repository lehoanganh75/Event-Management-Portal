package src.main.luckydrawservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import src.main.luckydrawservice.dto.DrawResultResponse;
import src.main.luckydrawservice.dto.LuckyDrawCreateRequest;
import src.main.luckydrawservice.entity.DrawEntry;
import src.main.luckydrawservice.entity.LuckyDraw;
import src.main.luckydrawservice.service.LuckyDrawService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/lucky-draws")
@RequiredArgsConstructor
public class LuckyDrawController {
    private final LuckyDrawService luckyDrawService;

    @GetMapping
    public ResponseEntity<List<LuckyDraw>> getAllLuckyDraws() {
        return ResponseEntity.ok(luckyDrawService.getAllLuckyDraws());
    }

    @GetMapping("/{luckyDrawId}")
    public ResponseEntity<LuckyDraw> getLuckyDrawByLuckyDrawId(@PathVariable String luckyDrawId) {
        return ResponseEntity.ok(luckyDrawService.findById(luckyDrawId));
    }

    @GetMapping("/events/{eventId}")
    public ResponseEntity<Optional<LuckyDraw>> getLuckyDrawByEventId(@PathVariable String eventId) {
        return ResponseEntity.ok(luckyDrawService.findByEventId(eventId));
    }

    @PostMapping
    public ResponseEntity<LuckyDraw> createLuckyDraw(
            @RequestBody LuckyDrawCreateRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        String accountId = jwt.getSubject();
        return ResponseEntity.ok(luckyDrawService.createLuckyDraw(request, accountId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LuckyDraw> updateLuckyDraw(
            @PathVariable String id, // Lấy ID từ URL
            @RequestBody LuckyDrawCreateRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        String accountId = jwt.getSubject();
        return ResponseEntity.ok(luckyDrawService.updateLuckyDraw(id, request, accountId));
    }

    @PostMapping("/{luckyDrawId}/spin")
    public ResponseEntity<DrawResultResponse> performLuckyDraw(
            @PathVariable String luckyDrawId,
            @AuthenticationPrincipal Jwt jwt) {
        String userProfileId = jwt.getSubject();
        return ResponseEntity.ok(luckyDrawService.performLuckyDraw(luckyDrawId, userProfileId));
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
}
