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
public class DrawResultDto {
    private String id;
    private UserDto winner;
    private LocalDateTime winTime;
    private PrizeDto prize;
}
