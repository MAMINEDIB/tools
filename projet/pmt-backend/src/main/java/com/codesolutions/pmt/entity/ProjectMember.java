package com.codesolutions.pmt.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Project Member entity - Junction table for User-Project relationship
 */
@Entity
@Table(name = "project_member", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"project_id", "user_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectMember {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @ToString.Exclude
    private Project project;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    private User user;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Role role = Role.MEMBER;
    
    @CreationTimestamp
    @Column(name = "joined_at", nullable = false, updatable = false)
    private LocalDateTime joinedAt;
    
    /**
     * Check if user is admin
     */
    public boolean isAdmin() {
        return role == Role.ADMIN;
    }
    
    /**
     * Check if user is member
     */
    public boolean isMember() {
        return role == Role.MEMBER;
    }
    
    /**
     * Check if user is observer
     */
    public boolean isObserver() {
        return role == Role.OBSERVER;
    }
    
    /**
     * Check if user can edit (admin or member)
     */
    public boolean canEdit() {
        return role == Role.ADMIN || role == Role.MEMBER;
    }
}
