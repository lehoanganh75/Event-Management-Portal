package src.main.luckydrawservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import src.main.luckydrawservice.entity.Prize;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LuckyDrawDto {
    private String id;
    private String eventId;
    private String title;
    private String description;
    private String status;
    private boolean allowMultipleWins;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private List<PrizeDto> prizes; // Danh sách Prize ở dạng DTO
}