package com.codesolutions.pmt.repository;

import com.codesolutions.pmt.entity.Project;
import com.codesolutions.pmt.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Project entity
 */
@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    
    /**
     * Find all projects created by a user
     */
    List<Project> findByCreatedBy(User user);
    
    /**
     * Find all projects where user is a member
     */
    @Query("SELECT DISTINCT p FROM Project p " +
           "JOIN p.members pm " +
           "WHERE pm.user.id = :userId")
    List<Project> findAllByMemberId(@Param("userId") Long userId);
    
    /**
     * Find all projects by user (created or member)
     */
    @Query("SELECT DISTINCT p FROM Project p " +
           "LEFT JOIN p.members pm " +
           "WHERE p.createdBy.id = :userId OR pm.user.id = :userId")
    List<Project> findAllByUser(@Param("userId") Long userId);
}
