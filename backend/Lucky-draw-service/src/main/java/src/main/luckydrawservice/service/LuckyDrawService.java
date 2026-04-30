package src.main.luckydrawservice.service;

import src.main.luckydrawservice.dto.DrawResultResponse;
import src.main.luckydrawservice.dto.LuckyDrawCreateRequest;
import src.main.luckydrawservice.dto.LuckyDrawResponse;
import src.main.luckydrawservice.entity.DrawEntry;
import src.main.luckydrawservice.entity.LuckyDraw;

import java.util.List;
import java.util.Optional;

public interface LuckyDrawService {
    LuckyDraw createLuckyDraw(LuckyDrawCreateRequest request, String createdByAccountId);
    List<LuckyDraw> getAllLuckyDraws();

    void deleteLuckyDrawByEventId(String eventId);
    void deleteLuckyDraw(String id);

    DrawResultResponse performLuckyDraw(String luckyDrawId, String token, String userProfileId, String prizeId);
    LuckyDraw updateLuckyDraw(String id, LuckyDrawCreateRequest request, String createdByAccountId);

    LuckyDraw findById(String luckyDrawId);

    void activateLuckyDraw(String luckyDrawId, String accountId);

    DrawEntry createDrawEntry(String userProfileId, String luckyDrawId);

    Optional<DrawEntry> findByLuckyDrawIdAndUserProfileId(String luckyDrawId, String userProfileId);

    Optional<LuckyDrawResponse> findByEventId(String eventId);

    List<src.main.luckydrawservice.dto.UserResponse> getParticipants(String luckyDrawId);

    void handleCheckIn(String eventId, String userProfileId);
    void handleCancelCheckIn(String eventId, String userProfileId);
}
