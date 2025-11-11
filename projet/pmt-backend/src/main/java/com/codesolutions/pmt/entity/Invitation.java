package com.codesolutions.pmt.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Invitation entity - Project invitations sent via email
 */
@Entity
@Table(name = "invitation")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invitation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 255)
    private String email;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @ToString.Exclude
    private Project project;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Role role = Role.MEMBER;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private InvitationStatus status = InvitationStatus.PENDING;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invited_by_id", nullable = false)
    @ToString.Exclude
    private User invitedBy;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invited_user_id")
    @ToString.Exclude
    private User invitedUser;
    
    @Column(nullable = false, unique = true, length = 255)
    private String token;
    
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;
    
    /**
     * Generate unique invitation token
     */
    public static String generateToken() {
        return "inv-" + UUID.randomUUID().toString();
    }
    
    /**
     * Check if invitation is expired
     */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
    
    /**
     * Check if invitation is pending
     */
    public boolean isPending() {
        return status == InvitationStatus.PENDING;
    }
    
    /**
     * Accept the invitation
     */
    public void accept(User user) {
        this.status = InvitationStatus.ACCEPTED;
        this.invitedUser = user;
        this.acceptedAt = LocalDateTime.now();
    }
    
    /**
     * Reject the invitation
     */
    public void reject() {
        this.status = InvitationStatus.REJECTED;
    }
}
