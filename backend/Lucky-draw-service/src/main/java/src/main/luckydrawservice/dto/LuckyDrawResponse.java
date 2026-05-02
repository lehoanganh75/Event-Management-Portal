package src.main.luckydrawservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LuckyDrawResponse {
    private String id;
    private String eventId;
    private UserResponse creator;
    private String title;
    private String description;
    private String status;
    private boolean allowMultipleWins;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private List<PrizeResponse> prizes;
    private List<DrawEntryResponse> entries;
    private List<DrawResultResponse> results;
}
