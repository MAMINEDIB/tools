package com.codesolutions.pmt.controller;

import com.codesolutions.pmt.dto.TaskCreateDto;
import com.codesolutions.pmt.dto.TaskDto;
import com.codesolutions.pmt.dto.TaskHistoryDto;
import com.codesolutions.pmt.dto.TaskUpdateDto;
import com.codesolutions.pmt.entity.TaskStatus;
import com.codesolutions.pmt.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for task operations
 */
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:80"})
public class TaskController {
    
    private final TaskService taskService;
    
    /**
     * Create a new task
     * POST /api/tasks
     */
    @PostMapping
    public ResponseEntity<TaskDto> createTask(
            @Valid @RequestBody TaskCreateDto createDto,
            @RequestHeader("User-Id") Long userId) {
        log.info("Create task request from user: {}", userId);
        TaskDto task = taskService.createTask(createDto, userId);
        return new ResponseEntity<>(task, HttpStatus.CREATED);
    }
    
    /**
     * Get task by ID
     * GET /api/tasks/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<TaskDto> getTaskById(
            @PathVariable Long id,
            @RequestHeader("User-Id") Long userId) {
        log.info("Get task request: {} by user: {}", id, userId);
        TaskDto task = taskService.getTaskById(id, userId);
        return ResponseEntity.ok(task);
    }
    
    /**
     * Get all tasks for a project
     * GET /api/tasks/project/{projectId}
     */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<TaskDto>> getProjectTasks(
            @PathVariable Long projectId,
            @RequestHeader("User-Id") Long userId) {
        log.info("Get project tasks request: project={} by user={}", projectId, userId);
        List<TaskDto> tasks = taskService.getProjectTasks(projectId, userId);
        return ResponseEntity.ok(tasks);
    }
    
    /**
     * Get tasks by status
     * GET /api/tasks/project/{projectId}/status/{status}
     */
    @GetMapping("/project/{projectId}/status/{status}")
    public ResponseEntity<List<TaskDto>> getTasksByStatus(
            @PathVariable Long projectId,
            @PathVariable TaskStatus status,
            @RequestHeader("User-Id") Long userId) {
        log.info("Get tasks by status: project={}, status={}", projectId, status);
        List<TaskDto> tasks = taskService.getTasksByStatus(projectId, status, userId);
        return ResponseEntity.ok(tasks);
    }
    
    /**
     * Get tasks assigned to current user
     * GET /api/tasks/assigned
     */
    @GetMapping("/assigned")
    public ResponseEntity<List<TaskDto>> getAssignedTasks(@RequestHeader("User-Id") Long userId) {
        log.info("Get assigned tasks for user: {}", userId);
        List<TaskDto> tasks = taskService.getUserAssignedTasks(userId);
        return ResponseEntity.ok(tasks);
    }
    
    /**
     * Update task
     * PUT /api/tasks/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<TaskDto> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskUpdateDto updateDto,
            @RequestHeader("User-Id") Long userId) {
        log.info("Update task request: {} by user: {}", id, userId);
        TaskDto task = taskService.updateTask(id, updateDto, userId);
        return ResponseEntity.ok(task);
    }
    
    /**
     * Delete task
     * DELETE /api/tasks/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable Long id,
            @RequestHeader("User-Id") Long userId) {
        log.info("Delete task request: {} by user: {}", id, userId);
        taskService.deleteTask(id, userId);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Get task history
     * GET /api/tasks/{id}/history
     */
    @GetMapping("/{id}/history")
    public ResponseEntity<List<TaskHistoryDto>> getTaskHistory(
            @PathVariable Long id,
            @RequestHeader("User-Id") Long userId) {
        log.info("Get task history: {}", id);
        List<TaskHistoryDto> history = taskService.getTaskHistory(id, userId);
        return ResponseEntity.ok(history);
    }
}
