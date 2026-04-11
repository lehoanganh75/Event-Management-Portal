package com.identityservice.dto;

import lombok.Data;
import com.identityservice.entity.User;

@Data
public class UserDto {
    private String id;
    private String fullName;
    private String avatarUrl;
    private String email;

    public static UserDto from(User user) {
        if (user == null) return null;

        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setEmail(user.getAccount().getEmail());
        return dto;
    }
}