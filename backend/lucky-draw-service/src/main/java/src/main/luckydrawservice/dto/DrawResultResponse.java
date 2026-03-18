package src.main.luckydrawservice.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DrawResultResponse {
    private String message;
    private PrizeResponse wonPrize;
}