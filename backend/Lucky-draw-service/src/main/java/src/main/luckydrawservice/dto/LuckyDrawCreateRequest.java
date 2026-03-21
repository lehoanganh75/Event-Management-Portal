package src.main.luckydrawservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import src.main.luckydrawservice.entity.DrawStatus;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LuckyDrawCreateRequest {
    private String eventId;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private boolean allowMultipleWins;
    private DrawStatus status;
    @JsonProperty("isDeleted")
    private boolean isDeleted;

    private List<PrizeCreateRequest> prizes;
}
