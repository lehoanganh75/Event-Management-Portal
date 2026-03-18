package src.main.luckydrawservice.service;

import src.main.luckydrawservice.entity.DrawEntry;

public interface DrawEntryService {
    DrawEntry createDrawEntry(String userProfileId, String luckyDrawId);
}
