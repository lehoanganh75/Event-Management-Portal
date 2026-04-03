package src.main.luckydrawservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import src.main.luckydrawservice.entity.DrawEntry;
import src.main.luckydrawservice.service.DrawEntryService;

@RestController
@RequestMapping("/draw-entries")
@RequiredArgsConstructor
public class DrawEntryController {
    private final DrawEntryService drawEntryService;

    @GetMapping("/{luckyDrawId}")
    public  ResponseEntity<DrawEntry> getDrawEntry(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String luckyDrawId
    ) {
        String userId = jwt.getClaimAsString("accountId");
        return ResponseEntity.ok(drawEntryService.findByLuckyDrawIdAndUserProfileId(luckyDrawId, userId));
    }

    @PostMapping("/{luckyDrawId}")
    public ResponseEntity<DrawEntry> createDrawEntry(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String luckyDrawId
    ) {
        String userId = jwt.getClaimAsString("accountId");
        return ResponseEntity.ok(drawEntryService.createDrawEntry(userId, luckyDrawId));
    }
}