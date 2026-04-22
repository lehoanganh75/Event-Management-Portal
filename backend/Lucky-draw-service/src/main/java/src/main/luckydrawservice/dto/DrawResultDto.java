package src.main.luckydrawservice.dto;

import java.time.LocalDateTime;

public class DrawResultDto {
    private String id;
    private UserDto winner;
    private LocalDateTime winTime;
    private PrizeDto prize;

    public DrawResultDto() {}

    public DrawResultDto(String id, UserDto winner, LocalDateTime winTime, PrizeDto prize) {
        this.id = id;
        this.winner = winner;
        this.winTime = winTime;
        this.prize = prize;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public UserDto getWinner() {
        return winner;
    }

    public void setWinner(UserDto winner) {
        this.winner = winner;
    }

    public LocalDateTime getWinTime() {
        return winTime;
    }

    public void setWinTime(LocalDateTime winTime) {
        this.winTime = winTime;
    }

    public PrizeDto getPrize() {
        return prize;
    }

    public void setPrize(PrizeDto prize) {
        this.prize = prize;
    }

    public static DrawResultDtoBuilder builder() {
        return new DrawResultDtoBuilder();
    }

    public static class DrawResultDtoBuilder {
        private String id;
        private UserDto winner;
        private LocalDateTime winTime;
        private PrizeDto prize;

        DrawResultDtoBuilder() {}

        public DrawResultDtoBuilder id(String id) {
            this.id = id;
            return this;
        }

        public DrawResultDtoBuilder winner(UserDto winner) {
            this.winner = winner;
            return this;
        }

        public DrawResultDtoBuilder winTime(LocalDateTime winTime) {
            this.winTime = winTime;
            return this;
        }

        public DrawResultDtoBuilder prize(PrizeDto prize) {
            this.prize = prize;
            return this;
        }

        public DrawResultDto build() {
            return new DrawResultDto(id, winner, winTime, prize);
        }
    }
}
