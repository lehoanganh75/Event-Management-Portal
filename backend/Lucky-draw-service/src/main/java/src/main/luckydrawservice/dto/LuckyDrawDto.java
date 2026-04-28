package src.main.luckydrawservice.dto;

import java.time.LocalDateTime;
import java.util.List;

public class LuckyDrawDto {
    private String id;
    private String eventId;
    private String title;
    private String description;
    private String status;
    private boolean allowMultipleWins;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private List<PrizeDto> prizes;

    public LuckyDrawDto() {}

    public LuckyDrawDto(String id, String eventId, String title, String description, String status, boolean allowMultipleWins, LocalDateTime startTime, LocalDateTime endTime, List<PrizeDto> prizes) {
        this.id = id;
        this.eventId = eventId;
        this.title = title;
        this.description = description;
        this.status = status;
        this.allowMultipleWins = allowMultipleWins;
        this.startTime = startTime;
        this.endTime = endTime;
        this.prizes = prizes;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public boolean isAllowMultipleWins() {
        return allowMultipleWins;
    }

    public void setAllowMultipleWins(boolean allowMultipleWins) {
        this.allowMultipleWins = allowMultipleWins;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public List<PrizeDto> getPrizes() {
        return prizes;
    }

    public void setPrizes(List<PrizeDto> prizes) {
        this.prizes = prizes;
    }

    public static LuckyDrawDtoBuilder builder() {
        return new LuckyDrawDtoBuilder();
    }

    public static class LuckyDrawDtoBuilder {
        private String id;
        private String eventId;
        private String title;
        private String description;
        private String status;
        private boolean allowMultipleWins;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private List<PrizeDto> prizes;

        LuckyDrawDtoBuilder() {}

        public LuckyDrawDtoBuilder id(String id) {
            this.id = id;
            return this;
        }

        public LuckyDrawDtoBuilder eventId(String eventId) {
            this.eventId = eventId;
            return this;
        }

        public LuckyDrawDtoBuilder title(String title) {
            this.title = title;
            return this;
        }

        public LuckyDrawDtoBuilder description(String description) {
            this.description = description;
            return this;
        }

        public LuckyDrawDtoBuilder status(String status) {
            this.status = status;
            return this;
        }

        public LuckyDrawDtoBuilder allowMultipleWins(boolean allowMultipleWins) {
            this.allowMultipleWins = allowMultipleWins;
            return this;
        }

        public LuckyDrawDtoBuilder startTime(LocalDateTime startTime) {
            this.startTime = startTime;
            return this;
        }

        public LuckyDrawDtoBuilder endTime(LocalDateTime endTime) {
            this.endTime = endTime;
            return this;
        }

        public LuckyDrawDtoBuilder prizes(List<PrizeDto> prizes) {
            this.prizes = prizes;
            return this;
        }

        public LuckyDrawDto build() {
            return new LuckyDrawDto(id, eventId, title, description, status, allowMultipleWins, startTime, endTime, prizes);
        }
    }
}