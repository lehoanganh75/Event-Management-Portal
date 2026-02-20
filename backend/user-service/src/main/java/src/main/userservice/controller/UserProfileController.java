package src.main.userservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import src.main.userservice.service.UserProfileService;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserProfileController {
    private final UserProfileService profileService;
}
