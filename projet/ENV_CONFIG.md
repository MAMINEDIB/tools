# 🔐 Configuration des Variables d'Environnement

Ce projet utilise des variables d'environnement pour sécuriser les données sensibles comme les mots de passe et clés API.

## 📋 Configuration Initiale

### 1. Copier le fichier d'exemple

```bash
cp .env.example .env
```

### 2. Modifier le fichier `.env` avec vos valeurs

Ouvrir le fichier `.env` et remplacer les valeurs par défaut :

```bash
# Configuration de la base de données
POSTGRES_DB=pmt_db
POSTGRES_USER=pmt_user
POSTGRES_PASSWORD=VOTRE_MOT_DE_PASSE_SECURISE  # ⚠️ Changer cette valeur !

# Configuration SMTP Mailjet
MAIL_USERNAME=VOTRE_CLE_API_MAILJET              # ⚠️ Changer cette valeur !
MAIL_PASSWORD=VOTRE_SECRET_MAILJET               # ⚠️ Changer cette valeur !
MAIL_FROM=votre-email@example.com                # ⚠️ Changer cette valeur !
```

## 🔑 Obtenir les Credentials Mailjet

1. Créer un compte sur https://www.mailjet.com/
2. Aller dans **Account Settings** > **Master API Key & Sub API key management**
3. Copier :
   - **API Key** → `MAIL_USERNAME`
   - **Secret Key** → `MAIL_PASSWORD`

## 🚀 Démarrage avec Docker

Une fois le fichier `.env` configuré :

```bash
# Démarrer tous les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f backend
```

## ⚠️ Important - Sécurité

- ✅ Le fichier `.env` est dans `.gitignore` (ne sera pas versionné)
- ✅ Le fichier `.env.example` sert de template (sans valeurs sensibles)
- ❌ **NE JAMAIS** commit le fichier `.env` avec des vraies credentials
- ✅ Pour la production, utiliser des secrets managers (AWS Secrets, Azure Key Vault, etc.)

## 📝 Variables Disponibles

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `POSTGRES_DB` | Nom de la base de données | `pmt_db` |
| `POSTGRES_USER` | Utilisateur PostgreSQL | `pmt_user` |
| `POSTGRES_PASSWORD` | Mot de passe PostgreSQL | À définir |
| `DB_HOST` | Hôte de la base de données | `db` |
| `DB_PORT` | Port PostgreSQL | `5432` |
| `BACKEND_PORT` | Port du backend | `8080` |
| `FRONTEND_PORT` | Port du frontend | `4200` |
| `MAIL_HOST` | Serveur SMTP Mailjet | `in-v3.mailjet.com` |
| `MAIL_PORT` | Port SMTP | `587` |
| `MAIL_USERNAME` | API Key Mailjet | À définir |
| `MAIL_PASSWORD` | Secret Key Mailjet | À définir |
| `MAIL_FROM` | Email expéditeur | À définir |
| `API_URL` | URL de l'API backend | `http://localhost:8080/api` |

## 🔄 Pour la Production

En production (Heroku, AWS, Azure, etc.), définir ces variables dans l'interface de configuration :

### Heroku
```bash
heroku config:set POSTGRES_PASSWORD=votre_password
heroku config:set MAIL_USERNAME=votre_api_key
heroku config:set MAIL_PASSWORD=votre_secret_key
```

### Docker Swarm / Kubernetes
Utiliser des **Secrets** pour stocker les valeurs sensibles.

### GitHub Actions (CI/CD)
Les credentials Docker Hub sont déjà configurés via **GitHub Secrets**.
