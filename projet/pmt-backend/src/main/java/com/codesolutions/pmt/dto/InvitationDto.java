package com.codesolutions.pmt.dto;

import com.codesolutions.pmt.entity.InvitationStatus;
import com.codesolutions.pmt.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for invitation response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvitationDto {
    private Long id;
    private String email;
    private Long projectId;
    private String projectName;
    private Role role;
    private InvitationStatus status;
    private UserDto invitedBy;
    private String token;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    private boolean expired;
}
