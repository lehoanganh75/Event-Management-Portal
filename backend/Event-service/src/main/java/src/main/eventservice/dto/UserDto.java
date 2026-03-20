package src.main.eventservice.dto;

import lombok.Data;

@Data
public class UserDto {
    private String id;
    private String fullName;
    private String avatarUrl;
}