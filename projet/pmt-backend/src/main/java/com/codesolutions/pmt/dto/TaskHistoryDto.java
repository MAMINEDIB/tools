package com.codesolutions.pmt.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for task history response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskHistoryDto {
    private Long id;
    private String fieldName;
    private String oldValue;
    private String newValue;
    private UserDto modifiedBy;
    private LocalDateTime modifiedAt;
}
