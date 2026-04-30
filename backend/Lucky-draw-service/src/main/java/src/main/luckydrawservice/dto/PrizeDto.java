package src.main.luckydrawservice.dto;

public class PrizeDto {
    private String id;
    private String prizeName;
    private Integer quantity;
    private String description;

    public PrizeDto() {}

    public PrizeDto(String id, String prizeName, Integer quantity, String description) {
        this.id = id;
        this.prizeName = prizeName;
        this.quantity = quantity;
        this.description = description;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPrizeName() {
        return prizeName;
    }

    public void setPrizeName(String prizeName) {
        this.prizeName = prizeName;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public static PrizeDtoBuilder builder() {
        return new PrizeDtoBuilder();
    }

    public static class PrizeDtoBuilder {
        private String id;
        private String prizeName;
        private Integer quantity;
        private String description;

        PrizeDtoBuilder() {}

        public PrizeDtoBuilder id(String id) {
            this.id = id;
            return this;
        }

        public PrizeDtoBuilder prizeName(String prizeName) {
            this.prizeName = prizeName;
            return this;
        }

        public PrizeDtoBuilder quantity(Integer quantity) {
            this.quantity = quantity;
            return this;
        }

        public PrizeDtoBuilder description(String description) {
            this.description = description;
            return this;
        }

        public PrizeDto build() {
            return new PrizeDto(id, prizeName, quantity, description);
        }
    }
}
