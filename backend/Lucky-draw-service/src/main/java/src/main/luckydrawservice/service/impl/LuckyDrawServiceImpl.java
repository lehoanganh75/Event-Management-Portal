package src.main.luckydrawservice.service.impl;

import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.apache.kafka.common.errors.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import src.main.luckydrawservice.client.EventClient;
import src.main.luckydrawservice.client.IdentityClient;
import src.main.luckydrawservice.dto.*;
import src.main.luckydrawservice.entity.*;
import src.main.luckydrawservice.repository.DrawEntryRepository;
import src.main.luckydrawservice.repository.DrawResultRepository;
import src.main.luckydrawservice.repository.LuckyDrawRepository;
import src.main.luckydrawservice.repository.PrizeRepository;
import src.main.luckydrawservice.service.LuckyDrawService;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class LuckyDrawServiceImpl implements LuckyDrawService {
    private final PrizeRepository prizeRepository;
    private final LuckyDrawRepository luckyDrawRepository;
    private final DrawEntryRepository drawEntryRepository;
    private final DrawResultRepository drawResultRepository;

    private final Random random = new SecureRandom();

    private final EventClient eventClient;

    private final IdentityClient identityClient;

    public LuckyDrawServiceImpl(PrizeRepository prizeRepository,
                                LuckyDrawRepository luckyDrawRepository,
                                DrawEntryRepository drawEntryRepository,
                                DrawResultRepository drawResultRepository,
                                EventClient eventClient,
                                IdentityClient identityClient) {
        this.prizeRepository = prizeRepository;
        this.luckyDrawRepository = luckyDrawRepository;
        this.drawEntryRepository = drawEntryRepository;
        this.drawResultRepository = drawResultRepository;
        this.eventClient = eventClient;
        this.identityClient = identityClient;
    }

    @Transactional
    @Override
    public LuckyDraw createLuckyDraw(LuckyDrawCreateRequest request, String createdByAccountId) {
        try {
            eventClient.updateLuckyDrawId(request.getEventId());
        } catch (FeignException.Conflict e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Sự kiện này đã có vòng quay, không thể tạo thêm.");
        } catch (Exception e) {
            throw new RuntimeException("Không thể kết nối tới Event-Service để xác thực: " + e.getMessage());
        }

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

        return savedDraw;
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

    @Transactional
    @Override
    public void deleteLuckyDrawByEventId(String eventId){
        LuckyDraw luckyDraw = luckyDrawRepository.findByEventId(eventId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dữ liệu LuckyDraw cho sự kiện ID: " + eventId));

        luckyDraw.setDeleted(true);
        luckyDraw.setUpdatedAt(LocalDateTime.now());

        luckyDrawRepository.save(luckyDraw);
    }

    @Override
    @Transactional
    public DrawResultResponse performLuckyDraw(String luckyDrawId, String userProfileId) {
        // 1. Kiểm tra LuckyDraw tồn tại và đang active
        LuckyDraw luckyDraw = luckyDrawRepository.findById(luckyDrawId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Lucky Draw not found: " + luckyDrawId));

        if (luckyDraw.getStatus() != DrawStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Chương trình quay thưởng hiện không khả dụng (đã kết thúc hoặc chưa bắt đầu)");
        }

        // 2. Kiểm tra lượt quay: Tìm lượt quay có status VALID
        DrawEntry entry = drawEntryRepository.findFirstByLuckyDrawIdAndUserProfileIdAndStatus(luckyDrawId, userProfileId, EntryStatus.VALID)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Bạn không có lượt quay hợp lệ cho sự kiện này"));

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

    @Transactional
    @Override
    public void activateLuckyDraw(String luckyDrawId, String accountId) {
        // 1. Tìm vòng quay
        LuckyDraw luckyDraw = luckyDrawRepository.findById(luckyDrawId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Không tìm thấy vòng quay với ID: " + luckyDrawId));

        // 2. Kiểm tra quyền sở hữu (Chỉ người tạo mới được kích hoạt)
        if (!luckyDraw.getCreatedByAccountId().equals(accountId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền kích hoạt vòng quay này");
        }

        // 3. Kiểm tra trạng thái hiện tại (Chỉ kích hoạt nếu đang PENDING)
        if (luckyDraw.getStatus() != DrawStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Vòng quay đã được kích hoạt hoặc đã kết thúc");
        }

        // 4. Kiểm tra xem đã có giải thưởng chưa (Tránh kích hoạt vòng quay trống)
        if (luckyDraw.getPrizes() == null || luckyDraw.getPrizes().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Vòng quay phải có ít nhất một giải thưởng trước khi kích hoạt");
        }

        // 5. Cập nhật trạng thái và thời gian cập nhật
        luckyDraw.setStatus(DrawStatus.ACTIVE);
        luckyDraw.setUpdatedAt(LocalDateTime.now());

        luckyDrawRepository.save(luckyDraw);

        // Log thông tin
        System.out.println("Vòng quay '" + luckyDraw.getTitle() + "' đã được kích hoạt bởi: " + accountId);
    }

    @Transactional
    @Override
    public DrawEntry createDrawEntry(String userProfileId, String luckyDrawId) {
        LuckyDraw luckyDraw = luckyDrawRepository.findById(luckyDrawId)
                .orElseThrow(() -> new ResourceNotFoundException("Lucky Draw not found"));

        DrawEntry drawEntryEntity = new DrawEntry();
        drawEntryEntity.setUserProfileId(userProfileId);
        drawEntryEntity.setLuckyDraw(luckyDraw);
        drawEntryEntity.setStatus(EntryStatus.VALID);
        return drawEntryRepository.save(drawEntryEntity);
    }

    @Transactional
    @Override
    public Optional<DrawEntry> findByLuckyDrawIdAndUserProfileId(String luckyDrawId, String userProfileId) {
        // Trả về Optional rỗng nếu không tìm thấy, Jackson sẽ chuyển thành null khi gửi về FE
        return drawEntryRepository.findByLuckyDrawIdAndUserProfileId(luckyDrawId, userProfileId);
    }

    @Override
    public Optional<LuckyDrawResponse> findByEventId(String eventId) {
        // 1. Tìm LuckyDraw từ Repository
        LuckyDraw luckyDraw = luckyDrawRepository.findByEventIdAndIsDeletedFalse(eventId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy vòng quay cho sự kiện: " + eventId));

        // 2. Thu thập tất cả ID cần lấy Profile (Người tạo + Danh sách người thắng)
        Set<String> allAccountIds = new HashSet<>();

        if (luckyDraw.getCreatedByAccountId() != null) {
            allAccountIds.add(luckyDraw.getCreatedByAccountId());
        }

        if (luckyDraw.getResults() != null) {
            luckyDraw.getResults().forEach(res -> {
                if (!res.isClaimed() && res.getWinnerProfileId() != null) {
                    allAccountIds.add(res.getWinnerProfileId());
                }
            });
        }

        // 3. Gọi Identity Service lấy thông tin User hàng loạt
        Map<String, UserDto> userMap = new HashMap<>();
        if (!allAccountIds.isEmpty()) {
            try {
                // Chuyển Set sang List để gọi IdentityClient
                List<UserDto> users = identityClient.getUsersByIds(new ArrayList<>(allAccountIds));
                userMap = users.stream().collect(Collectors.toMap(UserDto::getId, u -> u));
            } catch (Exception e) {
                // Ghi log lỗi thay vì throw exception để tránh sập trang nếu Identity Service gặp sự cố nhẹ
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lỗi không gọi sang identity-service: " + e.getMessage());
            }
        }

        // 4. Map kết quả (Enrich data)
        Map<String, UserDto> finalUserMap = userMap;

        List<LuckyDrawResponse.DrawResultEnriched> enrichedResults = luckyDraw.getResults().stream()
                // CHỈ LẤY những kết quả chưa bị xóa
                .filter(res -> !res.isClaimed())
                .map(res -> {
                    // --- Bước A: Convert Prize Entity -> DTO ---
                    PrizeDto pDto = null;
                    if (res.getPrize() != null) {
                        pDto = PrizeDto.builder()
                                .id(res.getPrize().getId())
                                .prizeName(res.getPrize().getName())
                                .quantity(res.getPrize().getQuantity())
                                .description(res.getPrize().getDescription())
                                .build();
                    }

                    // --- Bước B: Convert DrawResult Entity -> DTO ---
                    DrawResultDto resDto = DrawResultDto.builder()
                            .id(res.getId())
                            .winner(finalUserMap.get(res.getWinnerProfileId()))
                            .winTime(res.getDrawTime())
                            .prize(pDto)
                            .build();

                    return new LuckyDrawResponse.DrawResultEnriched(resDto);
                })
                .collect(Collectors.toList());

        // 5. Trả về kết quả đã được đóng gói vào DTO
        return Optional.of(LuckyDrawResponse.builder()
                .luckyDraw(convertToDto(luckyDraw)) // <--- Convert ở đây
                .creator(finalUserMap.get(luckyDraw.getCreatedByAccountId()))
                .enrichedResults(enrichedResults)
                .build());
    }

    private LuckyDrawDto convertToDto(LuckyDraw entity) {
        if (entity == null) return null;

        List<PrizeDto> prizeDtos = entity.getPrizes().stream()
                .map(p -> new PrizeDto(p.getId(), p.getName(), p.getQuantity(), p.getDescription()))
                .collect(Collectors.toList());

        return LuckyDrawDto.builder()
                .id(entity.getId())
                .eventId(entity.getEventId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .status(entity.getStatus().name())
                .allowMultipleWins(entity.isAllowMultipleWins())
                .startTime(entity.getStartTime())
                .endTime(entity.getEndTime())
                .prizes(prizeDtos)
                .build();
    }
}
