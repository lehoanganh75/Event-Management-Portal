package src.main.authservice.exception;

public class AccountNotActivatedException extends RuntimeException {
    public AccountNotActivatedException(String message) {
        super(message);
    }
}
