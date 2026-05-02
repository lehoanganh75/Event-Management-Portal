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
public class DrawEntryResponse {
    private String id;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UserResponse profile;
}
