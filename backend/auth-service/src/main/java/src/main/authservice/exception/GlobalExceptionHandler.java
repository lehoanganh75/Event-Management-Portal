package src.main.authservice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(UsernameAlreadyExistsException.class)
    public ResponseEntity<Map<String, Object>> handleUsernameAlreadyExists(UsernameAlreadyExistsException ex) {
        return buildErrorResponse(
                HttpStatus.BAD_REQUEST,
                "Bad Request",
                ex.getMessage(),
                "/api/auth/register"
        );
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidCredentials(InvalidCredentialsException ex) {
        return buildErrorResponse(
                HttpStatus.UNAUTHORIZED,
                "Unauthorized",
                ex.getMessage(),
                null
        );
    }

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<Map<String, Object>> handleEmailAlreadyExists(EmailAlreadyExistsException ex) {
        return buildErrorResponse(
                HttpStatus.BAD_REQUEST,
                "Bad Request",
                ex.getMessage(),
                null
        );
    }

    @ExceptionHandler(EmailNotExistsException.class)
    public ResponseEntity<Map<String, Object>> handleEmailNotExists(EmailNotExistsException ex) {
        return buildErrorResponse(
                HttpStatus.BAD_REQUEST,
                "Email Verification Error",
                ex.getMessage(),
                "/api/auth/register"
        );
    }

    // Handler mới cho verify email
    @ExceptionHandler(TokenInvalidException.class)
    public ResponseEntity<Map<String, Object>> handleTokenInvalid(TokenInvalidException ex) {
        return buildErrorResponse(
                HttpStatus.BAD_REQUEST,
                "Bad Request",
                ex.getMessage(),
                "/api/auth/verify"
        );
    }

    @ExceptionHandler(TokenUsedException.class)
    public ResponseEntity<Map<String, Object>> handleTokenUsed(TokenUsedException ex) {
        return buildErrorResponse(
                HttpStatus.BAD_REQUEST,
                "Bad Request",
                ex.getMessage(),
                "/api/auth/verify"
        );
    }

    @ExceptionHandler(TokenExpiredException.class)
    public ResponseEntity<Map<String, Object>> handleTokenExpired(TokenExpiredException ex) {
        return buildErrorResponse(
                HttpStatus.GONE,
                "Gone",
                ex.getMessage(),
                "/api/auth/verify"
        );
    }

    @ExceptionHandler(RefreshTokenNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleRefreshTokenNotFound(RefreshTokenNotFoundException ex) {
        return buildErrorResponse(
                HttpStatus.BAD_REQUEST,
                "Bad Request",
                ex.getMessage(),
                "/api/auth/refresh"
        );
    }

    @ExceptionHandler(RefreshTokenExpiredException.class)
    public ResponseEntity<Map<String, Object>> handleRefreshTokenExpired(RefreshTokenExpiredException ex) {
        return buildErrorResponse(
                HttpStatus.UNAUTHORIZED,
                "Unauthorized",
                ex.getMessage(),
                "/api/auth/refresh"
        );
    }

    @ExceptionHandler(RefreshTokenRevokedException.class)
    public ResponseEntity<Map<String, Object>> handleRefreshTokenRevoked(RefreshTokenRevokedException ex) {
        return buildErrorResponse(
                HttpStatus.UNAUTHORIZED,
                "Unauthorized",
                ex.getMessage(),
                "/api/auth/refresh"
        );
    }

    @ExceptionHandler(AccountNotActivatedException.class)
    public ResponseEntity<Map<String, Object>> handleRefreshTokenRevoked(AccountNotActivatedException ex) {
        return buildErrorResponse(
                HttpStatus.BAD_REQUEST,
                "Bad Request",
                ex.getMessage(),
                "https://mail.google.com/mail/u/0/#inbox"
        );
    }

    private ResponseEntity<Map<String, Object>> buildErrorResponse(HttpStatus status, String error, String message, String path) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("error", error);
        body.put("message", message);
        if (path != null) {
            body.put("path", path);
        }
        return new ResponseEntity<>(body, status);
    }
}