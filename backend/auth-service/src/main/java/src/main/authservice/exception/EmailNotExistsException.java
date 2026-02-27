package src.main.authservice.exception;

public class EmailNotExistsException extends RuntimeException{
    public EmailNotExistsException(String message) {
        super(message);
    }
}
