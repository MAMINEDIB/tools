package com.codesolutions.pmt.service;

import com.codesolutions.pmt.dto.ProjectCreateDto;
import com.codesolutions.pmt.dto.ProjectDto;
import com.codesolutions.pmt.dto.ProjectMemberDto;
import com.codesolutions.pmt.dto.UserDto;
import com.codesolutions.pmt.entity.*;
import com.codesolutions.pmt.exception.BusinessException;
import com.codesolutions.pmt.exception.ResourceNotFoundException;
import com.codesolutions.pmt.exception.UnauthorizedException;
import com.codesolutions.pmt.repository.ProjectMemberRepository;
import com.codesolutions.pmt.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for project management
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectService {
    
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserService userService;
    
    /**
     * Create a new project
     */
    @Transactional
    public ProjectDto createProject(ProjectCreateDto createDto, Long creatorId) {
        log.info("Creating new project: {} by user: {}", createDto.getName(), creatorId);
        
        User creator = userService.getUserEntityById(creatorId);
        
        // Create project
        Project project = Project.builder()
                .name(createDto.getName())
                .description(createDto.getDescription())
                .createdBy(creator)
                .build();
        
        Project savedProject = projectRepository.save(project);
        
        // Add creator as admin
        ProjectMember adminMember = ProjectMember.builder()
                .project(savedProject)
                .user(creator)
                .role(Role.ADMIN)
                .build();
        
        projectMemberRepository.save(adminMember);
        
        log.info("Project created successfully: {}", savedProject.getId());
        return mapToDto(savedProject);
    }
    
    /**
     * Get project by ID
     */
    @Transactional(readOnly = true)
    public ProjectDto getProjectById(Long projectId, Long userId) {
        Project project = getProjectEntityById(projectId);
        
        // Check if user has access to this project
        if (!isUserMember(projectId, userId)) {
            throw new UnauthorizedException("You don't have access to this project");
        }
        
        return mapToDto(project);
    }
    
    /**
     * Get all projects for a user
     */
    @Transactional(readOnly = true)
    public List<ProjectDto> getAllUserProjects(Long userId) {
        log.info("Getting all projects for user: {}", userId);
        
        List<Project> projects = projectRepository.findAllByUser(userId);
        
        return projects.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Update project
     */
    @Transactional
    public ProjectDto updateProject(Long projectId, ProjectCreateDto updateDto, Long userId) {
        log.info("Updating project: {} by user: {}", projectId, userId);
        
        Project project = getProjectEntityById(projectId);
        
        // Check if user is admin
        if (!isUserAdmin(projectId, userId)) {
            throw new UnauthorizedException("Only project admins can update projects");
        }
        
        project.setName(updateDto.getName());
        project.setDescription(updateDto.getDescription());
        
        Project updatedProject = projectRepository.save(project);
        log.info("Project updated successfully: {}", projectId);
        
        return mapToDto(updatedProject);
    }
    
    /**
     * Delete project
     */
    @Transactional
    public void deleteProject(Long projectId, Long userId) {
        log.info("Deleting project: {} by user: {}", projectId, userId);
        
        Project project = getProjectEntityById(projectId);
        
        // Only creator can delete project
        if (!project.getCreatedBy().getId().equals(userId)) {
            throw new UnauthorizedException("Only project creator can delete the project");
        }
        
        projectRepository.delete(project);
        log.info("Project deleted successfully: {}", projectId);
    }
    
    /**
     * Update member role
     */
    @Transactional
    public void updateMemberRole(Long projectId, Long memberId, Role newRole, Long adminId) {
        log.info("Updating member role in project: {}, member: {}, new role: {}", 
                 projectId, memberId, newRole);
        
        // Check if user is admin
        if (!isUserAdmin(projectId, adminId)) {
            throw new UnauthorizedException("Only project admins can change member roles");
        }
        
        Project project = getProjectEntityById(projectId);
        User member = userService.getUserEntityById(memberId);
        
        ProjectMember projectMember = projectMemberRepository.findByProjectAndUser(project, member)
                .orElseThrow(() -> new BusinessException("User is not a member of this project"));
        
        // Cannot change role of project creator
        if (project.getCreatedBy().getId().equals(memberId)) {
            throw new BusinessException("Cannot change role of project creator");
        }
        
        projectMember.setRole(newRole);
        projectMemberRepository.save(projectMember);
        
        log.info("Member role updated successfully");
    }
    
    /**
     * Remove member from project
     */
    @Transactional
    public void removeMember(Long projectId, Long memberId, Long adminId) {
        log.info("Removing member from project: {}, member: {}", projectId, memberId);
        
        // Check if user is admin
        if (!isUserAdmin(projectId, adminId)) {
            throw new UnauthorizedException("Only project admins can remove members");
        }
        
        Project project = getProjectEntityById(projectId);
        
        // Cannot remove project creator
        if (project.getCreatedBy().getId().equals(memberId)) {
            throw new BusinessException("Cannot remove project creator");
        }
        
        User member = userService.getUserEntityById(memberId);
        
        ProjectMember projectMember = projectMemberRepository.findByProjectAndUser(project, member)
                .orElseThrow(() -> new BusinessException("User is not a member of this project"));
        
        projectMemberRepository.delete(projectMember);
        log.info("Member removed successfully");
    }
    
    /**
     * Get project members
     */
    @Transactional(readOnly = true)
    public List<ProjectMemberDto> getProjectMembers(Long projectId, Long userId) {
        log.info("Getting members for project: {}", projectId);
        
        // Check if user is a member
        if (!isUserMember(projectId, userId)) {
            throw new UnauthorizedException("You must be a project member to view members");
        }
        
        Project project = getProjectEntityById(projectId);
        List<ProjectMember> members = projectMemberRepository.findByProject(project);
        
        return members.stream()
                .map(this::mapToMemberDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Check if user is a member of the project
     */
    public boolean isUserMember(Long projectId, Long userId) {
        Project project = getProjectEntityById(projectId);
        User user = userService.getUserEntityById(userId);
        return projectMemberRepository.existsByProjectAndUser(project, user);
    }
    
    /**
     * Check if user is admin of the project
     */
    public boolean isUserAdmin(Long projectId, Long userId) {
        Project project = getProjectEntityById(projectId);
        User user = userService.getUserEntityById(userId);
        
        return projectMemberRepository.findByProjectAndUser(project, user)
                .map(ProjectMember::isAdmin)
                .orElse(false);
    }
    
    /**
     * Check if user can edit tasks in the project
     */
    public boolean canUserEdit(Long projectId, Long userId) {
        Project project = getProjectEntityById(projectId);
        User user = userService.getUserEntityById(userId);
        
        return projectMemberRepository.findByProjectAndUser(project, user)
                .map(ProjectMember::canEdit)
                .orElse(false);
    }
    
    /**
     * Get project entity by ID (internal use)
     */
    @Transactional(readOnly = true)
    public Project getProjectEntityById(Long projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));
    }
    
    /**
     * Map Project entity to ProjectDto
     */
    private ProjectDto mapToDto(Project project) {
        UserDto creatorDto = UserDto.builder()
                .id(project.getCreatedBy().getId())
                .email(project.getCreatedBy().getEmail())
                .firstName(project.getCreatedBy().getFirstName())
                .lastName(project.getCreatedBy().getLastName())
                .fullName(project.getCreatedBy().getFullName())
                .build();
        
        return ProjectDto.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .createdBy(creatorDto)
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .memberCount(project.getMembers() != null ? project.getMembers().size() : 0)
                .taskCount(project.getTasks() != null ? project.getTasks().size() : 0)
                .build();
    }
    
    /**
     * Map ProjectMember entity to ProjectMemberDto
     */
    private ProjectMemberDto mapToMemberDto(ProjectMember member) {
        UserDto userDto = UserDto.builder()
                .id(member.getUser().getId())
                .email(member.getUser().getEmail())
                .firstName(member.getUser().getFirstName())
                .lastName(member.getUser().getLastName())
                .fullName(member.getUser().getFullName())
                .build();
        
        return ProjectMemberDto.builder()
                .id(member.getId())
                .user(userDto)
                .role(member.getRole())
                .joinedAt(member.getJoinedAt())
                .build();
    }
}
