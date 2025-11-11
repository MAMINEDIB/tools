package com.codesolutions.pmt.controller;

import com.codesolutions.pmt.dto.ProjectCreateDto;
import com.codesolutions.pmt.entity.User;
import com.codesolutions.pmt.repository.ProjectRepository;
import com.codesolutions.pmt.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests d'intégration pour ProjectController
 * Teste le cycle complet HTTP Request -> Controller -> Service -> Repository
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ProjectControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;

    @BeforeEach
    void setUp() {
        // Créer un utilisateur de test avant chaque test
        testUser = User.builder()
                .email("test@example.com")
                .firstName("John")
                .lastName("Doe")
                .password(passwordEncoder.encode("password123"))
                .build();
        
        testUser = userRepository.save(testUser);
    }

    @Test
    void testCreateProject_Integration() throws Exception {
        // Préparer les données
        ProjectCreateDto projectDto = ProjectCreateDto.builder()
                .name("Nouveau Projet")
                .description("Description du projet de test")
                .build();

        // Envoyer la requête POST
        mockMvc.perform(post("/api/projects")
                .header("User-Id", testUser.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(projectDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Nouveau Projet"))
                .andExpect(jsonPath("$.description").value("Description du projet de test"))
                .andExpect(jsonPath("$.id").exists());
    }

    @Test
    void testGetUserProjects_Integration() throws Exception {
        // Créer d'abord un projet
        ProjectCreateDto projectDto = ProjectCreateDto.builder()
                .name("Projet Test")
                .description("Description test")
                .build();

        mockMvc.perform(post("/api/projects")
                .header("User-Id", testUser.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(projectDto)))
                .andExpect(status().isCreated());

        // Récupérer tous les projets
        mockMvc.perform(get("/api/projects")
                .header("User-Id", testUser.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").value("Projet Test"));
    }

    @Test
    void testGetProjectById_Integration() throws Exception {
        // Créer un projet
        ProjectCreateDto projectDto = ProjectCreateDto.builder()
                .name("Projet Spécifique")
                .description("Test getById")
                .build();

        String response = mockMvc.perform(post("/api/projects")
                .header("User-Id", testUser.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(projectDto)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long projectId = objectMapper.readTree(response).get("id").asLong();

        // Récupérer le projet par ID
        mockMvc.perform(get("/api/projects/" + projectId)
                .header("User-Id", testUser.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Projet Spécifique"))
                .andExpect(jsonPath("$.description").value("Test getById"));
    }

    @Test
    void testDeleteProject_Integration() throws Exception {
        // Créer un projet
        ProjectCreateDto projectDto = ProjectCreateDto.builder()
                .name("Projet à Supprimer")
                .description("Test delete")
                .build();

        String response = mockMvc.perform(post("/api/projects")
                .header("User-Id", testUser.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(projectDto)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long projectId = objectMapper.readTree(response).get("id").asLong();

        // Supprimer le projet
        mockMvc.perform(delete("/api/projects/" + projectId)
                .header("User-Id", testUser.getId()))
                .andExpect(status().isNoContent());

        // Vérifier que le projet n'existe plus
        assertFalse(projectRepository.findById(projectId).isPresent());
    }
}
