package com.eventservice.service.impl;

import com.eventservice.service.S3Service;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetUrlRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.model.ObjectCannedACL;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class S3ServiceImpl implements S3Service {
    private final S3Client s3Client;

    public S3ServiceImpl(@Autowired(required = false) S3Client s3Client) {
        this.s3Client = s3Client;
    }

    @Value("${aws.s3.bucket-name:}")
    private String bucketName;

    @Value("${app.gateway.url:http://localhost:8000}")
    private String gatewayUrl;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    private final List<String> ALLOWED_TYPES = Arrays.asList("image/png", "image/jpeg", "image/jpg", "image/gif");

    @Override
    public String uploadFile(MultipartFile file) {
        // 1. Kiểm tra định dạng
        if (file.getContentType() == null || !ALLOWED_TYPES.contains(file.getContentType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, file.getOriginalFilename() + " is invalid!");
        }

        // 2. Tạo tên file
        String randomPart = UUID.randomUUID().toString().substring(0, 8);
        String fileName = String.format("%s-%d-%s", randomPart, System.currentTimeMillis(), 
                file.getOriginalFilename().replaceAll("\\s+", "_"));

        // 3. Thử upload lên S3 nếu có cấu hình
        if (s3Client != null && bucketName != null && !bucketName.isBlank()) {
            try {
                PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                        .bucket(bucketName)
                        .key(fileName)
                        .contentType(file.getContentType())
                        .acl(ObjectCannedACL.PUBLIC_READ)
                        .build();

                s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

                GetUrlRequest getUrlRequest = GetUrlRequest.builder()
                        .bucket(bucketName)
                        .key(fileName)
                        .build();

                String url = s3Client.utilities().getUrl(getUrlRequest).toString();
                log.info("File uploaded to S3: {}", url);
                return url;

            } catch (Exception e) {
                log.error("S3 upload failed, falling back to local storage. Error: {}", e.getMessage());
                // Fallback to local
            }
        } else {
            log.warn("S3 Client not configured or bucket name missing. Using local storage.");
        }

        // 4. Local storage fallback
        return saveToLocal(file, fileName);
    }

    private String saveToLocal(MultipartFile file, String fileName) {
        try {
            Path root = Paths.get(uploadDir);
            if (!Files.exists(root)) {
                Files.createDirectories(root);
            }

            Files.copy(file.getInputStream(), root.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
            
            // URL trả về sẽ đi qua Kong: http://localhost:8000/events/uploads/filename
            String localUrl = gatewayUrl + "/events/uploads/" + fileName;
            log.info("File saved locally: {}", localUrl);
            return localUrl;
            
        } catch (IOException e) {
            log.error("Local file save failed", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi lưu file local: " + e.getMessage());
        }
    }
}
