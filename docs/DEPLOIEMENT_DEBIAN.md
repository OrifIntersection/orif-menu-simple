# Guide de Déploiement - Menu Cafét sur Debian 13 (Datalik)

## Prérequis

- Serveur Debian 13 avec accès SSH
- Accès root ou sudo

---

## Étape 1 : Installation des Dépendances

### 1.1 Mettre à jour le système

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Installer Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Vérifier l'installation :
```bash
node --version   # v20.x.x
npm --version    # 10.x.x
```

### 1.3 Installer MySQL 8

```bash
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

Sécuriser MySQL :
```bash
sudo mysql_secure_installation
```

### 1.4 Installer Nginx

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## Étape 2 : Configuration de la Base de Données

### 2.1 Créer la base de données

```bash
sudo mysql
```

Dans MySQL :
```sql
CREATE DATABASE menu_cafet CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'menu_user'@'localhost' IDENTIFIED BY 'VotreMotDePasseSecurise';
GRANT ALL PRIVILEGES ON menu_cafet.* TO 'menu_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2.2 Importer le schéma

```bash
mysql -u menu_user -p menu_cafet < sql/schema.sql
mysql -u menu_user -p menu_cafet < sql/seed.sql
```

### 2.3 Créer un utilisateur admin

```bash
mysql -u menu_user -p menu_cafet
```

```sql
-- Générer un hash bcrypt pour le mot de passe (exemple: "admin123")
-- Utilisez un outil en ligne ou node.js pour générer le hash
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
  ('admin', 'admin@orif.ch', '$2b$10$rOzJqQZxKvNqNqNqNqNqNu...', 'Administrateur', 'admin');
```

---

## Étape 3 : Déployer l'Application

### 3.1 Créer le dossier de l'application

```bash
sudo mkdir -p /var/www/menu-cafet
sudo chown -R $USER:$USER /var/www/menu-cafet
```

### 3.2 Copier les fichiers

Copier les fichiers du projet dans `/var/www/menu-cafet/` :
- `server/` (API Express)
- `dist/` (Frontend compilé)
- `package.json`
- `sql/` (Scripts SQL)

### 3.3 Installer les dépendances

```bash
cd /var/www/menu-cafet
npm install --production
```

### 3.4 Créer le fichier .env

```bash
nano /var/www/menu-cafet/.env
```

Contenu :
```env
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=menu_user
DB_PASSWORD=VotreMotDePasseSecurise
DB_NAME=menu_cafet
JWT_SECRET=votre-secret-jwt-tres-long-et-securise-32-caracteres-minimum
```

---

## Étape 4 : Compiler le Frontend

### 4.1 Sur votre machine locale

```bash
npm run build
```

### 4.2 Copier le dossier `dist/` sur le serveur

```bash
scp -r dist/ user@votre-serveur:/var/www/menu-cafet/
```

---

## Étape 5 : Configurer PM2 (Gestionnaire de Processus)

### 5.1 Installer PM2

```bash
sudo npm install -g pm2
```

### 5.2 Démarrer l'application

```bash
cd /var/www/menu-cafet
pm2 start server/index.js --name "menu-cafet"
```

### 5.3 Configurer le démarrage automatique

```bash
pm2 startup systemd
pm2 save
```

### 5.4 Commandes utiles

```bash
pm2 status           # État de l'application
pm2 logs menu-cafet  # Voir les logs
pm2 restart menu-cafet  # Redémarrer
pm2 stop menu-cafet     # Arrêter
```

---

## Étape 6 : Configurer Nginx (Reverse Proxy)

### 6.1 Créer la configuration

```bash
sudo nano /etc/nginx/sites-available/menu-cafet
```

Contenu :
```nginx
server {
    listen 80;
    server_name votre-domaine.ch;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6.2 Activer le site

```bash
sudo ln -s /etc/nginx/sites-available/menu-cafet /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Étape 7 : Configurer HTTPS (Certbot)

### 7.1 Installer Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 7.2 Obtenir le certificat SSL

```bash
sudo certbot --nginx -d votre-domaine.ch
```

### 7.3 Renouvellement automatique

```bash
sudo certbot renew --dry-run
```

---

## Étape 8 : Firewall (UFW)

```bash
sudo apt install -y ufw
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## Vérification

### Tester l'API

```bash
curl http://localhost:3001/api
curl http://localhost:3001/api/dishes
```

### Tester l'authentification

```bash
# Inscription
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "test", "email": "test@test.ch", "password": "test123"}'

# Connexion
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

---

## Résumé de l'Architecture

```
┌─────────────────────────────────────────────────┐
│                    Internet                      │
└────────────────────────┬────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────┐
│           Nginx (Port 80/443)                   │
│           - Reverse Proxy                        │
│           - SSL/HTTPS                           │
└────────────────────────┬────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────┐
│           Express.js (Port 3001)                │
│           - API REST                            │
│           - Auth JWT                            │
│           - Sert le frontend React              │
└────────────────────────┬────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────┐
│           MySQL (Port 3306)                     │
│           - Base de données menu_cafet          │
└─────────────────────────────────────────────────┘
```

---

## Fichiers Importants

| Fichier | Description |
|---------|-------------|
| `/var/www/menu-cafet/.env` | Variables d'environnement |
| `/etc/nginx/sites-available/menu-cafet` | Config Nginx |
| `pm2 logs menu-cafet` | Logs de l'application |
| `/var/log/nginx/` | Logs Nginx |

---

## Support

En cas de problème :
1. Vérifier les logs PM2 : `pm2 logs menu-cafet`
2. Vérifier les logs Nginx : `sudo tail -f /var/log/nginx/error.log`
3. Vérifier la connexion MySQL : `mysql -u menu_user -p menu_cafet`
