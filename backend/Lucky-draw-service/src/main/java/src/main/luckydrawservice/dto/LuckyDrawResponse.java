package src.main.luckydrawservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LuckyDrawResponse {
    private LuckyDrawDto luckyDraw;
    private UserResponse creator;
    private List<DrawResultEnriched> enrichedResults;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DrawResultEnriched {
        private DrawResultDto result;
    }
}
