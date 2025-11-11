package com.codesolutions.pmt.entity;

/**
 * Role types for project members
 */
public enum Role {
    /**
     * Project administrator - Full control over project
     */
    ADMIN,
    
    /**
     * Regular project member - Can create and edit tasks
     */
    MEMBER,
    
    /**
     * Observer - Read-only access
     */
    OBSERVER
}
