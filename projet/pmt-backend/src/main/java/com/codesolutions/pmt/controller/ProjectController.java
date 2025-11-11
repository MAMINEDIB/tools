package com.codesolutions.pmt.controller;

import com.codesolutions.pmt.dto.DashboardDto;
import com.codesolutions.pmt.dto.ProjectCreateDto;
import com.codesolutions.pmt.dto.ProjectDto;
import com.codesolutions.pmt.dto.ProjectMemberDto;
import com.codesolutions.pmt.entity.Role;
import com.codesolutions.pmt.service.ProjectService;
import com.codesolutions.pmt.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for project operations
 */
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:80"})
public class ProjectController {
    
    private final ProjectService projectService;
    private final TaskService taskService;
    
    /**
     * Create a new project
     * POST /api/projects
     */
    @PostMapping
    public ResponseEntity<ProjectDto> createProject(
            @Valid @RequestBody ProjectCreateDto createDto,
            @RequestHeader("User-Id") Long userId) {
        log.info("Create project request from user: {}", userId);
        ProjectDto project = projectService.createProject(createDto, userId);
        return new ResponseEntity<>(project, HttpStatus.CREATED);
    }
    
    /**
     * Get all projects for a user
     * GET /api/projects
     */
    @GetMapping
    public ResponseEntity<List<ProjectDto>> getAllUserProjects(@RequestHeader("User-Id") Long userId) {
        log.info("Get all projects request for user: {}", userId);
        List<ProjectDto> projects = projectService.getAllUserProjects(userId);
        return ResponseEntity.ok(projects);
    }
    
    /**
     * Get project by ID
     * GET /api/projects/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProjectDto> getProjectById(
            @PathVariable Long id,
            @RequestHeader("User-Id") Long userId) {
        log.info("Get project request: {} by user: {}", id, userId);
        ProjectDto project = projectService.getProjectById(id, userId);
        return ResponseEntity.ok(project);
    }
    
    /**
     * Update project
     * PUT /api/projects/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProjectDto> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody ProjectCreateDto updateDto,
            @RequestHeader("User-Id") Long userId) {
        log.info("Update project request: {} by user: {}", id, userId);
        ProjectDto project = projectService.updateProject(id, updateDto, userId);
        return ResponseEntity.ok(project);
    }
    
    /**
     * Delete project
     * DELETE /api/projects/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(
            @PathVariable Long id,
            @RequestHeader("User-Id") Long userId) {
        log.info("Delete project request: {} by user: {}", id, userId);
        projectService.deleteProject(id, userId);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Update member role
     * PUT /api/projects/{id}/members/{memberId}/role
     */
    /**
     * Update member role
     * PUT /api/projects/{id}/members/{memberId}/role
     */
    @PutMapping("/{id}/members/{memberId}/role")
    public ResponseEntity<Void> updateMemberRole(
            @PathVariable Long id,
            @PathVariable Long memberId,
            @RequestBody java.util.Map<String, String> payload,
            @RequestHeader("User-Id") Long userId) {
        Role role = Role.valueOf(payload.get("role"));
        log.info("Update member role request: project={}, member={}, role={}", id, memberId, role);
        projectService.updateMemberRole(id, memberId, role, userId);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Get project members
     * GET /api/projects/{id}/members
     */
    @GetMapping("/{id}/members")
    public ResponseEntity<List<ProjectMemberDto>> getProjectMembers(
            @PathVariable Long id,
            @RequestHeader("User-Id") Long userId) {
        log.info("Get members request for project: {}", id);
        List<ProjectMemberDto> members = projectService.getProjectMembers(id, userId);
        return ResponseEntity.ok(members);
    }
    
    /**
     * Remove member from project
     * DELETE /api/projects/{id}/members/{memberId}
     */
    @DeleteMapping("/{id}/members/{memberId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long id,
            @PathVariable Long memberId,
            @RequestHeader("User-Id") Long userId) {
        log.info("Remove member request: project={}, member={}", id, memberId);
        projectService.removeMember(id, memberId, userId);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Get project dashboard
     * GET /api/projects/{id}/dashboard
     */
    @GetMapping("/{id}/dashboard")
    public ResponseEntity<DashboardDto> getDashboard(
            @PathVariable Long id,
            @RequestHeader("User-Id") Long userId) {
        log.info("Get dashboard request for project: {}", id);
        DashboardDto dashboard = taskService.getDashboard(id, userId);
        return ResponseEntity.ok(dashboard);
    }
}
