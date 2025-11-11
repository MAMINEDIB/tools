package com.codesolutions.pmt.entity;

/**
 * Invitation status enumeration
 */
public enum InvitationStatus {
    /**
     * Invitation sent but not yet accepted/rejected
     */
    PENDING,
    
    /**
     * Invitation accepted by user
     */
    ACCEPTED,
    
    /**
     * Invitation rejected by user
     */
    REJECTED
}
