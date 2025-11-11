package com.codesolutions.pmt.dto;

import com.codesolutions.pmt.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for project member response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectMemberDto {
    private Long id;
    private UserDto user;
    private Role role;
    private LocalDateTime joinedAt;
}
