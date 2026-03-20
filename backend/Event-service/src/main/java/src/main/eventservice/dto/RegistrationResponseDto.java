package src.main.eventservice.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RegistrationResponseDto {
    private String id;
    private String eventId;
    private String eventTitle;
    private String userProfileId;
    private String status;
    private String registeredAt;
    private String qrToken;
    private String qrTokenExpiry;
    private boolean checkedIn;
    private String checkInTime;
}