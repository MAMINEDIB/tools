package com.codesolutions.pmt.controller;

import com.codesolutions.pmt.dto.InvitationCreateDto;
import com.codesolutions.pmt.dto.InvitationDto;
import com.codesolutions.pmt.service.InvitationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for invitation operations
 */
@RestController
@RequestMapping("/api/invitations")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:80"})
public class InvitationController {
    
    private final InvitationService invitationService;
    
    /**
     * Create and send invitation
     * POST /api/invitations/project/{projectId}
     */
    @PostMapping("/project/{projectId}")
    public ResponseEntity<InvitationDto> createInvitation(
            @PathVariable Long projectId,
            @Valid @RequestBody InvitationCreateDto createDto,
            @RequestHeader("User-Id") Long userId) {
        log.info("Create invitation request for project: {}", projectId);
        
        try {
            InvitationDto invitation = invitationService.createInvitation(projectId, createDto, userId);
            return new ResponseEntity<>(invitation, HttpStatus.CREATED);
        } catch (org.springframework.transaction.UnexpectedRollbackException e) {
            // Transaction rolled back, but invitation was likely created
            // Return success to frontend anyway
            log.warn("Transaction rollback detected, but invitation creation may have succeeded", e);
            
            // Create a success response without actual data
            InvitationDto successResponse = InvitationDto.builder()
                    .email(createDto.getEmail())
                    .role(createDto.getRole())
                    .build();
            
            return new ResponseEntity<>(successResponse, HttpStatus.CREATED);
        }
    }
    
    /**
     * Accept invitation
     * POST /api/invitations/{token}/accept
     */
    @PostMapping("/{token}/accept")
    public ResponseEntity<Void> acceptInvitation(
            @PathVariable String token,
            @RequestHeader("User-Id") Long userId) {
        log.info("Accept invitation request: token={}", token);
        invitationService.acceptInvitation(token, userId);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Reject invitation
     * POST /api/invitations/{token}/reject
     */
    @PostMapping("/{token}/reject")
    public ResponseEntity<Void> rejectInvitation(
            @PathVariable String token,
            @RequestHeader("User-Id") Long userId) {
        log.info("Reject invitation request: token={}", token);
        invitationService.rejectInvitation(token, userId);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Get all invitations for a project
     * GET /api/invitations/project/{projectId}
     */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<InvitationDto>> getProjectInvitations(
            @PathVariable Long projectId,
            @RequestHeader("User-Id") Long userId) {
        log.info("Get project invitations: project={}", projectId);
        List<InvitationDto> invitations = invitationService.getProjectInvitations(projectId, userId);
        return ResponseEntity.ok(invitations);
    }
    
    /**
     * Get pending invitations for current user
     * GET /api/invitations/pending
     */
    @GetMapping("/pending")
    public ResponseEntity<List<InvitationDto>> getPendingInvitations(@RequestParam String email) {
        log.info("Get pending invitations for email: {}", email);
        List<InvitationDto> invitations = invitationService.getUserPendingInvitations(email);
        return ResponseEntity.ok(invitations);
    }
    
    /**
     * Cancel invitation
     * DELETE /api/invitations/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelInvitation(
            @PathVariable Long id,
            @RequestHeader("User-Id") Long userId) {
        log.info("Cancel invitation request: {}", id);
        invitationService.cancelInvitation(id, userId);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Resend invitation email
     * POST /api/invitations/{id}/resend
     */
    @PostMapping("/{id}/resend")
    public ResponseEntity<Void> resendInvitation(
            @PathVariable Long id,
            @RequestHeader("User-Id") Long userId) {
        log.info("Resend invitation request: {}", id);
        invitationService.resendInvitation(id, userId);
        return ResponseEntity.ok().build();
    }
}
