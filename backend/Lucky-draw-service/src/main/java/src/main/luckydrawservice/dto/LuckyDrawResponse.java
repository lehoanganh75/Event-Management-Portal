package src.main.luckydrawservice.dto;

import java.util.List;

public class LuckyDrawResponse {
    private LuckyDrawDto luckyDraw;
    private UserDto creator;
    private List<DrawResultEnriched> enrichedResults;

    public LuckyDrawResponse() {}

    public LuckyDrawResponse(LuckyDrawDto luckyDraw, UserDto creator, List<DrawResultEnriched> enrichedResults) {
        this.luckyDraw = luckyDraw;
        this.creator = creator;
        this.enrichedResults = enrichedResults;
    }

    public static LuckyDrawResponseBuilder builder() {
        return new LuckyDrawResponseBuilder();
    }

    public LuckyDrawDto getLuckyDraw() {
        return luckyDraw;
    }

    public void setLuckyDraw(LuckyDrawDto luckyDraw) {
        this.luckyDraw = luckyDraw;
    }

    public UserDto getCreator() {
        return creator;
    }

    public void setCreator(UserDto creator) {
        this.creator = creator;
    }

    public List<DrawResultEnriched> getEnrichedResults() {
        return enrichedResults;
    }

    public void setEnrichedResults(List<DrawResultEnriched> enrichedResults) {
        this.enrichedResults = enrichedResults;
    }

    public static class DrawResultEnriched {
        private DrawResultDto result;

        public DrawResultEnriched() {}

        public DrawResultEnriched(DrawResultDto result) {
            this.result = result;
        }

        public DrawResultDto getResult() {
            return result;
        }

        public void setResult(DrawResultDto result) {
            this.result = result;
        }
    }

    public static class LuckyDrawResponseBuilder {
        private LuckyDrawDto luckyDraw;
        private UserDto creator;
        private List<DrawResultEnriched> enrichedResults;

        LuckyDrawResponseBuilder() {}

        public LuckyDrawResponseBuilder luckyDraw(LuckyDrawDto luckyDraw) {
            this.luckyDraw = luckyDraw;
            return this;
        }

        public LuckyDrawResponseBuilder creator(UserDto creator) {
            this.creator = creator;
            return this;
        }

        public LuckyDrawResponseBuilder enrichedResults(List<DrawResultEnriched> enrichedResults) {
            this.enrichedResults = enrichedResults;
            return this;
        }

        public LuckyDrawResponse build() {
            return new LuckyDrawResponse(this.luckyDraw, this.creator, this.enrichedResults);
        }
    }
}
