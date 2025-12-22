# Installation du serveur Menu Cafét ORIF sur Datalik

## Objectif

- Installer Node.js 20 sur Debian 13
- Installer et configurer MySQL 8
- Configurer nginx comme reverse proxy
- Déployer l'application Menu Cafét avec PM2
- Sécuriser avec un certificat SSL

## Informations de connexion

| Paramètre | Valeur |
|-----------|--------|
| Username | root |
| Password | (votre mot de passe) |
| IP | (IP du serveur Datalik) |
| Port SSH | 22 |

---

## Partie 1 : Connexion et mises à jour

Connectez-vous en SSH sur le serveur :

```bash
ssh root@IP_DU_SERVEUR
```

Mettre à jour le système :

```bash
sudo apt update && sudo apt upgrade -y
```

---

## Partie 2 : Installation de Node.js 20

Installer les dépendances :

```bash
sudo apt install -y curl gnupg
```

Ajouter le dépôt NodeSource :

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
```

Installer Node.js :

```bash
sudo apt install -y nodejs
```

Vérifier l'installation :

```bash
node -v
npm -v
```

Le texte suivant devrait s'afficher :

```
v20.x.x
10.x.x
```

---

## Partie 3 : Installation de MySQL 8

Installer les prérequis :

```bash
sudo apt install -y wget gnupg lsb-release
```

Télécharger le paquet de configuration MySQL :

```bash
wget https://dev.mysql.com/get/mysql-apt-config_0.8.32-1_all.deb
```

Installer le paquet :

```bash
sudo dpkg -i mysql-apt-config_0.8.32-1_all.deb
```

> Sélectionner "Debian Bookworm" si Trixie n'est pas listé, puis "mysql-8.0"

Installer MySQL Server :

```bash
sudo apt update
sudo apt install -y mysql-server
```

Vérifier que MySQL fonctionne :

```bash
sudo systemctl status mysql
```

Le texte suivant devrait s'afficher :

```
active (running)
```

Sécuriser l'installation :

```bash
sudo mysql_secure_installation
```

> Définir un mot de passe root fort et répondre "Y" à toutes les questions.

---

## Partie 4 : Créer la base de données

Se connecter à MySQL :

```bash
sudo mysql -u root -p
```

Créer la base de données et l'utilisateur :

```sql
CREATE DATABASE menu_cafet CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'menu_user'@'localhost' IDENTIFIED BY 'VotreMotDePasseSecurise123!';
GRANT ALL PRIVILEGES ON menu_cafet.* TO 'menu_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Importer le schéma de la base :

```bash
mysql -u menu_user -p menu_cafet < /chemin/vers/sql/schema.sql
mysql -u menu_user -p menu_cafet < /chemin/vers/sql/seed.sql
```

---

## Partie 5 : Installation de nginx

Installer nginx :

```bash
sudo apt install -y nginx
```

Vérifier que le service fonctionne :

```bash
sudo systemctl status nginx
```

Le texte suivant devrait s'afficher :

```
active (running)
```

Tester dans un navigateur :

```
http://IP_DU_SERVEUR
```

---

## Partie 6 : Déployer l'application

Créer le dossier de l'application :

```bash
sudo mkdir -p /var/www/menu-cafet
sudo chown -R $USER:$USER /var/www/menu-cafet
```

Copier les fichiers du projet (depuis votre machine locale) :

```bash
scp -r ./dist/* root@IP_DU_SERVEUR:/var/www/menu-cafet/
scp -r ./server root@IP_DU_SERVEUR:/var/www/menu-cafet/
scp -r ./sql root@IP_DU_SERVEUR:/var/www/menu-cafet/
scp ./package.json root@IP_DU_SERVEUR:/var/www/menu-cafet/
scp ./package-lock.json root@IP_DU_SERVEUR:/var/www/menu-cafet/
```

Sur le serveur, installer les dépendances :

```bash
cd /var/www/menu-cafet
npm install --production
```

Créer le fichier de configuration :

```bash
nano /var/www/menu-cafet/.env
```

Ajouter le contenu :

```
NODE_ENV=production
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=menu_user
DB_PASSWORD=VotreMotDePasseSecurise123!
DB_NAME=menu_cafet
JWT_SECRET=votre-secret-jwt-tres-long-et-complexe-minimum-32-caracteres
```

---

## Partie 7 : Installation de PM2

Installer PM2 globalement :

```bash
sudo npm install -g pm2
```

Créer le fichier de configuration PM2 :

```bash
nano /var/www/menu-cafet/ecosystem.config.js
```

Ajouter le contenu :

```javascript
module.exports = {
  apps: [{
    name: 'menu-cafet-api',
    script: './server/index.js',
    cwd: '/var/www/menu-cafet',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/menu-cafet/error.log',
    out_file: '/var/log/menu-cafet/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    autorestart: true,
    max_memory_restart: '500M'
  }]
}
```

Créer le dossier des logs :

```bash
sudo mkdir -p /var/log/menu-cafet
sudo chown -R $USER:$USER /var/log/menu-cafet
```

Démarrer l'application :

```bash
cd /var/www/menu-cafet
pm2 start ecosystem.config.js
```

Vérifier que l'application fonctionne :

```bash
pm2 status
pm2 logs menu-cafet-api
```

Configurer PM2 pour démarrer au boot :

```bash
pm2 save
pm2 startup
```

> Exécuter la commande affichée par PM2.

---

## Partie 8 : Configurer nginx comme reverse proxy

Créer le fichier de configuration :

```bash
sudo nano /etc/nginx/sites-available/menu-cafet
```

Ajouter le contenu :

```nginx
server {
    listen 80;
    server_name menu.votre-domaine.ch;

    # Fichiers statiques du frontend
    root /var/www/menu-cafet/dist;
    index index.html;

    # Frontend React
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api {
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

    # Logs
    access_log /var/log/nginx/menu-cafet-access.log;
    error_log /var/log/nginx/menu-cafet-error.log;
}
```

Activer le site :

```bash
sudo ln -s /etc/nginx/sites-available/menu-cafet /etc/nginx/sites-enabled/
```

Désactiver le site par défaut :

```bash
sudo rm /etc/nginx/sites-enabled/default
```

Tester la configuration :

```bash
sudo nginx -t
```

Le texte suivant devrait s'afficher :

```
syntax is ok
test is successful
```

Redémarrer nginx :

```bash
sudo systemctl restart nginx
```

---

## Partie 9 : Tester dans le navigateur

Ouvrir le lien suivant :

```
http://menu.votre-domaine.ch
```

Tester la connexion admin :

- **Nom d'utilisateur** : admin
- **Mot de passe** : admin123

---

## Partie 10 : Certificat SSL (HTTPS)

Installer Certbot :

```bash
sudo apt install -y certbot python3-certbot-nginx
```

Obtenir le certificat :

```bash
sudo certbot --nginx -d menu.votre-domaine.ch
```

> Suivre les instructions et choisir de rediriger HTTP vers HTTPS.

Vérifier le renouvellement automatique :

```bash
sudo certbot renew --dry-run
```

---

## Partie 11 : Pare-feu (optionnel mais recommandé)

Installer UFW :

```bash
sudo apt install -y ufw
```

Configurer les règles :

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

Vérifier le statut :

```bash
sudo ufw status
```

---

## Commandes utiles

| Action | Commande |
|--------|----------|
| Voir les logs de l'app | `pm2 logs menu-cafet-api` |
| Redémarrer l'app | `pm2 restart menu-cafet-api` |
| Arrêter l'app | `pm2 stop menu-cafet-api` |
| Voir le statut | `pm2 status` |
| Redémarrer nginx | `sudo systemctl restart nginx` |
| Voir les logs nginx | `sudo tail -f /var/log/nginx/menu-cafet-error.log` |
| Redémarrer MySQL | `sudo systemctl restart mysql` |

---

## Comptes utilisateurs par défaut

| Utilisateur | Email | Mot de passe | Rôle |
|-------------|-------|--------------|------|
| admin | admin@orif.ch | admin123 | Administrateur |

> **Important** : Changez le mot de passe admin après la première connexion !

---

## En cas de problème

1. **L'application ne démarre pas** :
   ```bash
   pm2 logs menu-cafet-api --lines 50
   ```

2. **Erreur de connexion MySQL** :
   ```bash
   mysql -u menu_user -p -e "SELECT 1"
   ```

3. **nginx ne fonctionne pas** :
   ```bash
   sudo nginx -t
   sudo tail -f /var/log/nginx/error.log
   ```

4. **Certificat SSL expiré** :
   ```bash
   sudo certbot renew
   ```

---

## Mise à jour de l'application

Pour mettre à jour l'application :

```bash
cd /var/www/menu-cafet

# Arrêter l'application
pm2 stop menu-cafet-api

# Copier les nouveaux fichiers
# (depuis votre machine locale avec scp)

# Installer les nouvelles dépendances
npm install --production

# Redémarrer
pm2 start menu-cafet-api
```

---

**Document créé le 22 décembre 2025**
**Application : Menu Cafét - Cafétéria ORIF**
