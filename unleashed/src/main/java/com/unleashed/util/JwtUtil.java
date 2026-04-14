package com.unleashed.util;

import com.unleashed.entity.User;
import io.jsonwebtoken.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;

@Component
public class JwtUtil {


    private static final long EXPIRATION_TIME = 24 * 60 * 60 * 1000;
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    private final SecretKey SECRET_KEY;
    private final Set<String> revokedTokens = new HashSet<>();


    public JwtUtil() {
        String secretKey = "f1ef94ed31b03d27bd4eb8b43127c96103726fcad9b5e04fcb434b87af4728b1";
        byte[] keyBytes = Base64.getDecoder().decode(secretKey.getBytes(StandardCharsets.UTF_8));
        this.SECRET_KEY = new SecretKeySpec(keyBytes, "HmacSHA256");
        startCleanupTask();
    }

    public String generateUserToken(User user) {
        JwtBuilder jwt = Jwts.builder()
                .setSubject(user.getUserUsername())
                .claim("googleId", user.getUserGoogleId())
                .claim("role", user.getAuthorities())
                .claim("fullName", user.getUserFullname())
                .claim("userEmail", user.getUserEmail())
                .claim("image", user.getUserImage())
                .claim("address", user.getUserAddress())
                .claim("enabled", user.getIsUserEnabled())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SECRET_KEY);
        return jwt.compact();
    }

    public void revokeToken(String token) {
        revokedTokens.add(token);
    }

    public boolean isTokenRevoked(String token) {
        return revokedTokens.contains(token);
    }

    public String extractSubject(String token) {
        return extractClaims(token, Claims::getSubject);
    }

    private <T> T extractClaims(String token, Function<Claims, T> claimsTFunction) {
        return claimsTFunction.apply(Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody());
    }


    public boolean isValidToken(String token, UserDetails userDetails) {
        final String username = extractSubject(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token) && userDetails.isEnabled() && !isTokenRevoked(token));
    }

    public boolean isTokenExpired(String token) {
        return extractClaims(token, Claims::getExpiration).before(new Date());
    }

    public String generateStringToken(String subject, long expirationTime) {
        return Jwts.builder()
                .setSubject(subject)
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime)) // 7 days expiry
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY) // Use a secret key
                .compact();
    }

    private void startCleanupTask() {
        scheduler.scheduleAtFixedRate(this::cleanupExpiredTokens, 1, 1, TimeUnit.HOURS); //Run every hour
    }

    private void cleanupExpiredTokens() {
        Iterator<String> iterator = revokedTokens.iterator();
        while (iterator.hasNext()) {
            String token = iterator.next();
            try {
                if (isTokenExpired(token)) {
                    iterator.remove(); // Remove expired token
                }
            } catch (JwtException e) {
                iterator.remove(); //Remove invalid tokens.
            }
        }
    }

//    // New decode method to decode JWT token
//    public Map<String, Object> decodeToken(String token) {
//        Jws<Claims> jwsClaims = Jwts.parserBuilder()
//                .setSigningKey(SECRET_KEY)
//                .build()
//                .parseClaimsJws(token);
//
//        return jwsClaims.getBody();
//    }


}
