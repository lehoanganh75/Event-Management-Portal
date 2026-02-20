package src.main.luckydrawservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import src.main.luckydrawservice.service.LuckyDrawService;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class LuckyDrawController {
    private final LuckyDrawService luckyDrawService;
}
