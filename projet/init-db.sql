-- Script d'initialisation de la base de données PMT
-- PostgreSQL 15+

-- Suppression des tables existantes (ordre important pour les contraintes)
DROP TABLE IF EXISTS task_history CASCADE;
DROP TABLE IF EXISTS task CASCADE;
DROP TABLE IF EXISTS invitation CASCADE;
DROP TABLE IF EXISTS project_member CASCADE;
DROP TABLE IF EXISTS project CASCADE;
DROP TABLE IF EXISTS app_user CASCADE;

-- Suppression des types énumérés
DROP TYPE IF EXISTS role_type CASCADE;
DROP TYPE IF EXISTS task_status_type CASCADE;
DROP TYPE IF EXISTS task_priority_type CASCADE;
DROP TYPE IF EXISTS invitation_status_type CASCADE;

-- Création des types énumérés
CREATE TYPE role_type AS ENUM ('OWNER', 'ADMIN', 'MEMBER');
CREATE TYPE task_status_type AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');
CREATE TYPE task_priority_type AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE invitation_status_type AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- Table app_user
CREATE TABLE app_user (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index pour recherche par email
CREATE INDEX idx_user_email ON app_user(email);

-- Table project
CREATE TABLE project (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_project_creator FOREIGN KEY (created_by) REFERENCES app_user(id) ON DELETE CASCADE
);

-- Index pour recherche par créateur
CREATE INDEX idx_project_created_by ON project(created_by);

-- Table project_member (table de liaison User-Project avec rôle)
CREATE TABLE project_member (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role role_type NOT NULL DEFAULT 'MEMBER',
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_member_project FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE,
    CONSTRAINT fk_member_user FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE,
    CONSTRAINT uk_project_user UNIQUE (project_id, user_id)
);

-- Index pour recherche par projet et utilisateur
CREATE INDEX idx_member_project ON project_member(project_id);
CREATE INDEX idx_member_user ON project_member(user_id);

-- Table task
CREATE TABLE task (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status task_status_type NOT NULL DEFAULT 'TODO',
    priority task_priority_type NOT NULL DEFAULT 'MEDIUM',
    project_id BIGINT NOT NULL,
    created_by BIGINT NOT NULL,
    assigned_to BIGINT,
    due_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_task_project FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE,
    CONSTRAINT fk_task_creator FOREIGN KEY (created_by) REFERENCES app_user(id) ON DELETE CASCADE,
    CONSTRAINT fk_task_assignee FOREIGN KEY (assigned_to) REFERENCES app_user(id) ON DELETE SET NULL
);

-- Index pour recherche par projet, statut et assignation
CREATE INDEX idx_task_project ON task(project_id);
CREATE INDEX idx_task_status ON task(status);
CREATE INDEX idx_task_assigned_to ON task(assigned_to);

-- Table task_history (audit trail)
CREATE TABLE task_history (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    modified_by BIGINT NOT NULL,
    modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_history_task FOREIGN KEY (task_id) REFERENCES task(id) ON DELETE CASCADE,
    CONSTRAINT fk_history_modifier FOREIGN KEY (modified_by) REFERENCES app_user(id) ON DELETE CASCADE
);

-- Index pour recherche par tâche
CREATE INDEX idx_history_task ON task_history(task_id);
CREATE INDEX idx_history_modified_at ON task_history(modified_at DESC);

-- Table invitation
CREATE TABLE invitation (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    status invitation_status_type NOT NULL DEFAULT 'PENDING',
    invited_by BIGINT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_invitation_project FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE,
    CONSTRAINT fk_invitation_inviter FOREIGN KEY (invited_by) REFERENCES app_user(id) ON DELETE CASCADE
);

-- Index pour recherche par token et projet
CREATE INDEX idx_invitation_token ON invitation(token);
CREATE INDEX idx_invitation_project ON invitation(project_id);
CREATE INDEX idx_invitation_email_status ON invitation(email, status);

-- Données de test
-- Utilisateurs de test (mot de passe: "password123" hashé avec BCrypt)
INSERT INTO app_user (name, email, password) VALUES
('Admin User', 'admin@pmt.com', '$2a$10$N9qo8uLOickgx2ZMRZoMeO.twJZjWOjGJ5aSTzvdMD.ld.JiPaLmO'),
('John Doe', 'john.doe@pmt.com', '$2a$10$N9qo8uLOickgx2ZMRZoMeO.twJZjWOjGJ5aSTzvdMD.ld.JiPaLmO'),
('Jane Smith', 'jane.smith@pmt.com', '$2a$10$N9qo8uLOickgx2ZMRZoMeO.twJZjWOjGJ5aSTzvdMD.ld.JiPaLmO'),
('Bob Johnson', 'bob.johnson@pmt.com', '$2a$10$N9qo8uLOickgx2ZMRZoMeO.twJZjWOjGJ5aSTzvdMD.ld.JiPaLmO');

-- Projets de test
INSERT INTO project (name, description, created_by) VALUES
('PMT Development', 'Développement de l''application PMT - Project Management Tool', 1),
('Marketing Campaign Q1', 'Campagne marketing pour le premier trimestre 2025', 2),
('Infrastructure Migration', 'Migration de l''infrastructure vers Azure Cloud', 1);

-- Membres des projets
INSERT INTO project_member (project_id, user_id, role) VALUES
(1, 1, 'OWNER'),
(1, 2, 'ADMIN'),
(1, 3, 'MEMBER'),
(2, 2, 'OWNER'),
(2, 1, 'MEMBER'),
(2, 4, 'MEMBER'),
(3, 1, 'OWNER'),
(3, 3, 'ADMIN');

-- Tâches de test
INSERT INTO task (title, description, status, priority, project_id, created_by, assigned_to, due_date) VALUES
('Mise en place du backend Spring Boot', 'Créer l''architecture backend avec Spring Boot 3.2', 'DONE', 'HIGH', 1, 1, 2, '2025-01-15'),
('Développement de l''API REST', 'Implémenter les endpoints REST pour User, Project, Task', 'IN_PROGRESS', 'HIGH', 1, 1, 2, '2025-01-20'),
('Configuration PostgreSQL', 'Configurer la base de données PostgreSQL avec JPA', 'DONE', 'MEDIUM', 1, 2, 1, '2025-01-10'),
('Interface Angular Login', 'Créer le composant de connexion avec formulaire réactif', 'IN_PROGRESS', 'HIGH', 1, 1, 3, '2025-01-25'),
('Kanban Board', 'Implémenter le tableau Kanban drag & drop avec Angular CDK', 'TODO', 'MEDIUM', 1, 2, 3, '2025-02-01'),
('Tests unitaires backend', 'Créer les tests JUnit/Mockito pour >60% coverage', 'TODO', 'HIGH', 1, 1, 2, '2025-01-30'),
('Pipeline CI/CD', 'Configurer GitHub Actions pour build/test/deploy', 'TODO', 'MEDIUM', 1, 1, 1, '2025-02-05'),
('Définir la stratégie de contenu', 'Brainstorming pour la campagne Q1', 'DONE', 'HIGH', 2, 2, 4, '2025-01-05'),
('Créer les visuels', 'Design des bannières et images pour réseaux sociaux', 'IN_PROGRESS', 'MEDIUM', 2, 2, 4, '2025-01-15'),
('Planifier les publications', 'Calendrier éditorial pour janvier-mars 2025', 'TODO', 'LOW', 2, 4, 4, '2025-01-20'),
('Audit infrastructure actuelle', 'Analyser l''infrastructure on-premise existante', 'DONE', 'HIGH', 3, 1, 1, '2025-01-08'),
('Plan de migration Azure', 'Définir l''architecture cible sur Azure', 'IN_PROGRESS', 'HIGH', 3, 1, 3, '2025-01-18');

-- Historique de tâches (audit trail)
INSERT INTO task_history (task_id, field_name, old_value, new_value, modified_by) VALUES
(1, 'status', 'TODO', 'IN_PROGRESS', 2),
(1, 'status', 'IN_PROGRESS', 'DONE', 2),
(2, 'status', 'TODO', 'IN_PROGRESS', 2),
(3, 'status', 'TODO', 'IN_PROGRESS', 1),
(3, 'status', 'IN_PROGRESS', 'DONE', 1),
(4, 'status', 'TODO', 'IN_PROGRESS', 3),
(8, 'status', 'TODO', 'IN_PROGRESS', 4),
(8, 'status', 'IN_PROGRESS', 'DONE', 4),
(9, 'status', 'TODO', 'IN_PROGRESS', 4),
(11, 'status', 'TODO', 'DONE', 1),
(12, 'status', 'TODO', 'IN_PROGRESS', 3);

-- Invitations de test
INSERT INTO invitation (project_id, email, token, status, invited_by, expires_at) VALUES
(1, 'alice@example.com', 'token-alice-project1-2025', 'PENDING', 1, CURRENT_TIMESTAMP + INTERVAL '7 days'),
(2, 'charlie@example.com', 'token-charlie-project2-2025', 'PENDING', 2, CURRENT_TIMESTAMP + INTERVAL '7 days'),
(3, 'david@example.com', 'token-david-project3-2025', 'ACCEPTED', 1, CURRENT_TIMESTAMP + INTERVAL '7 days');

-- Vérification des données insérées
SELECT 'Users créés:' AS info, COUNT(*) AS count FROM app_user
UNION ALL
SELECT 'Projets créés:', COUNT(*) FROM project
UNION ALL
SELECT 'Membres de projets:', COUNT(*) FROM project_member
UNION ALL
SELECT 'Tâches créées:', COUNT(*) FROM task
UNION ALL
SELECT 'Historique de tâches:', COUNT(*) FROM task_history
UNION ALL
SELECT 'Invitations:', COUNT(*) FROM invitation;

-- Fin du script
