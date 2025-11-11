package com.codesolutions.pmt.dto;

import com.codesolutions.pmt.entity.TaskPriority;
import com.codesolutions.pmt.entity.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for creating a task
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskCreateDto {
    
    @NotBlank(message = "Task title is required")
    private String title;
    
    private String description;
    
    @NotNull(message = "Project ID is required")
    private Long projectId;
    
    private TaskStatus status;
    
    private TaskPriority priority;
    
    private Long assignedToId;
    
    private LocalDateTime dueDate;
}
