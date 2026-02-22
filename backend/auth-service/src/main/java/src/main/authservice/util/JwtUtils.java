package src.main.authservice.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import lombok.Getter;
import org.springframework.stereotype.Component;
import src.main.authservice.entity.Account;

import java.util.Date;

@Component
@Getter
public class JwtUtils {
    private String secret = "NQ0sEQnwIDQjGqHQkl8kKQcofxfhuXeMJ1rCwHSC2q4n6UuelkIlrHNljkTN6NJmimhXBjD4Y90fva/q/1IL8A==";
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
