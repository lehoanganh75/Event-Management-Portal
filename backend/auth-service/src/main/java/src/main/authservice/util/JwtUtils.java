package src.main.authservice.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.Getter;
import org.springframework.stereotype.Component;
import src.main.authservice.entity.Account;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
@Getter
public class JwtUtils {
    private String secret = "NQ0sEQnwIDQjGqHQkl8kKQcofxfhuXeMJ1rCwHSC2q4n6UuelkIlrHNljkTN6NJmimhXBjD4Y90fva/q/1IL8A==";
    private long expiration = 86400000; // 1 ngày

    public String generateToken(Account account) {
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));

        return Jwts.builder()
                .setSubject(account.getUsername())
                .claim("accountId", account.getId()) // Đảm bảo đã có accountId để User-Service truy vấn
                .claim("role", account.getRoles())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(key, SignatureAlgorithm.HS512) // Sử dụng đối tượng Key thay vì String
                .compact();
    }
}
