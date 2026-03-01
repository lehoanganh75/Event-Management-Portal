package src.main.authservice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import src.main.authservice.entity.Role;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserTokenInfo {
    private String userName;
    private String accountId;
    private String email;
    private Set<Role> roles;
    private String userProfileId;
}
