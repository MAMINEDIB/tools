package com.codesolutions.pmt.repository;

import com.codesolutions.pmt.entity.Task;
import com.codesolutions.pmt.entity.TaskHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for TaskHistory entity
 */
@Repository
public interface TaskHistoryRepository extends JpaRepository<TaskHistory, Long> {
    
    /**
     * Find all history entries for a task
     */
    List<TaskHistory> findByTaskOrderByModifiedAtDesc(Task task);
    
    /**
     * Find all history entries for a task by task ID
     */
    List<TaskHistory> findByTaskIdOrderByModifiedAtDesc(Long taskId);
}
