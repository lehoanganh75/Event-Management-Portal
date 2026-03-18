package src.main.luckydrawservice.service.impl;

import lombok.RequiredArgsConstructor;
import org.apache.kafka.common.errors.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import src.main.luckydrawservice.dto.DrawResultResponse;
import src.main.luckydrawservice.dto.LuckyDrawCreateRequest;
import src.main.luckydrawservice.dto.PrizeResponse;
import src.main.luckydrawservice.entity.*;
import src.main.luckydrawservice.repository.DrawEntryRepository;
import src.main.luckydrawservice.repository.DrawResultRepository;
import src.main.luckydrawservice.repository.LuckyDrawRepository;
import src.main.luckydrawservice.repository.PrizeRepository;
import src.main.luckydrawservice.service.LuckyDrawService;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LuckyDrawServiceImpl implements LuckyDrawService {
    private final PrizeRepository prizeRepository;
    private final LuckyDrawRepository luckyDrawRepository;
    private final DrawEntryRepository drawEntryRepository;
    private final DrawResultRepository drawResultRepository;

    private final Random random = new SecureRandom();

    @Override
    @Transactional
    public LuckyDraw createLuckyDraw(LuckyDrawCreateRequest request, String createdByAccountId) {
        LuckyDraw luckyDraw = new LuckyDraw();
        luckyDraw.setEventId(request.getEventId());
        luckyDraw.setCreatedByAccountId(createdByAccountId);
        luckyDraw.setTitle(request.getTitle());
        luckyDraw.setDescription(request.getDescription());
        luckyDraw.setStartTime(request.getStartTime());
        luckyDraw.setEndTime(request.getEndTime());
        luckyDraw.setStatus(DrawStatus.Pending);
        luckyDraw.setAllowMultipleWins(request.isAllowMultipleWins());

        LuckyDraw savedDraw = luckyDrawRepository.save(luckyDraw);

        if (request.getPrizes() != null && !request.getPrizes().isEmpty()) {
            List<Prize> prizes = request.getPrizes()
                    .stream()
                    .map(prizeReq -> {
                        Prize prize = new Prize();
                        prize.setLuckyDraw(savedDraw);
                        prize.setName(prizeReq.getName());
                        prize.setQuantity(prizeReq.getQuantity());
                        prize.setRemainingQuantity(prizeReq.getQuantity());
                        return prize;
            }).collect(Collectors.toList());

            prizeRepository.saveAll(prizes);
        }
        return luckyDraw;
    }

    @Override
    @Transactional
    public List<LuckyDraw> getAllLuckyDraws() {
        return luckyDrawRepository.findAll();
    }

    @Override
    @Transactional
    public DrawResultResponse performLuckyDraw(String luckyDrawId, String userProfileId) {
        // 1. Kiểm tra LuckyDraw tồn tại và đang active
        LuckyDraw luckyDraw = luckyDrawRepository.findById(luckyDrawId)
                .orElseThrow(() -> new ResourceNotFoundException("Lucky Draw not found: " + luckyDrawId));

        if (luckyDraw.getStatus() != DrawStatus.Active) {
            throw new IllegalStateException("Lucky Draw phải đang ACTIVE");
        }

        // 2. Kiểm tra lượt quay hợp lệ của user
        DrawEntry entry = (DrawEntry) drawEntryRepository.findByLuckyDrawIdAndUserProfileId(luckyDrawId, userProfileId)
                .orElseThrow(() -> new IllegalArgumentException("User không có lượt quay hợp lệ"));

        if (entry.getStatus() != EntryStatus.Valid) {
            throw new IllegalStateException("Lượt quay không hợp lệ: " + entry.getStatus());
        }

        // 3. Lấy danh sách giải thưởng còn lại (remainingQuantity > 0)
        List<Prize> availablePrizes = prizeRepository.findByLuckyDrawIdAndRemainingQuantityGreaterThan(luckyDrawId, 0);

        // 4. Nếu hết giải thưởng → luôn "Chúc may mắn lần sau"
        if (availablePrizes.isEmpty()) {
            return new DrawResultResponse("Chúc may mắn lần sau", null);
        }

        Prize winningPrize;

        // Quay ngẫu nhiên theo tỉ lệ phần trăm
        BigDecimal randomPercent = BigDecimal.valueOf(random.nextDouble() * 100);

        BigDecimal cumulative = BigDecimal.ZERO;
        winningPrize = null;

        for (Prize prize : availablePrizes) {
            cumulative = cumulative.add(prize.getWinProbabilityPercent());
            if (randomPercent.compareTo(cumulative) <= 0) {
                winningPrize = prize;
                break;
            }
        }

        // Nếu không trúng (randomPercent > tổng tỉ lệ) → không trúng
        if (winningPrize == null) {
            drawEntryRepository.save(entry);
            return new DrawResultResponse("Chúc may mắn lần sau", null);
        }

        // 6. Trúng giải → giảm remainingQuantity
        winningPrize.setRemainingQuantity(winningPrize.getRemainingQuantity() - 1);
        prizeRepository.save(winningPrize);

        // 7. Reset guaranteedWin (vì đã trúng)
        entry.setStatus(EntryStatus.Used);
        drawEntryRepository.save(entry);

        DrawResult result = new DrawResult();
        result.setLuckyDraw(luckyDraw);
        result.setPrize(winningPrize);
        result.setWinnerProfileId(userProfileId);
        result.setDrawTime(LocalDateTime.now());
        result.setClaimed(false);

        drawResultRepository.save(result);

        // 9. Cập nhật LuckyDraw nếu hết giải
        if (availablePrizes.stream().allMatch(p -> p.getRemainingQuantity() == 0)) {
            luckyDraw.setStatus(DrawStatus.Completed);
            luckyDrawRepository.save(luckyDraw);
        }

        System.out.println("Lucky Draw: " + luckyDrawId + "User: " + userProfileId + "trúng giải: " + winningPrize.getName());

        return new DrawResultResponse("Chúc mừng! Bạn đã trúng giải: " + winningPrize.getName(), toPrizeResponse(winningPrize));
    }

    private PrizeResponse toPrizeResponse(Prize prize) {
        PrizeResponse prizeResponse = new PrizeResponse();
        prizeResponse.setName(prize.getName());
        prizeResponse.setDescription(prize.getDescription());
        prizeResponse.setQuantity(prize.getQuantity());
        return prizeResponse;
    }
}
