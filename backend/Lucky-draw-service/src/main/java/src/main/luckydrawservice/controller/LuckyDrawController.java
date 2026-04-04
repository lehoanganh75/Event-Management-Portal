package src.main.luckydrawservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import src.main.luckydrawservice.dto.DrawResultResponse;
import src.main.luckydrawservice.dto.LuckyDrawCreateRequest;
import src.main.luckydrawservice.entity.LuckyDraw;
import src.main.luckydrawservice.service.LuckyDrawService;

import java.util.List;

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

    @PostMapping
    public ResponseEntity<LuckyDraw> createLuckyDraw(
            @RequestBody LuckyDrawCreateRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        String accountId = jwt.getClaimAsString("accountId");
        return ResponseEntity.ok(luckyDrawService.createLuckyDraw(request, accountId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LuckyDraw> updateLuckyDraw(
            @PathVariable String id, // Lấy ID từ URL
            @RequestBody LuckyDrawCreateRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        String accountId = jwt.getClaimAsString("accountId");
        return ResponseEntity.ok(luckyDrawService.updateLuckyDraw(id, request, accountId));
    }

    @PostMapping("/{luckyDrawId}/spin")
    public ResponseEntity<DrawResultResponse> performLuckyDraw(
            @PathVariable String luckyDrawId,
            @AuthenticationPrincipal Jwt jwt) {
        String userProfileId = jwt.getClaimAsString("accountId");
        return ResponseEntity.ok(luckyDrawService.performLuckyDraw(luckyDrawId, userProfileId));
    }
}
