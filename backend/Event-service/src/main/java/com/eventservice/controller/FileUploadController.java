package com.eventservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/events")
public class FileUploadController {

    @Autowired
    private com.eventservice.service.S3Service s3Service;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        String fileUrl = s3Service.uploadFile(file);

        return ResponseEntity.ok(Map.of(
                "url", fileUrl,
                "size", file.getSize()));
    }
}
