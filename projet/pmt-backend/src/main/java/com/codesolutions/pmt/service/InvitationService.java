package com.codesolutions.pmt.service;

import com.codesolutions.pmt.dto.InvitationCreateDto;
import com.codesolutions.pmt.dto.InvitationDto;
import com.codesolutions.pmt.dto.UserDto;
import com.codesolutions.pmt.entity.*;
import com.codesolutions.pmt.exception.BusinessException;
import com.codesolutions.pmt.exception.ResourceNotFoundException;
import com.codesolutions.pmt.exception.UnauthorizedException;
import com.codesolutions.pmt.repository.InvitationRepository;
import com.codesolutions.pmt.repository.ProjectMemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for invitation management
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class InvitationService {
    
    private final InvitationRepository invitationRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectService projectService;
    private final UserService userService;
    private final EmailService emailService;
    
    /**
     * Create and send invitation
     */
    @Transactional
    public InvitationDto createInvitation(Long projectId, InvitationCreateDto createDto, Long inviterId) {
        log.info("Creating invitation for email: {} to project: {}", createDto.getEmail(), projectId);
        
        Project project = projectService.getProjectEntityById(projectId);
        User inviter = userService.getUserEntityById(inviterId);
        
        // Check if inviter is admin
        if (!projectService.isUserAdmin(projectId, inviterId)) {
            throw new UnauthorizedException("Only admins can invite members");
        }
        
        // Check if pending invitation already exists
        if (invitationRepository.existsByProjectAndEmailAndStatus(
                project, createDto.getEmail(), InvitationStatus.PENDING)) {
            throw new BusinessException("Pending invitation already exists for this email");
        }
        
        // Check if user is already a member
        try {
            User existingUser = userService.getUserEntityByEmail(createDto.getEmail());
            if (projectService.isUserMember(projectId, existingUser.getId())) {
                throw new BusinessException("User is already a member of this project");
            }
        } catch (ResourceNotFoundException e) {
            // User doesn't exist yet, that's fine
        }
        
        // Create invitation
        Invitation invitation = Invitation.builder()
                .email(createDto.getEmail())
                .project(project)
                .role(createDto.getRole())
                .invitedBy(inviter)
                .token(Invitation.generateToken())
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();
        
        Invitation savedInvitation = invitationRepository.save(invitation);
        
        log.info("Invitation created successfully: {}", savedInvitation.getId());
        
        // Send email notification (in try-catch to prevent transaction rollback on email failure)
        try {
            emailService.sendInvitationEmail(savedInvitation);
        } catch (Exception e) {
            log.warn("Failed to send invitation email, but invitation was created successfully", e);
        }
        
        return mapToDto(savedInvitation);
    }
    
    /**
     * Accept invitation
     */
    @Transactional
    public void acceptInvitation(String token, Long userId) {
        log.info("Accepting invitation with token: {}", token);
        
        Invitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));
        
        // Validate invitation
        if (!invitation.isPending()) {
            throw new BusinessException("Invitation has already been " + invitation.getStatus().name().toLowerCase());
        }
        
        if (invitation.isExpired()) {
            throw new BusinessException("Invitation has expired");
        }
        
        User user = userService.getUserEntityById(userId);
        
        // Check if email matches
        if (!user.getEmail().equals(invitation.getEmail())) {
            throw new BusinessException("This invitation is for a different email address");
        }
        
        // Check if already a member
        if (projectService.isUserMember(invitation.getProject().getId(), userId)) {
            throw new BusinessException("You are already a member of this project");
        }
        
        // Accept invitation
        invitation.accept(user);
        invitationRepository.save(invitation);
        
        // Add user to project
        ProjectMember member = ProjectMember.builder()
                .project(invitation.getProject())
                .user(user)
                .role(invitation.getRole())
                .build();
        
        projectMemberRepository.save(member);
        
        log.info("Invitation accepted successfully");
    }
    
    /**
     * Reject invitation
     */
    @Transactional
    public void rejectInvitation(String token, Long userId) {
        log.info("Rejecting invitation with token: {}", token);
        
        Invitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));
        
        if (!invitation.isPending()) {
            throw new BusinessException("Invitation has already been " + invitation.getStatus().name().toLowerCase());
        }
        
        User user = userService.getUserEntityById(userId);
        
        if (!user.getEmail().equals(invitation.getEmail())) {
            throw new BusinessException("This invitation is for a different email address");
        }
        
        invitation.reject();
        invitationRepository.save(invitation);
        
        log.info("Invitation rejected successfully");
    }
    
    /**
     * Get invitations for a project
     */
    @Transactional(readOnly = true)
    public List<InvitationDto> getProjectInvitations(Long projectId, Long userId) {
        log.info("Getting invitations for project: {}", projectId);
        
        if (!projectService.isUserAdmin(projectId, userId)) {
            throw new UnauthorizedException("Only admins can view invitations");
        }
        
        Project project = projectService.getProjectEntityById(projectId);
        List<Invitation> invitations = invitationRepository.findByProject(project);
        
        return invitations.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get pending invitations for a user's email
     */
    @Transactional(readOnly = true)
    public List<InvitationDto> getUserPendingInvitations(String email) {
        log.info("Getting pending invitations for email: {}", email);
        
        List<Invitation> invitations = invitationRepository.findByEmailAndStatus(email, InvitationStatus.PENDING);
        
        return invitations.stream()
                .filter(inv -> !inv.isExpired())
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Cancel invitation
     */
    @Transactional
    public void cancelInvitation(Long invitationId, Long userId) {
        log.info("Canceling invitation: {}", invitationId);
        
        Invitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation", "id", invitationId));
        
        if (!projectService.isUserAdmin(invitation.getProject().getId(), userId)) {
            throw new UnauthorizedException("Only admins can cancel invitations");
        }
        
        invitationRepository.delete(invitation);
        log.info("Invitation canceled successfully");
    }
    
    /**
     * Resend invitation email
     */
    @Transactional
    public void resendInvitation(Long invitationId, Long userId) {
        log.info("Resending invitation: {}", invitationId);
        
        Invitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation", "id", invitationId));
        
        if (!projectService.isUserAdmin(invitation.getProject().getId(), userId)) {
            throw new UnauthorizedException("Only admins can resend invitations");
        }
        
        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new BusinessException("Can only resend pending invitations");
        }
        
        if (invitation.isExpired()) {
            // Update expiration date
            invitation.setExpiresAt(LocalDateTime.now().plusDays(7));
        }
        
        invitationRepository.save(invitation);
        
        // Send email notification (in try-catch to prevent transaction rollback on email failure)
        try {
            emailService.sendInvitationEmail(invitation);
        } catch (Exception e) {
            log.warn("Failed to resend invitation email, but invitation was updated successfully", e);
        }
        
        log.info("Invitation email resent successfully");
    }
    
    /**
     * Map Invitation to InvitationDto
     */
    private InvitationDto mapToDto(Invitation invitation) {
        UserDto inviterDto = UserDto.builder()
                .id(invitation.getInvitedBy().getId())
                .email(invitation.getInvitedBy().getEmail())
                .firstName(invitation.getInvitedBy().getFirstName())
                .lastName(invitation.getInvitedBy().getLastName())
                .fullName(invitation.getInvitedBy().getFullName())
                .build();
        
        return InvitationDto.builder()
                .id(invitation.getId())
                .email(invitation.getEmail())
                .projectId(invitation.getProject().getId())
                .projectName(invitation.getProject().getName())
                .role(invitation.getRole())
                .status(invitation.getStatus())
                .invitedBy(inviterDto)
                .token(invitation.getToken())
                .expiresAt(invitation.getExpiresAt())
                .createdAt(invitation.getCreatedAt())
                .expired(invitation.isExpired())
                .build();
    }
}
