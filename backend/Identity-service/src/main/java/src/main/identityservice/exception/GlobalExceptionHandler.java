package src.main.identityservice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResponseStatusException .class)
    public ResponseEntity<Map<String, Object>> handleResponseStatusException(ResponseStatusException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("status", "error");
        body.put("message", ex.getReason());
        String message = ex.getReason().toLowerCase();
        if (message.contains("email")) body.put("field", "email");
        else if (message.contains("tên đăng nhập") || message.contains("username")) body.put("field", "username");

        return new ResponseEntity<>(body, ex.getStatusCode());
    }
}