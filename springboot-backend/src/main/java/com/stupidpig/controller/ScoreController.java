package com.stupidpig.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * ScoreController
 * Handles score/coin auditing and secure submissions from HTML5 games.
 * Features signature integrity checks (HMAC-SHA256) to block leaderboard manipulation.
 */
@RestController
@RequestMapping("/api/v1/scores")
@CrossOrigin(origins = "*") // Configure correctly for production GCLB origins
public class ScoreController {

    // Shared HMAC Secret key configured via GCP Secrets Manager / application.properties
    @Value("${stupidpig.game.signature-secret:StupidPigSecretKeyConfiguredOnGCP}")
    private String signatureSecret;

    // Mock Database Service injection (represents PostgreSQL / Cloud SQL layer)
    // @Autowired
    // private UserService userService;
    // @Autowired
    // private ScoreRecordRepository scoreRepo;

    /**
     * Submits a newly achieved score and aggregates virtual coins.
     */
    @PostMapping("/submit")
    public ResponseEntity<Map<String, Object>> submitScore(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody ScoreSubmissionRequest request) {

        Map<String, Object> response = new HashMap<>();

        // 1. Basic JWT Extraction (disguised logic representing Firebase Auth Token verification)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.put("error", "Missing or invalid Bearer authentication token");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        String idToken = authHeader.substring(7);
        String userId = verifyFirebaseAuthTokenAndGetUid(idToken); // Extract UID from Firebase JWT

        if (userId == null) {
            response.put("error", "Failed to authenticate with Firebase auth token");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        // 2. Validate payload data integrity using HMAC-SHA256 signature check
        String rawData = userId + ":" + request.getGameId() + ":" + request.getScore() + ":" + request.getTimestamp();
        boolean isValidSignature = verifyHmacSignature(rawData, request.getSignature());

        if (!isValidSignature) {
            response.put("error", "Signature verification failed! Cheat prevention block active.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        // 3. Score Processing & Coin Allocation
        int score = request.getScore();
        int coinsEarned = score / 10; // Convert 10 points to 1 coin

        // Mock database operations:
        // ScoreRecord newRecord = scoreRepo.save(new ScoreRecord(userId, request.getGameId(), score));
        // userService.incrementUserCoins(userId, coinsEarned);
        // dailyQuestService.checkAndIncrementQuestProgress(userId, request.getGameId(), score);

        // 4. Sync Leaderboard metadata directly to Firebase RTDB for instantaneous web push
        // firebaseService.updateRealtimeLeaderboard(request.getGameId(), userId, score);

        response.put("status", "SUCCESS");
        response.put("coinsEarned", coinsEarned);
        response.put("totalScoreLogged", score);
        response.put("msg", "成績成功登錄！獲得了 " + coinsEarned + " 傻豬金幣！");

        return ResponseEntity.ok(response);
    }

    private String verifyFirebaseAuthTokenAndGetUid(String idToken) {
        // In actual implementation, compile using FirebaseAdminSDK:
        // FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
        // return decodedToken.getUid();
        
        // Mock fallback return
        if (idToken.length() > 10) return "user_pig_9527";
        return null;
    }

    /**
     * Verifies if client-side payload signature matches server-generated HMAC-SHA256
     */
    private boolean verifyHmacSignature(String rawData, String clientSignature) {
        try {
            Mac sha256Hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(
                    signatureSecret.getBytes(StandardCharsets.UTF_8), 
                    "HmacSHA256"
            );
            sha256Hmac.init(secretKey);

            byte[] macData = sha256Hmac.doFinal(rawData.getBytes(StandardCharsets.UTF_8));
            String serverSignature = Base64.getEncoder().encodeToString(macData);

            return serverSignature.equals(clientSignature);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            System.err.println("HMAC Signature verification error: " + e.getMessage());
            return false;
        }
    }

    // --- Inner Request DTO class ---
    public static class ScoreSubmissionRequest {
        private String gameId;
        private int score;
        private long timestamp;
        private String signature;

        // Getters & Setters
        public String getGameId() { return gameId; }
        public void setGameId(String gameId) { this.gameId = gameId; }
        public int getScore() { return score; }
        public void setScore(int score) { this.score = score; }
        public long getTimestamp() { return timestamp; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
        public String getSignature() { return signature; }
        public void setSignature(String signature) { this.signature = signature; }
    }
}
