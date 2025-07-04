# Plateforme de Gestion Technique d'un Verger

Une plateforme numérique intelligente pour la gestion d'un verger utilisant les technologies IoT pour optimiser la production agricole.

## 🎯 Objectifs

- **Surveillance en temps réel** : Température, humidité, pH, luminosité
- **Gestion des interventions** : Taille, traitement, récolte, irrigation
- **Alertes intelligentes** : Notifications personnalisées
- **Interface multilingue** : Français et Arabe
- **Gestion des utilisateurs** : Rôles admin et fermier

## 🛠️ Technologies utilisées

- **Backend** : Node.js, Express.js
- **Base de données** : SQLite
- **Frontend** : HTML5, CSS3, JavaScript vanilla
- **Authentification** : Sessions Express avec bcrypt
- **Interface** : Design responsive et moderne

## 📋 Fonctionnalités

### 🔐 Authentification et sécurité

- Connexion sécurisée avec mot de passe hashé
- Gestion des sessions utilisateur
- Permissions par rôle (admin/fermier)

### 📊 Tableau de bord

- Vue d'ensemble des données en temps réel
- Statistiques des capteurs
- Graphiques d'évolution des paramètres
- Dernières interventions

### 🌡️ Gestion des capteurs

- Ajout/modification/suppression de capteurs
- Types : Température, Humidité, pH, Luminosité
- Statut en temps réel

### 🌳 Gestion des arbres

- Inventaire complet du verger
- Informations détaillées par arbre
- Suivi de l'âge et de la localisation

### 📅 Interventions

- Planification des interventions
- Types : Taille, Traitement, Récolte, Irrigation
- Suivi des responsabilités

### ⚠️ Alertes et notifications

- Système d'alertes personnalisées
- Différents niveaux de priorité
- Marquage comme lu/non lu

### 👥 Administration

- Gestion des utilisateurs (admin seulement)
- Création de nouveaux comptes
- Attribution des rôles

## 🚀 Installation et démarrage

### Prérequis

- Node.js (version 14 ou supérieure)
- npm ou yarn

### Installation

1. **Cloner le projet**

```bash
git clone <url-du-repo>
cd PlateformeAgri
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Démarrer le serveur**

```bash
npm start
```

4. **Accéder à l'application**

```
http://localhost:3000
```

### Identifiants par défaut

- **Admin** :
  - Username: `admin`
  - Password: `admin123`

## 📁 Structure du projet

```
PlateformeAgri/
├── server.js              # Serveur Express principal
├── package.json           # Dépendances et scripts
├── database/              # Base de données SQLite
│   └── verger.db         # Fichier de base de données
├── public/               # Fichiers statiques
│   ├── index.html        # Page d'accueil
│   ├── dashboard.html    # Tableau de bord
│   ├── admin.html        # Page d'administration
│   ├── css/
│   │   └── style.css     # Styles CSS
│   └── js/
│       ├── auth.js       # Gestion authentification
│       ├── language.js   # Gestion multilingue
│       ├── dashboard.js  # Logique tableau de bord
│       └── admin.js      # Logique administration
└── README.md             # Documentation
```

## 🔧 Configuration

### Variables d'environnement

Le serveur utilise les variables d'environnement suivantes :

- `PORT` : Port du serveur (défaut: 3000)

### Base de données

La base de données SQLite est automatiquement créée au premier démarrage avec :

- Table des utilisateurs
- Table des capteurs
- Table des données des capteurs
- Table des arbres
- Table des interventions
- Table des alertes

## 🌐 API Endpoints

### Authentification

- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Informations utilisateur

### Utilisateurs (Admin)

- `GET /api/users` - Liste des utilisateurs
- `POST /api/users` - Créer un utilisateur

### Capteurs

- `GET /api/capteurs` - Liste des capteurs
- `POST /api/capteurs` - Ajouter un capteur

### Arbres

- `GET /api/arbres` - Liste des arbres
- `POST /api/arbres` - Ajouter un arbre

### Interventions

- `GET /api/interventions` - Liste des interventions
- `POST /api/interventions` - Planifier une intervention

### Alertes

- `GET /api/alertes` - Liste des alertes

## 🎨 Interface utilisateur

### Design responsive

- Compatible mobile et desktop
- Interface moderne et intuitive
- Support RTL pour l'arabe

### Multilingue

- Français (par défaut)
- Arabe (support complet)
- Changement de langue en temps réel

### Thème

- Couleurs vertes pour l'agriculture
- Icônes Font Awesome
- Animations CSS fluides

## 🔒 Sécurité

- Mots de passe hashés avec bcrypt
- Sessions sécurisées
- Validation des données
- Protection CSRF
- Permissions par rôle

## 📈 Fonctionnalités futures

- [ ] Intégration de vrais capteurs IoT
- [ ] Notifications push
- [ ] Rapports PDF
- [ ] Carte interactive du verger
- [ ] API REST complète
- [ ] Tests automatisés
- [ ] Déploiement Docker

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Auteur

Développé pour la gestion technique d'un verger avec les technologies IoT.

## 📞 Support

Pour toute question ou problème, veuillez ouvrir une issue sur GitHub.
#   S i t e V e r g e r  
 