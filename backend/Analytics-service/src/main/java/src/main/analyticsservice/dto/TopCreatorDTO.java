package src.main.analyticsservice.dto;

public class TopCreatorDTO {
    private String accountId;
    private long totalEvents;

    public TopCreatorDTO() {}

    public TopCreatorDTO(String accountId, long totalEvents) {
        this.accountId = accountId;
        this.totalEvents = totalEvents;
    }

    public String getAccountId() {
        return accountId;
    }

    public void setAccountId(String accountId) {
        this.accountId = accountId;
    }

    public long getTotalEvents() {
        return totalEvents;
    }

    public void setTotalEvents(long totalEvents) {
        this.totalEvents = totalEvents;
    }
}