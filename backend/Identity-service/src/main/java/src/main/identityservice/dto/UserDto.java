package src.main.identityservice.dto;

import lombok.Data;
import src.main.identityservice.entity.User;

@Data
public class UserDto {
    private String id;
    private String fullName;
    private String avatarUrl;

    public static UserDto from(User user) {
        if (user == null) return null;

        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setAvatarUrl(user.getAvatarUrl());
        return dto;
    }
}