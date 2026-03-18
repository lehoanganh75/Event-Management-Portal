package src.main.luckydrawservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import src.main.luckydrawservice.entity.DrawEntry;
import src.main.luckydrawservice.service.DrawEntryService;

@RestController
@RequestMapping("/api/draw-entries")
@RequiredArgsConstructor
public class DrawEntryController {
    private final DrawEntryService drawEntryService;

    @PostMapping
    public ResponseEntity<DrawEntry> createDrawEntry(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam String luckyDrawId
    ) {
        String userProfileId = jwt.getClaimAsString("userProfileId");
        return ResponseEntity.ok(drawEntryService.createDrawEntry(userProfileId, luckyDrawId));
    }
}