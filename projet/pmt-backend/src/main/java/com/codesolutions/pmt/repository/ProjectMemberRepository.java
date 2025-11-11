package com.codesolutions.pmt.repository;

import com.codesolutions.pmt.entity.Project;
import com.codesolutions.pmt.entity.ProjectMember;
import com.codesolutions.pmt.entity.Role;
import com.codesolutions.pmt.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for ProjectMember entity
 */
@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    
    /**
     * Find project member by project and user
     */
    Optional<ProjectMember> findByProjectAndUser(Project project, User user);
    
    /**
     * Find all members of a project
     */
    List<ProjectMember> findByProject(Project project);
    
    /**
     * Find all projects for a user
     */
    List<ProjectMember> findByUser(User user);
    
    /**
     * Find members by project and role
     */
    List<ProjectMember> findByProjectAndRole(Project project, Role role);
    
    /**
     * Check if user is member of project
     */
    boolean existsByProjectAndUser(Project project, User user);
    
    /**
     * Count members in a project
     */
    long countByProject(Project project);
}
