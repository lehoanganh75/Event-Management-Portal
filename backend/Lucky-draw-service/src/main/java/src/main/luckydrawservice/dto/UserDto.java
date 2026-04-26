package src.main.luckydrawservice.dto;

public class UserDto {
    private String id;
    private String fullName;
    private String avatarUrl;
    private String email;
    private String role;
    private String bio;

    public UserDto() {}

    public UserDto(String id, String fullName, String avatarUrl, String email, String role) {
        this.id = id;
        this.fullName = fullName;
        this.avatarUrl = avatarUrl;
        this.email = email;
        this.role = role;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
