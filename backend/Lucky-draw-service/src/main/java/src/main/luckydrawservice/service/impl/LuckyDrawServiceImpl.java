package src.main.luckydrawservice.service.impl;

import lombok.RequiredArgsConstructor;
import org.apache.kafka.common.errors.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import src.main.luckydrawservice.client.EventClient;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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

    @Autowired
    private EventClient eventClient;

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
        luckyDraw.setStatus(DrawStatus.PENDING);
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
                        prize.setWinProbabilityPercent(prizeReq.getWinProbabilityPercent());
                        return prize;
            }).collect(Collectors.toList());

            prizeRepository.saveAll(prizes);
        }

        try {
            eventClient.updateLuckyDrawId(request.getEventId(), savedDraw.getId());
        } catch (Exception e) {
            throw new RuntimeException("Lỗi kết nối với Event-Service: " + e.getMessage());
        }
        return luckyDraw;
    }

    @Override
    @Transactional
    public LuckyDraw updateLuckyDraw(String id, LuckyDrawCreateRequest request, String createdByAccountId) {
        // 1. Tìm LuckyDraw dựa trên ID của vòng quay (id), không phải accountId
        LuckyDraw existingDraw = luckyDrawRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vòng quay với ID: " + id));

        // 3. Cập nhật các thông tin cơ bản
        existingDraw.setTitle(request.getTitle());
        existingDraw.setDescription(request.getDescription());
        existingDraw.setStartTime(request.getStartTime());
        existingDraw.setEndTime(request.getEndTime());
        existingDraw.setAllowMultipleWins(request.isAllowMultipleWins());

        // Cẩn thận: Nếu request.getStatus() null sẽ gây lỗi, nên check trước
        if (request.getStatus() != null) {
            existingDraw.setStatus(request.getStatus());
        }
        existingDraw.setDeleted(request.isDeleted());
        // 4. Lưu LuckyDraw
        LuckyDraw savedDraw = luckyDrawRepository.save(existingDraw);

        // 5. Cập nhật giải thưởng
        prizeRepository.deleteByLuckyDrawId(id);

        if (request.getPrizes() != null && !request.getPrizes().isEmpty()) {
            List<Prize> newPrizes = request.getPrizes().stream()
                    .map(prizeReq -> {
                        Prize prize = new Prize();
                        prize.setLuckyDraw(savedDraw);
                        prize.setName(prizeReq.getName());
                        prize.setQuantity(prizeReq.getQuantity());
                        prize.setRemainingQuantity(prizeReq.getQuantity());
                        prize.setWinProbabilityPercent(prizeReq.getWinProbabilityPercent());
                        return prize;
                    }).collect(Collectors.toList());

            prizeRepository.saveAll(newPrizes);
        }

        return savedDraw;
    }

    @Override
    public LuckyDraw findById(String luckyDrawId) {
        return luckyDrawRepository.findById(luckyDrawId).orElse(null);
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

        if (luckyDraw.getStatus() != DrawStatus.ACTIVE) {
            throw new IllegalStateException("Chương trình quay thưởng hiện không khả dụng (đã kết thúc hoặc chưa bắt đầu)");
        }

        // 2. Kiểm tra lượt quay: Tìm lượt quay có status VALID
        DrawEntry entry = drawEntryRepository.findFirstByLuckyDrawIdAndUserProfileIdAndStatus(luckyDrawId, userProfileId, EntryStatus.VALID)
                .orElseThrow(() -> new IllegalArgumentException("Bạn không có lượt quay hợp lệ cho sự kiện này"));

        // 3. Lấy danh sách giải thưởng thực tế còn quà
        List<Prize> availablePrizes = prizeRepository.findByLuckyDrawIdAndRemainingQuantityGreaterThan(luckyDrawId, 0);

        // 4. Nếu hết giải thưởng trong hệ thống → Mặc định trúng ô "Chúc may mắn" (giải có tỉ lệ cao nhất hoặc mặc định)
        if (availablePrizes.isEmpty()) {
            entry.setStatus(EntryStatus.USED); // Vẫn đánh dấu đã dùng lượt
            drawEntryRepository.save(entry);
            return new DrawResultResponse("Chúc bạn may mắn lần sau!", null);
        }

        // 5. Logic quay thưởng theo xác suất (Weighted Random)
        BigDecimal randomPercent = BigDecimal.valueOf(random.nextDouble() * 100);
        BigDecimal cumulative = BigDecimal.ZERO;
        Prize winningPrize = null;

        for (Prize prize : availablePrizes) {
            BigDecimal probability = prize.getWinProbabilityPercent() != null ? prize.getWinProbabilityPercent() : BigDecimal.ZERO;
            cumulative = cumulative.add(probability);
            if (randomPercent.compareTo(cumulative) <= 0) {
                winningPrize = prize;
                break;
            }
        }

        // 6. Nếu số ngẫu nhiên rơi vào khoảng không có giải (ví dụ tổng % < 100)
        if (winningPrize == null) {
            entry.setStatus(EntryStatus.USED);
            drawEntryRepository.save(entry);
            return new DrawResultResponse("Chúc bạn may mắn lần sau!", null);
        }

        // 7. Thực hiện trừ số lượng và lưu kết quả
        winningPrize.setRemainingQuantity(winningPrize.getRemainingQuantity() - 1);
        prizeRepository.save(winningPrize);

        entry.setStatus(EntryStatus.USED); // Đổi trạng thái lượt quay thành đã dùng
        drawEntryRepository.save(entry);

        DrawResult result = new DrawResult();
        result.setLuckyDraw(luckyDraw);
        result.setPrize(winningPrize);
        result.setWinnerProfileId(userProfileId);
        result.setDrawTime(LocalDateTime.now());
        result.setClaimed(false);
        drawResultRepository.save(result);

        // 8. Log để kiểm tra
        System.out.println("User " + userProfileId + " trúng giải: " + winningPrize.getName());

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
