package src.main.luckydrawservice.dto;

public class UserDto {
    private String id;
    private String fullName;
    private String avatarUrl;
    private String email;

    public UserDto() {}

    public UserDto(String id, String fullName, String avatarUrl, String email) {
        this.id = id;
        this.fullName = fullName;
        this.avatarUrl = avatarUrl;
        this.email = email;
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
