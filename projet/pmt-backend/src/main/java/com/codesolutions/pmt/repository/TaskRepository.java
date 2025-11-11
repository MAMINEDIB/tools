package com.codesolutions.pmt.repository;

import com.codesolutions.pmt.entity.Project;
import com.codesolutions.pmt.entity.Task;
import com.codesolutions.pmt.entity.TaskStatus;
import com.codesolutions.pmt.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Task entity
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    
    /**
     * Find all tasks in a project
     */
    List<Task> findByProject(Project project);
    
    /**
     * Find tasks by project and status
     */
    List<Task> findByProjectAndStatus(Project project, TaskStatus status);
    
    /**
     * Find tasks assigned to a user
     */
    List<Task> findByAssignedTo(User user);
    
    /**
     * Find tasks created by a user
     */
    List<Task> findByCreatedBy(User user);
    
    /**
     * Find tasks by project and assigned user
     */
    List<Task> findByProjectAndAssignedTo(Project project, User user);
    
    /**
     * Count tasks by project and status
     */
    long countByProjectAndStatus(Project project, TaskStatus status);
    
    /**
     * Get dashboard data (tasks grouped by status)
     */
    @Query("SELECT t.status, COUNT(t) FROM Task t " +
           "WHERE t.project.id = :projectId " +
           "GROUP BY t.status")
    List<Object[]> getDashboardStats(@Param("projectId") Long projectId);
}
