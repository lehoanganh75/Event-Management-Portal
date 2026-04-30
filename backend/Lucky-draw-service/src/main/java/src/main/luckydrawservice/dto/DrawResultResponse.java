package src.main.luckydrawservice.dto;

public class DrawResultResponse {
    private String message;
    private PrizeResponse wonPrize;
    private UserResponse winner;

    public DrawResultResponse() {}

    public DrawResultResponse(String message, PrizeResponse wonPrize) {
        this.message = message;
        this.wonPrize = wonPrize;
    }

    public DrawResultResponse(String message, PrizeResponse wonPrize, UserResponse winner) {
        this.message = message;
        this.wonPrize = wonPrize;
        this.winner = winner;
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

    public UserResponse getWinner() {
        return winner;
    }

    public void setWinner(UserResponse winner) {
        this.winner = winner;
    }
}