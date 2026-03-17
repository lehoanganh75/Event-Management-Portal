package src.main.luckydrawservice.service.impl;

import lombok.RequiredArgsConstructor;
import org.apache.kafka.common.errors.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import src.main.luckydrawservice.entity.DrawEntry;
import src.main.luckydrawservice.entity.EntryStatus;
import src.main.luckydrawservice.entity.LuckyDraw;
import src.main.luckydrawservice.repository.DrawEntryRepository;
import src.main.luckydrawservice.repository.LuckyDrawRepository;
import src.main.luckydrawservice.service.DrawEntryService;

@Service
@RequiredArgsConstructor
public class DrawEntryServiceImpl implements DrawEntryService {
    private final DrawEntryRepository drawEntryRepository;
    private final LuckyDrawRepository luckyDrawRepository;

    @Override
    @Transactional
    public DrawEntry createDrawEntry(String userProfileId, String luckyDrawId) {
        LuckyDraw luckyDraw = luckyDrawRepository.findById(luckyDrawId)
                .orElseThrow(() -> new ResourceNotFoundException("Lucky Draw not found"));

        DrawEntry drawEntryEntity = new DrawEntry();
        drawEntryEntity.setUserProfileId(userProfileId);
        drawEntryEntity.setLuckyDraw(luckyDraw);
        drawEntryEntity.setStatus(EntryStatus.Valid);
        return drawEntryRepository.save(drawEntryEntity);
    }
}
