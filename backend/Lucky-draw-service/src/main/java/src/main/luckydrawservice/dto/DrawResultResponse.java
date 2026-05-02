package src.main.luckydrawservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DrawResultResponse {
    private String id;
    private LocalDateTime drawTime;
    private boolean claimed;
    private int quantity;
    private UserResponse winner;

    // Fallback / compatibility fields
    private PrizeResponse wonPrize;
    private LocalDateTime winTime;
}