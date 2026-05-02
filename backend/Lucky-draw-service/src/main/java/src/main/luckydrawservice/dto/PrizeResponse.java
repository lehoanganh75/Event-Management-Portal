package src.main.luckydrawservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrizeResponse {
    private String id;
    private String name;
    private String prizeName;
    private int quantity;
    private int remainingQuantity;
    private String description;
}
