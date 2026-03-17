package src.main.identityservice.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import src.main.identityservice.dto.UserPrincipal;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
@Getter
public class JwtUtils {
    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration:900000}")
    private long accessExpiration;

    @Value("${jwt.refresh-token.expiration:604800000}")
    private long refreshExpiration;

    private SecretKey key;

    @PostConstruct
    protected void init() {
        // Giải mã Base64 key để đảm bảo tính an toàn và đúng định dạng cho HS512
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    // 1. Tạo Access Token
    public String generateToken(UserPrincipal info) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", info.getEmail());
        claims.put("userId", info.getUserId());
        claims.put("accountId", info.getAccountId());
        if (info.getRoles() != null) {
            claims.put("roles", info.getRoles());
        }
        return createToken(claims, info.getAccountId(), accessExpiration);
    }

    // 2. Tạo Refresh Token (thường chỉ chứa username để bảo mật)
    public String generateRefreshToken(String username) {
        return createToken(new HashMap<>(), username, refreshExpiration);
    }

    private String createToken(Map<String, Object> claims, String subject, long expiration) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }

    // 3. Trích xuất Username từ token
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // 4. Kiểm tra Token có hợp lệ không
    public boolean isTokenValid(String token, String username) {
        final String extractedUsername = extractUsername(token);
        return (extractedUsername.equals(username) && !isTokenExpired(token));
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
