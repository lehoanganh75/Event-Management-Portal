package src.main.luckydrawservice.service;

import src.main.luckydrawservice.dto.DrawResultResponse;
import src.main.luckydrawservice.dto.LuckyDrawCreateRequest;
import src.main.luckydrawservice.entity.LuckyDraw;

import java.util.List;

public interface LuckyDrawService {
    LuckyDraw createLuckyDraw(LuckyDrawCreateRequest request, String createdByAccountId);
    List<LuckyDraw> getAllLuckyDraws();
    DrawResultResponse performLuckyDraw(String luckyDrawId, String userProfileId);
}
