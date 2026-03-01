package src.main.authservice.exception;

public class RefreshTokenRevokedException extends RuntimeException{
    public RefreshTokenRevokedException(String message) {
        super(message);
    }
}
