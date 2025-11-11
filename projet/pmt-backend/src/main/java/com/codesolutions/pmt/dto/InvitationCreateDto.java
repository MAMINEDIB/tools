package com.codesolutions.pmt.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.codesolutions.pmt.entity.Role;

/**
 * DTO for inviting a user to a project
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvitationCreateDto {
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;
    
    @NotNull(message = "Role is required")
    private Role role;
}
