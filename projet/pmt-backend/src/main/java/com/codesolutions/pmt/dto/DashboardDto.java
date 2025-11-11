package com.codesolutions.pmt.dto;

import com.codesolutions.pmt.entity.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

/**
 * DTO for project dashboard statistics
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardDto {
    private Long projectId;
    private String projectName;
    @Builder.Default
    private Map<TaskStatus, Long> taskCountByStatus = new HashMap<>();
    private long totalTasks;
    private int totalMembers;
}
