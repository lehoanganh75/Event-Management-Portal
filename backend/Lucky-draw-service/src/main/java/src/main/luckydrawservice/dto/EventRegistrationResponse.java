package src.main.luckydrawservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventRegistrationResponse {
    private String id;
    private UserResponse profile; // Lấy từ Event-service (đối tượng UserResponse)
    private boolean checkedIn;
    private String status;

    // Helper method to get ID easily
    public String getUserProfileId() {
        return profile != null ? profile.getId() : null;
    }
}
