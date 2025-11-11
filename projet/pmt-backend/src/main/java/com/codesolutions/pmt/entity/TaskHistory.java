package com.codesolutions.pmt.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Task History entity - Audit log for task changes
 */
@Entity
@Table(name = "task_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    @ToString.Exclude
    private Task task;
    
    @Column(name = "field_name", nullable = false, length = 100)
    private String fieldName;
    
    @Column(name = "old_value", columnDefinition = "TEXT")
    private String oldValue;
    
    @Column(name = "new_value", columnDefinition = "TEXT")
    private String newValue;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "modified_by_id", nullable = false)
    @ToString.Exclude
    private User modifiedBy;
    
    @CreationTimestamp
    @Column(name = "modified_at", nullable = false, updatable = false)
    private LocalDateTime modifiedAt;
    
    /**
     * Create a history entry for a field change
     */
    public static TaskHistory createHistoryEntry(
            Task task, 
            String fieldName, 
            String oldValue, 
            String newValue, 
            User modifiedBy
    ) {
        return TaskHistory.builder()
                .task(task)
                .fieldName(fieldName)
                .oldValue(oldValue)
                .newValue(newValue)
                .modifiedBy(modifiedBy)
                .build();
    }
}
