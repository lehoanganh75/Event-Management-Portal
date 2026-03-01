package src.main.authservice.exception;

public class EmailAlreadyExistsException extends RuntimeException{
    public EmailAlreadyExistsException(String message) {
        super(message);
    }
}
