# PMT - Project Management Tool

![CI/CD Status](https://github.com/votre-username/pmt/workflows/CI%2FCD%20Pipeline/badge.svg)

## 📋 Description

PMT est une application de gestion de projets moderne avec un tableau Kanban interactif. L'application permet de créer des projets, gérer des tâches, inviter des membres et suivre la progression en temps réel.

## 🚀 Technologies

### Backend
- **Java 21** - Langage de programmation
- **Spring Boot 3.2.0** - Framework principal
- **PostgreSQL 15** - Base de données
- **Spring Security** - Authentification
- **JPA/Hibernate** - ORM
- **Mailjet** - Service d'envoi d'emails
- **JUnit 5 & Mockito** - Tests unitaires
- **Maven** - Gestion de dépendances

### Frontend
- **Angular 17** - Framework frontend
- **TypeScript 5.x** - Langage de programmation
- **Tailwind CSS** - Framework CSS
- **RxJS** - Programmation réactive
- **Angular CDK** - Drag & Drop
- **Jest** - Tests unitaires

### DevOps
- **Docker & Docker Compose** - Conteneurisation
- **GitHub Actions** - CI/CD
- **Nginx** - Serveur web pour le frontend

## 📦 Installation

### Prérequis
- Docker & Docker Compose
- Node.js 18+ (pour développement local)
- Java 21 (pour développement local)

### Configuration des variables d'environnement

**⚠️ Important : Avant de démarrer l'application**

1. Copier le fichier d'exemple :
```bash
cp .env.example .env
```

2. Modifier le fichier `.env` avec vos credentials Mailjet et PostgreSQL

📖 **Voir [ENV_CONFIG.md](ENV_CONFIG.md) pour la configuration détaillée**

### Démarrage rapide avec Docker

```bash
# Cloner le repository
git clone https://github.com/votre-username/pmt.git
cd pmt

# Démarrer tous les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f
```

L'application sera accessible sur :
- **Frontend** : http://localhost:4200
- **Backend API** : http://localhost:8080
- **PostgreSQL** : localhost:5432

## 🧪 Tests

### Backend
```bash
cd pmt-backend

# Exécuter les tests
./mvnw test

# Rapport de couverture
./mvnw jacoco:report
# Ouvrir target/site/jacoco/index.html
```

### Frontend
```bash
cd pmt-frontend

# Exécuter les tests
npm run test

# Tests avec couverture
npm run test:coverage

# Mode watch (développement)
npm run test:watch
```

## 📖 API Documentation

### Endpoints principaux

#### Authentification
```http
POST /api/auth/register - Créer un compte
POST /api/auth/login - Se connecter
```

#### Projets
```http
GET    /api/projects - Récupérer tous les projets
POST   /api/projects - Créer un projet
GET    /api/projects/{id} - Récupérer un projet
PUT    /api/projects/{id} - Modifier un projet
DELETE /api/projects/{id} - Supprimer un projet
```

#### Tâches
```http
GET    /api/tasks - Récupérer les tâches
POST   /api/tasks - Créer une tâche
PUT    /api/tasks/{id} - Modifier une tâche
DELETE /api/tasks/{id} - Supprimer une tâche
PATCH  /api/tasks/{id}/status - Changer le statut
```

#### Invitations
```http
POST   /api/invitations - Inviter un membre
GET    /api/invitations/pending - Invitations en attente
POST   /api/invitations/{token}/accept - Accepter une invitation
DELETE /api/invitations/{id} - Refuser une invitation
```

## 🔐 Configuration

### Variables d'environnement Backend

Créer un fichier `pmt-backend/src/main/resources/application-local.properties` :

```properties
# Base de données
spring.datasource.url=jdbc:postgresql://localhost:5432/pmt_db
spring.datasource.username=pmt_user
spring.datasource.password=pmt_password

# Email Mailjet
spring.mail.host=in-v3.mailjet.com
spring.mail.port=587
spring.mail.username=YOUR_MAILJET_API_KEY
spring.mail.password=YOUR_MAILJET_SECRET_KEY
email.from=your-email@example.com
```

### Variables d'environnement Frontend

Créer un fichier `pmt-frontend/src/environments/environment.ts` :

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

## 🔄 CI/CD Pipeline

Le pipeline GitHub Actions s'exécute automatiquement sur chaque push vers `main` :

1. **Build Backend** - Compilation Java et exécution des tests
2. **Build Frontend** - Compilation Angular et tests Jest
3. **Docker Build & Push** - Construction et publication des images Docker
4. **Notification** - Confirmation du succès

### Configuration GitHub Secrets

Ajouter dans Settings > Secrets :
- `DOCKER_USERNAME` - Nom d'utilisateur Docker Hub
- `DOCKER_PASSWORD` - Mot de passe Docker Hub

## 📧 Emails

L'application envoie des emails automatiques dans les cas suivants :

1. **Invitation à un projet** - Email avec lien d'invitation
2. **Assignation de tâche** - Notification d'une nouvelle tâche
3. **Changement de statut** - Mise à jour du statut d'une tâche

Tous les emails sont en français avec un design professionnel.

## 🏗️ Architecture

```
pmt/
├── pmt-backend/          # API Spring Boot
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   └── test/         # Tests JUnit
│   ├── Dockerfile
│   └── pom.xml
│
├── pmt-frontend/         # Application Angular
│   ├── src/
│   │   ├── app/
│   │   └── assets/
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml    # Configuration Docker
└── .github/
    └── workflows/
        └── ci-cd.yml     # Pipeline CI/CD
```

## 👥 Fonctionnalités

- ✅ Authentification sécurisée
- ✅ Gestion de projets multi-utilisateurs
- ✅ Tableau Kanban avec drag & drop
- ✅ Système d'invitations
- ✅ Filtres et recherche avancés
- ✅ Statistiques en temps réel
- ✅ Notifications par email
- ✅ Interface entièrement en français
- ✅ Tests automatisés (backend + frontend)
- ✅ CI/CD avec GitHub Actions
- ✅ Conteneurisation Docker

## 📝 Licence

Ce projet est sous licence MIT.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📞 Contact

Pour toute question : aminedibsn@gmail.com
