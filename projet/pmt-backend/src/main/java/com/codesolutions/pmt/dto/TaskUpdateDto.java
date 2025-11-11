package com.codesolutions.pmt.dto;

import com.codesolutions.pmt.entity.TaskPriority;
import com.codesolutions.pmt.entity.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for updating a task
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskUpdateDto {
    private String title;
    private String description;
    private TaskStatus status;
    private TaskPriority priority;
    private Long assignedToId;
    private LocalDateTime dueDate;
}
