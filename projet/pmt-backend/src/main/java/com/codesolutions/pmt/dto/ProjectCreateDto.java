package com.codesolutions.pmt.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating a project
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectCreateDto {
    
    @NotBlank(message = "Project name is required")
    private String name;
    
    private String description;
}
