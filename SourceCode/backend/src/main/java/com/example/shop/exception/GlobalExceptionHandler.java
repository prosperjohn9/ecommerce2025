package com.example.shop.exception;

import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.exc.MismatchedInputException;
import com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body(ex.getMessage()));
    }

    @ExceptionHandler(EmailAlreadyRegisteredException.class)
    public ResponseEntity<Map<String, Object>> handleEmailTaken(EmailAlreadyRegisteredException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body(ex.getMessage()));
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidCredentials(InvalidCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body(ex.getMessage()));
    }

    @ExceptionHandler(TooManyLoginAttemptsException.class)
    public ResponseEntity<Map<String, Object>> handleTooManyAttempts(TooManyLoginAttemptsException ex) {
        // Retry-After is in whole seconds, rounded up.
        long seconds = Math.max(1, (ex.getRetryAfter().toMillis() + 999) / 1000);
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .header(HttpHeaders.RETRY_AFTER, Long.toString(seconds))
                .body(body(ex.getMessage()));
    }

    // One message per invalid field. Rejected values are never echoed back (they may be passwords).
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleInvalid(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new LinkedHashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.putIfAbsent(error.getField(), Objects.requireNonNullElse(error.getDefaultMessage(), "is invalid"));
        }
        Map<String, Object> body = new LinkedHashMap<>(body("Validation failed"));
        body.put("errors", errors);
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(InvalidOrderException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidOrder(InvalidOrderException ex) {
        return ResponseEntity.badRequest().body(body(ex.getMessage()));
    }

    // Unreadable JSON. Names the offending field (e.g. a client-sent "price") without echoing
    // its value or Jackson's internal class names.
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleUnreadable(HttpMessageNotReadableException ex) {
        String message = switch (ex.getCause()) {
            case UnrecognizedPropertyException e -> "Unknown field: " + fieldPath(e.getPath());
            case MismatchedInputException e when !e.getPath().isEmpty() ->
                    "Invalid value for field: " + fieldPath(e.getPath());
            case null, default -> "Malformed request body.";
        };
        return ResponseEntity.badRequest().body(body(message));
    }

    // [items, 0, price] -> "items[0].price"
    private static String fieldPath(List<JsonMappingException.Reference> path) {
        StringBuilder result = new StringBuilder();
        for (JsonMappingException.Reference ref : path) {
            if (ref.getFieldName() != null) {
                if (!result.isEmpty()) {
                    result.append('.');
                }
                result.append(ref.getFieldName());
            } else if (ref.getIndex() >= 0) {
                result.append('[').append(ref.getIndex()).append(']');
            }
        }
        return result.toString();
    }

    private static Map<String, Object> body(String message) {
        return Map.of(
                "timestamp", LocalDateTime.now().toString(),
                "message", message
        );
    }
}
