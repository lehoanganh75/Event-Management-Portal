package src.main.identityservice.exception;

public class RefreshTokenRevokedException extends RuntimeException{
    public RefreshTokenRevokedException(String message) {
        super(message);
    }
}
