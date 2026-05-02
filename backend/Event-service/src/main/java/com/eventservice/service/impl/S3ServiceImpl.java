package com.eventservice.service.impl;

import com.eventservice.service.S3Service;
import lombok.RequiredArgsConstructor;
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

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class S3ServiceImpl implements S3Service {
    private final S3Client s3Client;

    public S3ServiceImpl(@org.springframework.beans.factory.annotation.Autowired(required = false) S3Client s3Client) {
        this.s3Client = s3Client;
    }

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    private final List<String> ALLOWED_TYPES = Arrays.asList("image/png", "image/jpeg", "image/jpg", "image/gif");

    @Override
    public String uploadFile(MultipartFile file) {
        if (s3Client == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "S3 storage is not configured");
        }
        // 1. Kiểm tra định dạng
        if (file.getContentType() == null || !ALLOWED_TYPES.contains(file.getContentType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, file.getOriginalFilename() + " is invalid!");
        }

        // 2. Tạo tên file (randomString(4) + timestamp + name)
        String randomPart = UUID.randomUUID().toString().substring(0, 4);
        String fileName = String.format("%s-%d-%s", randomPart, System.currentTimeMillis(), file.getOriginalFilename());

        try {
            // 3. Thực hiện upload
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            // 4. Lấy URL trực tiếp từ S3 (Tương đương .Location bên Node.js)
            GetUrlRequest getUrlRequest = GetUrlRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .build();

            String url = s3Client.utilities().getUrl(getUrlRequest).toString();

            System.out.println("File uploaded to S3: " + url);
            return url;

        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi đọc file");
        } catch (S3Exception e) {
            System.err.println("Error uploading file to AWS S3: " + e.awsErrorDetails().errorMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Upload file to AWS S3 failed");
        }
    }
}
