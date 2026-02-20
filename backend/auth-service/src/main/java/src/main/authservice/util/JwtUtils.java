package src.main.authservice.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.stereotype.Component;
import src.main.authservice.entity.Account;

import java.util.Date;

@Component
public class JwtUtils {
    private String secret = "your-very-long-secret-key-for-jwt-signing";
    private long expiration = 86400000; // 1 ngày

    public String generateToken(Account account) {
        return Jwts.builder()
                .setSubject(account.getUsername())
                .claim("role", account.getRoles())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(SignatureAlgorithm.HS512, secret)
                .compact();
    }
}
