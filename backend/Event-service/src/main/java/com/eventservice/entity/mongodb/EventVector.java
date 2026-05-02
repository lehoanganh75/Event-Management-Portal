package com.eventservice.entity.mongodb;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "event_vectors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventVector {
    @Id
    private String id; // Sử dụng chung ID với Event bên MariaDB

    @Field("content")
    private String content; // Nội dung văn bản dùng để tạo embedding (Tiêu đề + Mô tả + Địa điểm)

    @Field("embedding")
    private List<Double> embedding; // Mảng các số thực đại diện cho Vector

    @Field("title")
    private String title; // Lưu lại tiêu đề để hiển thị nhanh

    @Field("slug")
    private String slug;

    @Field("coverImage")
    private String coverImage;

    @Field("updatedAt")
    private LocalDateTime updatedAt;
}
