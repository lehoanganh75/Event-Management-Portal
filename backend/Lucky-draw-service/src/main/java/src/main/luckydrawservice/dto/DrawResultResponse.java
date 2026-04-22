package src.main.luckydrawservice.dto;

public class DrawResultResponse {
    private String message;
    private PrizeResponse wonPrize;

    public DrawResultResponse() {}

    public DrawResultResponse(String message, PrizeResponse wonPrize) {
        this.message = message;
        this.wonPrize = wonPrize;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public PrizeResponse getWonPrize() {
        return wonPrize;
    }

    public void setWonPrize(PrizeResponse wonPrize) {
        this.wonPrize = wonPrize;
    }
}