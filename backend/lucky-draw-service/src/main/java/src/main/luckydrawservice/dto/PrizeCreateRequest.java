package src.main.luckydrawservice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PrizeCreateRequest {
    private String name;
    private String description;
    private int quantity;
    private BigDecimal winProbabilityPercent;
}
