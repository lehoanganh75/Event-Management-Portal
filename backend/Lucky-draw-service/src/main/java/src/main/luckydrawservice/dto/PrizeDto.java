package src.main.luckydrawservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrizeDto {
    private String id;
    private String prizeName;
    private Integer quantity;
    private String description;
}
