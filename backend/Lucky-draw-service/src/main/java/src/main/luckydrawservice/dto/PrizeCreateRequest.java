package src.main.luckydrawservice.dto;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@NoArgsConstructor
@AllArgsConstructor
public class PrizeCreateRequest {
    private String name;
    private String description;
    private int quantity;
    private BigDecimal winProbabilityPercent;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getWinProbabilityPercent() {
        return winProbabilityPercent;
    }

    public void setWinProbabilityPercent(BigDecimal winProbabilityPercent) {
        this.winProbabilityPercent = winProbabilityPercent;
    }
}
