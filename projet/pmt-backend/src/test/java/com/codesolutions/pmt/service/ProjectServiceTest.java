package com.codesolutions.pmt.service;

import com.codesolutions.pmt.dto.ProjectCreateDto;
import com.codesolutions.pmt.dto.ProjectDto;
import com.codesolutions.pmt.entity.Project;
import com.codesolutions.pmt.entity.ProjectMember;
import com.codesolutions.pmt.entity.User;
import com.codesolutions.pmt.repository.ProjectMemberRepository;
import com.codesolutions.pmt.repository.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires pour ProjectService
 * Valide la logique métier de gestion des projets
 */
@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private ProjectMemberRepository projectMemberRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private ProjectService projectService;

    private User testUser;
    private Project testProject;
    private ProjectCreateDto testProjectCreateDto;

    @BeforeEach
    void setUp() {
        // Créer un utilisateur de test
        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .firstName("John")
                .lastName("Doe")
                .password("password123")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        // Créer un DTO de création de projet
        testProjectCreateDto = ProjectCreateDto.builder()
                .name("Projet Test")
                .description("Description du projet test")
                .build();

        // Créer un projet de test
        testProject = Project.builder()
                .id(1L)
                .name("Projet Test")
                .description("Description du projet test")
                .createdBy(testUser)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void testCreateProject_Success() {
        // Configurer les mocks
        when(userService.getUserEntityById(1L)).thenReturn(testUser);
        when(projectRepository.save(any(Project.class))).thenReturn(testProject);
        when(projectMemberRepository.save(any(ProjectMember.class))).thenReturn(new ProjectMember());

        // Appeler la méthode
        ProjectDto result = projectService.createProject(testProjectCreateDto, 1L);

        // Vérifications
        assertNotNull(result);
        assertEquals("Projet Test", result.getName());
        verify(projectRepository, times(1)).save(any(Project.class));
        verify(projectMemberRepository, times(1)).save(any(ProjectMember.class));
    }

    @Test
    void testGetAllUserProjects_ReturnsProjects() {
        // Préparer les données
        List<Project> projects = Arrays.asList(testProject);
        
        when(projectRepository.findAllByUser(1L)).thenReturn(projects);

        // Appeler la méthode
        List<ProjectDto> result = projectService.getAllUserProjects(1L);

        // Vérifications
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(projectRepository, times(1)).findAllByUser(1L);
    }

    @Test
    void testGetProjectById_ProjectExists() {
        // Configurer les mocks
        when(projectRepository.findById(1L)).thenReturn(Optional.of(testProject));
        when(projectMemberRepository.existsByProjectAndUser(any(Project.class), any(User.class))).thenReturn(true);
        when(userService.getUserEntityById(1L)).thenReturn(testUser);

        // Appeler la méthode
        ProjectDto result = projectService.getProjectById(1L, 1L);

        // Vérifications
        assertNotNull(result);
        assertEquals("Projet Test", result.getName());
    }

    @Test
    void testDeleteProject_Success() {
        // Configurer les mocks
        when(projectRepository.findById(1L)).thenReturn(Optional.of(testProject));
        doNothing().when(projectRepository).delete(testProject);

        // Appeler la méthode (le créateur supprime son projet)
        projectService.deleteProject(1L, 1L);

        // Vérifications
        verify(projectRepository, times(1)).delete(testProject);
    }
}
