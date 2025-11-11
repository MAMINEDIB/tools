package com.codesolutions.pmt.repository;

import com.codesolutions.pmt.entity.Invitation;
import com.codesolutions.pmt.entity.InvitationStatus;
import com.codesolutions.pmt.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Invitation entity
 */
@Repository
public interface InvitationRepository extends JpaRepository<Invitation, Long> {
    
    /**
     * Find invitation by token
     */
    Optional<Invitation> findByToken(String token);
    
    /**
     * Find all invitations for a project
     */
    List<Invitation> findByProject(Project project);
    
    /**
     * Find invitations by email
     */
    List<Invitation> findByEmail(String email);
    
    /**
     * Find invitations by email and status
     */
    List<Invitation> findByEmailAndStatus(String email, InvitationStatus status);
    
    /**
     * Find pending invitations for a project and email
     */
    Optional<Invitation> findByProjectAndEmailAndStatus(
        Project project, 
        String email, 
        InvitationStatus status
    );
    
    /**
     * Check if pending invitation exists for email and project
     */
    boolean existsByProjectAndEmailAndStatus(
        Project project, 
        String email, 
        InvitationStatus status
    );
}
