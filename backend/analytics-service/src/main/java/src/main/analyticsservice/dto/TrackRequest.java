package src.main.analyticsservice.dto;

import lombok.*;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TrackRequest {
    private String entityType;
    private String entityId;
    private String action;
    private String accountId;

}