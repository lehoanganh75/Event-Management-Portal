package src.main.luckydrawservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import src.main.luckydrawservice.entity.DrawStatus;

import java.time.LocalDateTime;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
public class LuckyDrawCreateRequest {
    @NotBlank(message = "ID sự kiện không được để trống")
    private String eventId;
    @NotBlank(message = "Tiêu đề vòng quay không được để trống")
    private String title;
    private String description;
    @NotNull(message = "Thời gian bắt đầu không được để trống")
    private LocalDateTime startTime;
    @NotNull(message = "Thời gian kết thúc không được để trống")
    private LocalDateTime endTime;
    private boolean allowMultipleWins;
    private DrawStatus status;
    @JsonProperty("isDeleted")
    private boolean isDeleted;

    private List<PrizeCreateRequest> prizes;

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

    public boolean isAllowMultipleWins() {
        return allowMultipleWins;
    }

    public void setAllowMultipleWins(boolean allowMultipleWins) {
        this.allowMultipleWins = allowMultipleWins;
    }

    public DrawStatus getStatus() {
        return status;
    }

    public void setStatus(DrawStatus status) {
        this.status = status;
    }

    public boolean isDeleted() {
        return isDeleted;
    }

    public void setDeleted(boolean deleted) {
        isDeleted = deleted;
    }

    public List<PrizeCreateRequest> getPrizes() {
        return prizes;
    }

    public void setPrizes(List<PrizeCreateRequest> prizes) {
        this.prizes = prizes;
    }
}
