package src.main.luckydrawservice.service.impl;

import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.common.errors.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import src.main.luckydrawservice.client.EventClient;
import src.main.luckydrawservice.client.IdentityClient;
import src.main.luckydrawservice.dto.LuckyDrawCreateRequest;
import src.main.luckydrawservice.dto.LuckyDrawResponse;
import src.main.luckydrawservice.dto.PrizeCreateRequest;
import src.main.luckydrawservice.dto.PrizeResponse;
import src.main.luckydrawservice.dto.DrawResultResponse;
import src.main.luckydrawservice.dto.DrawEntryResponse;
import src.main.luckydrawservice.dto.UserResponse;
import src.main.luckydrawservice.dto.EventResponse;
import src.main.luckydrawservice.dto.EventRegistrationResponse;
import src.main.luckydrawservice.dto.EventUserRoleResponse;
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
@RequiredArgsConstructor
@Slf4j
public class LuckyDrawServiceImpl implements LuckyDrawService {
    private final PrizeRepository prizeRepository;
    private final LuckyDrawRepository luckyDrawRepository;
    private final DrawEntryRepository drawEntryRepository;
    private final DrawResultRepository drawResultRepository;
    private final EventClient eventClient;
    private final IdentityClient identityClient;
    private final Random random = new SecureRandom();

    @Transactional
    @Override
    public LuckyDraw createLuckyDraw(LuckyDrawCreateRequest request, String createdByAccountId) {
        try {
            eventClient.updateLuckyDrawId(request.getEventId(), true);
        } catch (feign.FeignException.Conflict e) {
            log.warn("Sự kiện này đã có vòng quay ở Event-Service, tiếp tục tạo mới ở Lucky-Draw-Service: {}",
                    e.getMessage());
        } catch (Exception e) {
            log.warn("Không thể kết nối tới Event-Service: {}", e.getMessage());
        }

        Optional<LuckyDraw> existingOpt = luckyDrawRepository.findByEventId(request.getEventId());
        if (existingOpt.isPresent()) {
            luckyDrawRepository.delete(existingOpt.get());
            luckyDrawRepository.flush();
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
                        return prize;
                    }).collect(Collectors.toList());

            prizeRepository.saveAll(prizes);
        }

        return savedDraw;
    }

    @Override
    @Transactional
    public LuckyDraw updateLuckyDraw(String id, LuckyDrawCreateRequest request, String createdByAccountId) {
        LuckyDraw existingDraw = luckyDrawRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vòng quay với ID: " + id));

        existingDraw.setTitle(request.getTitle());
        existingDraw.setDescription(request.getDescription());
        existingDraw.setStartTime(request.getStartTime());
        existingDraw.setEndTime(request.getEndTime());
        existingDraw.setAllowMultipleWins(request.isAllowMultipleWins());

        if (request.getStatus() != null) {
            existingDraw.setStatus(request.getStatus());
        }
        existingDraw.setDeleted(request.isDeleted());
        LuckyDraw savedDraw = luckyDrawRepository.save(existingDraw);

        prizeRepository.deleteByLuckyDrawId(id);

        if (request.getPrizes() != null && !request.getPrizes().isEmpty()) {
            List<Prize> newPrizes = request.getPrizes().stream()
                    .map(prizeReq -> {
                        Prize prize = new Prize();
                        prize.setLuckyDraw(savedDraw);
                        prize.setName(prizeReq.getName());
                        prize.setQuantity(prizeReq.getQuantity());
                        prize.setRemainingQuantity(prizeReq.getQuantity());
                        return prize;
                    }).collect(Collectors.toList());

            prizeRepository.saveAll(newPrizes);
        }

        return savedDraw;
    }

    @Override
    @Transactional
    public LuckyDrawResponse findById(String luckyDrawId) {
        LuckyDraw draw = luckyDrawRepository.findById(luckyDrawId).orElse(null);
        if (draw == null) {
            return null;
        }

        java.util.Set<String> userIds = new java.util.HashSet<>();
        if (draw.getCreatedByAccountId() != null) {
            userIds.add(draw.getCreatedByAccountId());
        }
        if (draw.getEntries() != null) {
            for (src.main.luckydrawservice.entity.DrawEntry e : draw.getEntries()) {
                if (e.getUserProfileId() != null) {
                    userIds.add(e.getUserProfileId());
                }
            }
        }
        if (draw.getResults() != null) {
            for (src.main.luckydrawservice.entity.DrawResult r : draw.getResults()) {
                if (r.getWinnerProfileId() != null) {
                    userIds.add(r.getWinnerProfileId());
                }
            }
        }

        Map<String, UserResponse> profileMap = new java.util.HashMap<>();
        if (!userIds.isEmpty()) {
            try {
                List<UserResponse> profiles = identityClient
                        .getUsersByIds(new ArrayList<>(userIds));
                profileMap = profiles.stream()
                        .collect(Collectors.toMap(src.main.luckydrawservice.dto.UserResponse::getId,
                                u -> u, (u1, u2) -> u1));
            } catch (Exception e) {
                log.error("Lỗi khi fetch profiles: ", e);
            }
        }

        final Map<String, UserResponse> finalUserMap = profileMap;
        List<PrizeResponse> prizeResponses = draw.getPrizes() != null ? draw.getPrizes().stream()
                .map(p -> PrizeResponse.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .prizeName(p.getName())
                        .quantity(p.getQuantity())
                        .remainingQuantity(p.getRemainingQuantity())
                        .description(p.getDescription())
                        .build())
                .collect(Collectors.toList()) : Collections.emptyList();

        List<DrawEntryResponse> entryResponses = draw.getEntries() != null ? draw.getEntries().stream()
                .map(e -> {
                    UserResponse profile = finalUserMap.get(e.getUserProfileId());
                    return new DrawEntryResponse(e.getId(), e.getStatus().name(), e.getCreatedAt(), e.getUpdatedAt(),
                            profile);
                })
                .collect(Collectors.toList()) : Collections.emptyList();

        List<DrawResultResponse> mappedResults = draw.getResults() != null ? draw.getResults().stream()
                .map(res -> {
                    PrizeResponse pDto = null;
                    if (res.getPrize() != null) {
                        pDto = PrizeResponse.builder()
                                .id(res.getPrize().getId())
                                .name(res.getPrize().getName())
                                .prizeName(res.getPrize().getName())
                                .quantity(res.getPrize().getQuantity())
                                .remainingQuantity(res.getPrize().getRemainingQuantity())
                                .description(res.getPrize().getDescription())
                                .build();
                    }
                    return DrawResultResponse.builder()
                            .id(res.getId())
                            .drawTime(res.getDrawTime())
                            .claimed(res.isClaimed())
                            .quantity(res.getQuantity())
                            .winner(finalUserMap.get(res.getWinnerProfileId()))
                            .winTime(res.getDrawTime())
                            .wonPrize(pDto)
                            .build();
                })
                .collect(Collectors.toList()) : Collections.emptyList();

        return LuckyDrawResponse.builder()
                .id(draw.getId())
                .eventId(draw.getEventId())
                .creator(finalUserMap.get(draw.getCreatedByAccountId()))
                .title(draw.getTitle())
                .description(draw.getDescription())
                .status(draw.getStatus().name())
                .allowMultipleWins(draw.isAllowMultipleWins())
                .startTime(draw.getStartTime())
                .endTime(draw.getEndTime())
                .prizes(prizeResponses)
                .entries(entryResponses)
                .results(mappedResults)
                .build();
    }

    @Override
    @Transactional
    public List<LuckyDraw> getAllLuckyDraws() {
        return luckyDrawRepository.findAllByIsDeletedFalse();
    }

    @Transactional
    @Override
    public void deleteLuckyDrawByEventId(String eventId) {
        Optional<LuckyDraw> luckyDrawOpt = luckyDrawRepository.findByEventId(eventId);
        if (luckyDrawOpt.isEmpty()) {
            log.warn("Không tìm thấy dữ liệu LuckyDraw để xóa cho sự kiện ID: {}. Bỏ qua bước này.", eventId);
            return;
        }

        LuckyDraw luckyDraw = luckyDrawOpt.get();
        luckyDraw.setDeleted(true);
        luckyDraw.setUpdatedAt(LocalDateTime.now());
        luckyDrawRepository.save(luckyDraw);

        try {
            eventClient.updateLuckyDrawId(eventId, false);
        } catch (Exception e) {
            log.error("Lỗi khi cập nhật hasLuckyDraw bên Event-Service cho sự kiện {}: {}", eventId, e.getMessage());
        }
    }

    @Transactional
    @Override
    public void deleteLuckyDraw(String id) {
        LuckyDraw luckyDraw = luckyDrawRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Không tìm thấy vòng quay với ID: " + id));

        luckyDraw.setDeleted(true);
        luckyDraw.setUpdatedAt(LocalDateTime.now());
        luckyDrawRepository.save(luckyDraw);

        try {
            eventClient.updateLuckyDrawId(luckyDraw.getEventId(), false);
        } catch (Exception e) {
            log.error("Lỗi khi cập nhật hasLuckyDraw bên Event-Service cho sự kiện {}: {}", luckyDraw.getEventId(),
                    e.getMessage());
        }
    }

    @Override
    @Transactional
    public DrawResultResponse performLuckyDraw(String luckyDrawId, String token, String userProfileId, String prizeId) {
        LuckyDraw luckyDraw = luckyDrawRepository.findById(luckyDrawId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lucky Draw not found"));

        if (luckyDraw.getStatus() == DrawStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Chương trình quay thưởng đã kết thúc");
        }

        // TRƯỜNG HỢP 1: ADMIN QUAY CHO CẢ HỘI TRƯỜNG (userProfileId là null)
        if (userProfileId == null) {
            validateAdminAccess(luckyDraw.getEventId(), token);

            if (luckyDraw.getStatus() == DrawStatus.PENDING) {
                luckyDraw.setStatus(DrawStatus.ACTIVE);
                luckyDrawRepository.save(luckyDraw);
            }

            List<DrawEntry> eligibleEntries = getEligibleParticipants(luckyDraw);
            if (eligibleEntries.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Không có người tham gia hợp lệ nào tại thời điểm này.");
            }

            DrawEntry winnerEntry = eligibleEntries.get(random.nextInt(eligibleEntries.size()));
            return executeDraw(luckyDraw, winnerEntry, prizeId);
        }

        // TRƯỜNG HỢP 2: USER TỰ QUAY CHO CHÍNH MÌNH (userProfileId có giá trị)
        else {
            if (luckyDraw.getStatus() != DrawStatus.ACTIVE) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Chương trình hiện không ở trạng thái cho phép cá nhân tự quay");
            }

            DrawEntry entry = drawEntryRepository
                    .findFirstByLuckyDrawIdAndUserProfileIdAndStatus(luckyDrawId, userProfileId, EntryStatus.VALID)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Bạn chưa check-in hoặc không có lượt quay hợp lệ"));

            return executeDraw(luckyDraw, entry, prizeId);
        }
    }

    private DrawResultResponse executeDraw(LuckyDraw luckyDraw, DrawEntry winnerEntry, String prizeId) {
        // 1. Xác định giải thưởng
        Prize winningPrize;

        if (prizeId != null && !prizeId.isEmpty()) {
            winningPrize = prizeRepository.findById(prizeId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Không tìm thấy giải thưởng đã chọn"));

            if (winningPrize.getRemainingQuantity() <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Giải thưởng này đã hết số lượng");
            }
            if (!winningPrize.getLuckyDraw().getId().equals(luckyDraw.getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Giải thưởng không thuộc chương trình này");
            }
        } else {
            // Chọn ngẫu nhiên nếu không chỉ định
            List<Prize> availablePrizes = prizeRepository
                    .findByLuckyDrawIdAndRemainingQuantityGreaterThan(luckyDraw.getId(), 0);
            if (availablePrizes.isEmpty()) {
                return DrawResultResponse.builder()
                        .id("Hết giải thưởng! Cảm ơn bạn đã tham gia.")
                        .build();
            }
            winningPrize = availablePrizes.get(random.nextInt(availablePrizes.size()));
        }

        // 3. Cập nhật số lượng và trạng thái
        winningPrize.setRemainingQuantity(winningPrize.getRemainingQuantity() - 1);
        prizeRepository.save(winningPrize);

        winnerEntry.setStatus(EntryStatus.USED);
        drawEntryRepository.save(winnerEntry);

        // 4. Lưu kết quả
        DrawResult result = new DrawResult();
        result.setLuckyDraw(luckyDraw);
        result.setPrize(winningPrize);
        result.setWinnerProfileId(winnerEntry.getUserProfileId());
        result.setDrawTime(LocalDateTime.now());
        result.setClaimed(true);
        result.setQuantity(1);
        drawResultRepository.save(result);

        // 5. Lấy profile hiển thị
        UserResponse winnerProfile = fetchWinnerProfile(winnerEntry.getUserProfileId());

        return DrawResultResponse.builder()
                .id(result.getId())
                .drawTime(result.getDrawTime())
                .claimed(result.isClaimed())
                .quantity(result.getQuantity())
                .wonPrize(toPrizeResponse(winningPrize))
                .winner(winnerProfile)
                .build();
    }

    private List<DrawEntry> getEligibleParticipants(LuckyDraw luckyDraw) {
        List<DrawEntry> validEntries = drawEntryRepository.findByLuckyDrawIdAndStatus(luckyDraw.getId(),
                EntryStatus.VALID);

        if (luckyDraw.isAllowMultipleWins())
            return validEntries;

        Set<String> alreadyWonIds = luckyDraw.getResults().stream()
                .map(DrawResult::getWinnerProfileId)
                .collect(Collectors.toSet());

        return validEntries.stream()
                .filter(e -> !alreadyWonIds.contains(e.getUserProfileId()))
                .collect(Collectors.toList());
    }

    private void validateAdminAccess(String eventId, String token) {
        try {
            EventResponse eventInfo = eventClient.getEventById(eventId, token);
            if (eventInfo.getCurrentUserRole() == null
                    || !"LEADER".equalsIgnoreCase(eventInfo.getCurrentUserRole().getOrganizerRole())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ LEADER mới có quyền thực hiện");
            }
        } catch (Exception e) {
            log.error("Access validation error: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể xác thực quyền hạn");
        }
    }

    private UserResponse fetchWinnerProfile(String profileId) {
        try {
            List<UserResponse> profiles = identityClient.getUsersByIds(Collections.singletonList(profileId));
            if (profiles != null && !profiles.isEmpty() && profiles.get(0) != null) {
                return profiles.get(0);
            }
        } catch (Exception e) {
            log.error("Winner profile fetch error: {}", e.getMessage());
        }
        UserResponse fallback = new UserResponse();
        fallback.setId(profileId);
        fallback.setFullName("Người thắng cuộc");
        return fallback;
    }

    private PrizeResponse toPrizeResponse(Prize prize) {
        PrizeResponse prizeResponse = new PrizeResponse();
        prizeResponse.setId(prize.getId());
        prizeResponse.setName(prize.getName());
        prizeResponse.setPrizeName(prize.getName());
        prizeResponse.setDescription(prize.getDescription());
        prizeResponse.setQuantity(prize.getQuantity());
        prizeResponse.setRemainingQuantity(prize.getRemainingQuantity());
        return prizeResponse;
    }

    @Transactional
    @Override
    public void activateLuckyDraw(String luckyDrawId, String accountId) {
        LuckyDraw luckyDraw = luckyDrawRepository.findById(luckyDrawId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT,
                        "Không tìm thấy vòng quay với ID: " + luckyDrawId));

        if (!luckyDraw.getCreatedByAccountId().equals(accountId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền kích hoạt vòng quay này");
        }

        if (luckyDraw.getStatus() != DrawStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Vòng quay đã được kích hoạt hoặc đã kết thúc");
        }

        if (luckyDraw.getPrizes() == null || luckyDraw.getPrizes().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Vòng quay phải có ít nhất một giải thưởng trước khi kích hoạt");
        }

        luckyDraw.setStatus(DrawStatus.ACTIVE);
        luckyDraw.setUpdatedAt(LocalDateTime.now());
        luckyDrawRepository.save(luckyDraw);
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
        return drawEntryRepository.findByLuckyDrawIdAndUserProfileId(luckyDrawId, userProfileId);
    }

    @Override
    public Optional<LuckyDrawResponse> findByEventId(String eventId) {
        Optional<LuckyDraw> luckyDrawOpt = luckyDrawRepository.findByEventIdAndIsDeletedFalse(eventId);
        if (luckyDrawOpt.isEmpty()) {
            return Optional.empty();
        }
        LuckyDraw luckyDraw = luckyDrawOpt.get();

        Set<String> allAccountIds = new HashSet<>();
        if (luckyDraw.getCreatedByAccountId() != null) {
            allAccountIds.add(luckyDraw.getCreatedByAccountId());
        }

        if (luckyDraw.getResults() != null) {
            luckyDraw.getResults().forEach(res -> {
                if (res.getWinnerProfileId() != null) {
                    allAccountIds.add(res.getWinnerProfileId());
                }
            });
        }

        if (luckyDraw.getEntries() != null) {
            luckyDraw.getEntries().forEach(e -> {
                if (e.getUserProfileId() != null) {
                    allAccountIds.add(e.getUserProfileId());
                }
            });
        }

        Map<String, UserResponse> userMap = new HashMap<>();
        if (!allAccountIds.isEmpty()) {
            try {
                List<UserResponse> users = identityClient.getUsersByIds(new ArrayList<>(allAccountIds));
                userMap = users.stream().collect(Collectors.toMap(UserResponse::getId, u -> u));
            } catch (Exception e) {
                log.error("Error fetching users from identity-service: {}", e.getMessage());
            }
        }

        final Map<String, UserResponse> finalUserMap = userMap;
        List<PrizeResponse> prizeResponses = luckyDraw.getPrizes() != null ? luckyDraw.getPrizes().stream()
                .map(p -> PrizeResponse.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .prizeName(p.getName())
                        .quantity(p.getQuantity())
                        .remainingQuantity(p.getRemainingQuantity())
                        .description(p.getDescription())
                        .build())
                .collect(Collectors.toList()) : Collections.emptyList();

        List<DrawEntryResponse> entryResponses = luckyDraw.getEntries() != null ? luckyDraw.getEntries().stream()
                .map(e -> {
                    UserResponse profile = finalUserMap.get(e.getUserProfileId());
                    return new DrawEntryResponse(e.getId(), e.getStatus().name(), e.getCreatedAt(), e.getUpdatedAt(),
                            profile);
                })
                .collect(Collectors.toList()) : Collections.emptyList();

        List<DrawResultResponse> mappedResults = luckyDraw.getResults() != null ? luckyDraw.getResults().stream()
                .map(res -> {
                    PrizeResponse pDto = null;
                    if (res.getPrize() != null) {
                        pDto = PrizeResponse.builder()
                                .id(res.getPrize().getId())
                                .name(res.getPrize().getName())
                                .prizeName(res.getPrize().getName())
                                .quantity(res.getPrize().getQuantity())
                                .remainingQuantity(res.getPrize().getRemainingQuantity())
                                .description(res.getPrize().getDescription())
                                .build();
                    }
                    return DrawResultResponse.builder()
                            .id(res.getId())
                            .drawTime(res.getDrawTime())
                            .claimed(res.isClaimed())
                            .quantity(res.getQuantity())
                            .winner(finalUserMap.get(res.getWinnerProfileId()))
                            .winTime(res.getDrawTime())
                            .wonPrize(pDto)
                            .build();
                })
                .collect(Collectors.toList()) : Collections.emptyList();

        return Optional.of(LuckyDrawResponse.builder()
                .id(luckyDraw.getId())
                .eventId(luckyDraw.getEventId())
                .creator(finalUserMap.get(luckyDraw.getCreatedByAccountId()))
                .title(luckyDraw.getTitle())
                .description(luckyDraw.getDescription())
                .status(luckyDraw.getStatus().name())
                .allowMultipleWins(luckyDraw.isAllowMultipleWins())
                .startTime(luckyDraw.getStartTime())
                .endTime(luckyDraw.getEndTime())
                .prizes(prizeResponses)
                .entries(entryResponses)
                .results(mappedResults)
                .build());
    }

    @Override
    public List<UserResponse> getParticipants(String luckyDrawId) {
        List<DrawEntry> entries = drawEntryRepository.findByLuckyDrawIdAndStatus(luckyDrawId, EntryStatus.VALID);

        if (entries.isEmpty())
            return Collections.emptyList();

        List<String> userIds = entries.stream()
                .map(DrawEntry::getUserProfileId)
                .collect(Collectors.toList());

        try {
            return identityClient.getUsersByIds(userIds);
        } catch (Exception e) {
            log.error("Error fetching profiles: {}", e.getMessage());
            return userIds.stream().map(id -> {
                UserResponse u = new UserResponse();
                u.setId(id);
                u.setFullName("User " + id.substring(0, 4));
                return u;
            }).collect(Collectors.toList());
        }
    }

    @Override
    @Transactional
    public void handleCheckIn(String eventId, String userProfileId) {
        luckyDrawRepository.findByEventIdAndIsDeletedFalse(eventId).ifPresent(luckyDraw -> {
            Optional<DrawEntry> entryOpt = drawEntryRepository.findFirstByLuckyDrawIdAndUserProfileId(luckyDraw.getId(),
                    userProfileId);

            if (entryOpt.isPresent()) {
                DrawEntry entry = entryOpt.get();
                if (entry.getStatus() != EntryStatus.USED) {
                    entry.setStatus(EntryStatus.VALID);
                    drawEntryRepository.save(entry);
                }
            } else {
                DrawEntry newEntry = new DrawEntry();
                newEntry.setLuckyDraw(luckyDraw);
                newEntry.setUserProfileId(userProfileId);
                newEntry.setStatus(EntryStatus.VALID);
                drawEntryRepository.save(newEntry);
            }
        });
    }

    @Override
    @Transactional
    public void handleCancelCheckIn(String eventId, String userProfileId) {
        luckyDrawRepository.findByEventIdAndIsDeletedFalse(eventId).ifPresent(luckyDraw -> {
            drawEntryRepository.findFirstByLuckyDrawIdAndUserProfileId(luckyDraw.getId(), userProfileId)
                    .ifPresent(entry -> {
                        if (entry.getStatus() == EntryStatus.VALID) {
                            entry.setStatus(EntryStatus.INVALID);
                            drawEntryRepository.save(entry);
                        }
                    });
        });
    }

    @Override
    @Transactional
    public void updateClaimed(String resultId, boolean claimed) {
        src.main.luckydrawservice.entity.DrawResult result = drawResultRepository.findById(resultId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND,
                        "Không tìm thấy kết quả trúng giải"));
        
        if (result.isClaimed() != claimed) {
            result.setClaimed(claimed);
            drawResultRepository.save(result);

            src.main.luckydrawservice.entity.Prize prize = result.getPrize();
            if (prize != null) {
                if (claimed) {
                    prize.setRemainingQuantity(Math.max(0, prize.getRemainingQuantity() - 1));
                } else {
                    prize.setRemainingQuantity(prize.getRemainingQuantity() + 1);
                }
                prizeRepository.save(prize);
            }
        }
    }
}
