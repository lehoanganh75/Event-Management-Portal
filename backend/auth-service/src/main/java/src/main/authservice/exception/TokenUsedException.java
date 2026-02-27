package src.main.authservice.exception;

public class TokenUsedException extends RuntimeException {
    public TokenUsedException(String message) {
        super(message);
    }
}