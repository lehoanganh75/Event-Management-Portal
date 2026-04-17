package com.eventservice.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.UUID;

@Component
public class QRTokenUtil {
    private static final String SECRET = "qr-checkin-secret-key-must-be-32-chars!!";
    private static final Key KEY = Keys.hmacShaKeyFor(SECRET.getBytes());

    private static final long EXPIRY_HOURS = 24;

    public String generateQRToken(String userId, String eventId, LocalDateTime eventEndTime) {
        Date expiry;

        if (eventEndTime != null) {
            expiry = Date.from(
                    eventEndTime.plusHours(1)
                            .atZone(ZoneId.systemDefault()).toInstant()
            );
        } else {
            expiry = new Date(System.currentTimeMillis() + EXPIRY_HOURS * 3600 * 1000);
        }

        return Jwts.builder()
                .setId(UUID.randomUUID().toString())
                .claim("userId", userId)
                .claim("eventId", eventId)
                .setIssuedAt(new Date())
                .setExpiration(expiry)
                .signWith(KEY)
                .compact();
    }

    public Claims verifyQRToken(String token) {
        return null;
    }

    public boolean isTokenValid(String token) {
        try {
            verifyQRToken(token);
            return true;
        } catch (ExpiredJwtException e) {
            return false;
        } catch (JwtException e) {
            return false;
        }
    }

    public LocalDateTime getExpiryFromToken(String token) {
        try {
            Claims claims = verifyQRToken(token);
            return claims.getExpiration().toInstant()
                    .atZone(ZoneId.systemDefault()).toLocalDateTime();
        } catch (Exception e) {
            return null;
        }
    }
}