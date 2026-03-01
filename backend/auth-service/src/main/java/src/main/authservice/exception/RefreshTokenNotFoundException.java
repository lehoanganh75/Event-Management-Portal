package src.main.authservice.exception;

public class RefreshTokenNotFoundException extends RuntimeException{
    public RefreshTokenNotFoundException(String message) {
        super(message);
    }
}
