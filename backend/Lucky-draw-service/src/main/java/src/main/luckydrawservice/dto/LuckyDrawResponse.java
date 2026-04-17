package src.main.luckydrawservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import src.main.luckydrawservice.entity.DrawResult;

import java.util.List;

@Data
@Builder
public class LuckyDrawResponse {
    private LuckyDrawDto luckyDraw;
    private UserDto creator;
    private List<DrawResultEnriched> enrichedResults;

    @Data
    @AllArgsConstructor
    public static class DrawResultEnriched {
        private DrawResultDto result;
    }
}
