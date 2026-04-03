package src.main.luckydrawservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import src.main.luckydrawservice.service.DrawResultService;

@RestController
@RequestMapping("/draw-results")
@RequiredArgsConstructor
public class DrawResultController {
}
