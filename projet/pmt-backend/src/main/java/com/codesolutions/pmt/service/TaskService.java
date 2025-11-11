package com.codesolutions.pmt.service;

import com.codesolutions.pmt.dto.*;
import com.codesolutions.pmt.entity.*;
import com.codesolutions.pmt.exception.BusinessException;
import com.codesolutions.pmt.exception.ResourceNotFoundException;
import com.codesolutions.pmt.exception.UnauthorizedException;
import com.codesolutions.pmt.repository.TaskHistoryRepository;
import com.codesolutions.pmt.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for task management
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TaskService {
    
    private final TaskRepository taskRepository;
    private final TaskHistoryRepository taskHistoryRepository;
    private final ProjectService projectService;
    private final UserService userService;
    private final EmailService emailService;
    
    /**
     * Create a new task
     */
    @Transactional
    public TaskDto createTask(TaskCreateDto createDto, Long creatorId) {
        log.info("Creating new task: {} in project: {}", createDto.getTitle(), createDto.getProjectId());
        
        Project project = projectService.getProjectEntityById(createDto.getProjectId());
        User creator = userService.getUserEntityById(creatorId);
        
        // Check if user can create tasks
        if (!projectService.canUserEdit(createDto.getProjectId(), creatorId)) {
            throw new UnauthorizedException("You don't have permission to create tasks in this project");
        }
        
        // Build task
        Task task = Task.builder()
                .title(createDto.getTitle())
                .description(createDto.getDescription())
                .status(createDto.getStatus() != null ? createDto.getStatus() : TaskStatus.TODO)
                .priority(createDto.getPriority())
                .project(project)
                .createdBy(creator)
                .dueDate(createDto.getDueDate())
                .build();
        
        // Set assigned user if provided
        if (createDto.getAssignedToId() != null) {
            User assignedUser = userService.getUserEntityById(createDto.getAssignedToId());
            
            // Check if assigned user is a member
            if (!projectService.isUserMember(createDto.getProjectId(), createDto.getAssignedToId())) {
                throw new BusinessException("Assigned user must be a member of the project");
            }
            
            task.setAssignedTo(assignedUser);
            
            // Send notification email
            emailService.sendTaskAssignmentNotification(assignedUser, task);
        }
        
        Task savedTask = taskRepository.save(task);
        log.info("Task created successfully: {}", savedTask.getId());
        
        return mapToDto(savedTask);
    }
    
    /**
     * Get task by ID
     */
    @Transactional(readOnly = true)
    public TaskDto getTaskById(Long taskId, Long userId) {
        Task task = getTaskEntityById(taskId);
        
        // Check if user has access to this task's project
        if (!projectService.isUserMember(task.getProject().getId(), userId)) {
            throw new UnauthorizedException("You don't have access to this task");
        }
        
        return mapToDto(task);
    }
    
    /**
     * Get all tasks in a project
     */
    @Transactional(readOnly = true)
    public List<TaskDto> getProjectTasks(Long projectId, Long userId) {
        log.info("Getting all tasks for project: {}", projectId);
        
        // Check if user is a member
        if (!projectService.isUserMember(projectId, userId)) {
            throw new UnauthorizedException("You don't have access to this project");
        }
        
        Project project = projectService.getProjectEntityById(projectId);
        List<Task> tasks = taskRepository.findByProject(project);
        
        return tasks.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get tasks by status
     */
    @Transactional(readOnly = true)
    public List<TaskDto> getTasksByStatus(Long projectId, TaskStatus status, Long userId) {
        log.info("Getting tasks with status: {} for project: {}", status, projectId);
        
        if (!projectService.isUserMember(projectId, userId)) {
            throw new UnauthorizedException("You don't have access to this project");
        }
        
        Project project = projectService.getProjectEntityById(projectId);
        List<Task> tasks = taskRepository.findByProjectAndStatus(project, status);
        
        return tasks.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get tasks assigned to a user
     */
    @Transactional(readOnly = true)
    public List<TaskDto> getUserAssignedTasks(Long userId) {
        log.info("Getting assigned tasks for user: {}", userId);
        
        User user = userService.getUserEntityById(userId);
        List<Task> tasks = taskRepository.findByAssignedTo(user);
        
        return tasks.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Update task
     */
    @Transactional
    public TaskDto updateTask(Long taskId, TaskUpdateDto updateDto, Long userId) {
        log.info("Updating task: {} by user: {}", taskId, userId);
        
        Task task = getTaskEntityById(taskId);
        User modifier = userService.getUserEntityById(userId);
        
        // Check if user can edit
        if (!projectService.canUserEdit(task.getProject().getId(), userId)) {
            throw new UnauthorizedException("You don't have permission to edit tasks in this project");
        }
        
        // Track changes for history
        if (updateDto.getTitle() != null && !updateDto.getTitle().equals(task.getTitle())) {
            createHistoryEntry(task, "title", task.getTitle(), updateDto.getTitle(), modifier);
            task.setTitle(updateDto.getTitle());
        }
        
        if (updateDto.getDescription() != null && !updateDto.getDescription().equals(task.getDescription())) {
            createHistoryEntry(task, "description", task.getDescription(), updateDto.getDescription(), modifier);
            task.setDescription(updateDto.getDescription());
        }
        
        if (updateDto.getStatus() != null && !updateDto.getStatus().equals(task.getStatus())) {
            createHistoryEntry(task, "status", task.getStatus().name(), updateDto.getStatus().name(), modifier);
            task.setStatus(updateDto.getStatus());
        }
        
        if (updateDto.getPriority() != null && !updateDto.getPriority().equals(task.getPriority())) {
            String oldPriority = task.getPriority() != null ? task.getPriority().name() : "null";
            createHistoryEntry(task, "priority", oldPriority, updateDto.getPriority().name(), modifier);
            task.setPriority(updateDto.getPriority());
        }
        
        if (updateDto.getAssignedToId() != null) {
            User newAssignee = userService.getUserEntityById(updateDto.getAssignedToId());
            
            // Check if assigned user is a member
            if (!projectService.isUserMember(task.getProject().getId(), updateDto.getAssignedToId())) {
                throw new BusinessException("Assigned user must be a member of the project");
            }
            
            String oldAssignee = task.getAssignedTo() != null ? task.getAssignedTo().getFullName() : "Unassigned";
            createHistoryEntry(task, "assigned_to", oldAssignee, newAssignee.getFullName(), modifier);
            
            // Send notification if assignee changed
            if (task.getAssignedTo() == null || !task.getAssignedTo().getId().equals(newAssignee.getId())) {
                emailService.sendTaskAssignmentNotification(newAssignee, task);
            }
            
            task.setAssignedTo(newAssignee);
        }
        
        if (updateDto.getDueDate() != null) {
            createHistoryEntry(task, "due_date", 
                             task.getDueDate() != null ? task.getDueDate().toString() : "null", 
                             updateDto.getDueDate().toString(), modifier);
            task.setDueDate(updateDto.getDueDate());
        }
        
        Task updatedTask = taskRepository.save(task);
        log.info("Task updated successfully: {}", taskId);
        
        return mapToDto(updatedTask);
    }
    
    /**
     * Delete task
     */
    @Transactional
    public void deleteTask(Long taskId, Long userId) {
        log.info("Deleting task: {} by user: {}", taskId, userId);
        
        Task task = getTaskEntityById(taskId);
        
        // Check if user is admin or creator
        if (!projectService.isUserAdmin(task.getProject().getId(), userId) 
            && !task.getCreatedBy().getId().equals(userId)) {
            throw new UnauthorizedException("Only admins or task creator can delete tasks");
        }
        
        taskRepository.delete(task);
        log.info("Task deleted successfully: {}", taskId);
    }
    
    /**
     * Get task history
     */
    @Transactional(readOnly = true)
    public List<TaskHistoryDto> getTaskHistory(Long taskId, Long userId) {
        Task task = getTaskEntityById(taskId);
        
        // Check if user has access
        if (!projectService.isUserMember(task.getProject().getId(), userId)) {
            throw new UnauthorizedException("You don't have access to this task");
        }
        
        List<TaskHistory> history = taskHistoryRepository.findByTaskIdOrderByModifiedAtDesc(taskId);
        
        return history.stream()
                .map(this::mapHistoryToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get dashboard statistics
     */
    @Transactional(readOnly = true)
    public DashboardDto getDashboard(Long projectId, Long userId) {
        log.info("Getting dashboard for project: {}", projectId);
        
        if (!projectService.isUserMember(projectId, userId)) {
            throw new UnauthorizedException("You don't have access to this project");
        }
        
        Project project = projectService.getProjectEntityById(projectId);
        
        DashboardDto dashboard = DashboardDto.builder()
                .projectId(projectId)
                .projectName(project.getName())
                .build();
        
        // Get task counts by status
        for (TaskStatus status : TaskStatus.values()) {
            long count = taskRepository.countByProjectAndStatus(project, status);
            dashboard.getTaskCountByStatus().put(status, count);
        }
        
        dashboard.setTotalTasks(project.getTasks().size());
        dashboard.setTotalMembers(project.getMembers().size());
        
        return dashboard;
    }
    
    /**
     * Create history entry
     */
    private void createHistoryEntry(Task task, String fieldName, String oldValue, String newValue, User modifier) {
        TaskHistory history = TaskHistory.builder()
                .task(task)
                .fieldName(fieldName)
                .oldValue(oldValue)
                .newValue(newValue)
                .modifiedBy(modifier)
                .build();
        
        taskHistoryRepository.save(history);
    }
    
    /**
     * Get task entity by ID (internal use)
     */
    private Task getTaskEntityById(Long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
    }
    
    /**
     * Map Task entity to TaskDto
     */
    private TaskDto mapToDto(Task task) {
        UserDto creatorDto = UserDto.builder()
                .id(task.getCreatedBy().getId())
                .email(task.getCreatedBy().getEmail())
                .firstName(task.getCreatedBy().getFirstName())
                .lastName(task.getCreatedBy().getLastName())
                .fullName(task.getCreatedBy().getFullName())
                .build();
        
        UserDto assignedToDto = null;
        if (task.getAssignedTo() != null) {
            assignedToDto = UserDto.builder()
                    .id(task.getAssignedTo().getId())
                    .email(task.getAssignedTo().getEmail())
                    .firstName(task.getAssignedTo().getFirstName())
                    .lastName(task.getAssignedTo().getLastName())
                    .fullName(task.getAssignedTo().getFullName())
                    .build();
        }
        
        return TaskDto.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .projectId(task.getProject().getId())
                .projectName(task.getProject().getName())
                .assignedTo(assignedToDto)
                .createdBy(creatorDto)
                .dueDate(task.getDueDate())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .overdue(task.isOverdue())
                .build();
    }
    
    /**
     * Map TaskHistory to TaskHistoryDto
     */
    private TaskHistoryDto mapHistoryToDto(TaskHistory history) {
        UserDto modifierDto = UserDto.builder()
                .id(history.getModifiedBy().getId())
                .email(history.getModifiedBy().getEmail())
                .firstName(history.getModifiedBy().getFirstName())
                .lastName(history.getModifiedBy().getLastName())
                .fullName(history.getModifiedBy().getFullName())
                .build();
        
        return TaskHistoryDto.builder()
                .id(history.getId())
                .fieldName(history.getFieldName())
                .oldValue(history.getOldValue())
                .newValue(history.getNewValue())
                .modifiedBy(modifierDto)
                .modifiedAt(history.getModifiedAt())
                .build();
    }
}
