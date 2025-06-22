const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'plateforme-verger-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 heures
}));

// Base de données SQLite
const db = new sqlite3.Database('./database/verger.db', (err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err.message);
    } else {
        console.log('Connexion à la base de données SQLite réussie');
        initDatabase();
    }
});

// Initialisation de la base de données
function initDatabase() {
    // Table des utilisateurs
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL DEFAULT 'fermier',
        nom_complet TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Table des capteurs
    db.run(`CREATE TABLE IF NOT EXISTS capteurs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL,
        type TEXT NOT NULL,
        localisation TEXT NOT NULL,
        statut TEXT DEFAULT 'actif',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Table des données des capteurs
    db.run(`CREATE TABLE IF NOT EXISTS donnees_capteurs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        capteur_id INTEGER,
        temperature REAL,
        humidite REAL,
        ph REAL,
        luminosite REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (capteur_id) REFERENCES capteurs (id)
    )`);

    // Table des arbres
    db.run(`CREATE TABLE IF NOT EXISTS arbres (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom_variete TEXT NOT NULL,
        age INTEGER,
        localisation TEXT NOT NULL,
        statut TEXT DEFAULT 'sain',
        date_plantation DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Table des interventions
    db.run(`CREATE TABLE IF NOT EXISTS interventions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        description TEXT,
        arbre_id INTEGER,
        user_id INTEGER,
        date_intervention DATE NOT NULL,
        statut TEXT DEFAULT 'planifie',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (arbre_id) REFERENCES arbres (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Table des alertes
    db.run(`CREATE TABLE IF NOT EXISTS alertes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        niveau TEXT DEFAULT 'info',
        user_id INTEGER,
        lu BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Créer un utilisateur admin par défaut
    const adminPassword = bcrypt.hashSync('admin123', 10);
    db.run(`INSERT OR IGNORE INTO users (username, password, email, role, nom_complet) 
            VALUES ('admin', ?, 'admin@verger.com', 'admin', 'Administrateur')`, [adminPassword]);

    // Ajouter des données de test
    addTestData();
}

// Fonction pour ajouter des données de test
function addTestData() {
    // Capteurs de test
    const capteursTest = [
        { nom: 'Capteur Température 1', type: 'temperature', localisation: 'Zone A' },
        { nom: 'Capteur Humidité 1', type: 'humidite', localisation: 'Zone A' },
        { nom: 'Capteur pH 1', type: 'ph', localisation: 'Zone B' },
        { nom: 'Capteur Luminosité 1', type: 'luminosite', localisation: 'Zone C' }
    ];

    capteursTest.forEach(capteur => {
        db.run(`INSERT OR IGNORE INTO capteurs (nom, type, localisation) VALUES (?, ?, ?)`, 
               [capteur.nom, capteur.type, capteur.localisation]);
    });

    // Arbres de test
    const arbresTest = [
        { nom_variete: 'Pommier Golden', age: 5, localisation: 'Zone A - Rang 1', date_plantation: '2019-03-15' },
        { nom_variete: 'Pommier Granny Smith', age: 3, localisation: 'Zone A - Rang 2', date_plantation: '2021-04-20' },
        { nom_variete: 'Poirier Williams', age: 7, localisation: 'Zone B - Rang 1', date_plantation: '2017-02-10' },
        { nom_variete: 'Cerisier Burlat', age: 4, localisation: 'Zone C - Rang 1', date_plantation: '2020-05-12' },
        { nom_variete: 'Prunier Reine Claude', age: 6, localisation: 'Zone C - Rang 2', date_plantation: '2018-06-08' }
    ];

    arbresTest.forEach(arbre => {
        db.run(`INSERT OR IGNORE INTO arbres (nom_variete, age, localisation, date_plantation) VALUES (?, ?, ?, ?)`, 
               [arbre.nom_variete, arbre.age, arbre.localisation, arbre.date_plantation]);
    });

    // Interventions de test
    const interventionsTest = [
        { type: 'taille', description: 'Taille de formation des pommiers', date_intervention: '2024-01-15' },
        { type: 'traitement', description: 'Traitement contre les pucerons', date_intervention: '2024-02-20' },
        { type: 'irrigation', description: 'Irrigation automatique activée', date_intervention: '2024-03-10' },
        { type: 'recolte', description: 'Récolte des cerises', date_intervention: '2024-06-15' }
    ];

    interventionsTest.forEach(intervention => {
        db.run(`INSERT OR IGNORE INTO interventions (type, description, date_intervention, user_id) VALUES (?, ?, ?, 1)`, 
               [intervention.type, intervention.description, intervention.date_intervention]);
    });

    // Alertes de test
    const alertesTest = [
        { type: 'Température', message: 'Température élevée détectée dans la Zone A', niveau: 'warning', user_id: 1 },
        { type: 'Humidité', message: 'Niveau d\'humidité optimal atteint', niveau: 'info', user_id: 1 },
        { type: 'Irrigation', message: 'Système d\'irrigation activé automatiquement', niveau: 'info', user_id: 1 }
    ];

    alertesTest.forEach(alerte => {
        db.run(`INSERT OR IGNORE INTO alertes (type, message, niveau, user_id) VALUES (?, ?, ?, ?)`, 
               [alerte.type, alerte.message, alerte.niveau, alerte.user_id]);
    });

    console.log('Données de test ajoutées avec succès');
}

// Routes d'authentification
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        
        if (!user) {
            return res.status(401).json({ error: 'Utilisateur non trouvé' });
        }
        
        const isValidPassword = bcrypt.compareSync(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Mot de passe incorrect' });
        }
        
        req.session.user = {
            id: user.id,
            username: user.username,
            role: user.role,
            nom_complet: user.nom_complet
        };
        
        res.json({ 
            success: true, 
            user: req.session.user 
        });
    });
});

app.post('/api/auth/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

app.get('/api/auth/me', (req, res) => {
    if (req.session.user) {
        res.json({ user: req.session.user });
    } else {
        res.status(401).json({ error: 'Non authentifié' });
    }
});

// Middleware d'authentification
function requireAuth(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ error: 'Authentification requise' });
    }
}

// Middleware pour vérifier les permissions admin
function requireAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Permissions administrateur requises' });
    }
}

// Routes pour les utilisateurs (admin seulement)
app.get('/api/users', requireAuth, requireAdmin, (req, res) => {
    db.all('SELECT id, username, email, role, nom_complet, created_at FROM users ORDER BY created_at DESC', (err, users) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json(users);
    });
});

app.post('/api/users', requireAuth, requireAdmin, (req, res) => {
    const { username, password, email, role, nom_complet } = req.body;
    
    // Vérifier que tous les champs requis sont présents
    if (!username || !password || !email || !nom_complet) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
    }
    
    // Hasher le mot de passe
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    db.run('INSERT INTO users (username, password, email, role, nom_complet) VALUES (?, ?, ?, ?, ?)', 
           [username, hashedPassword, email, role || 'fermier', nom_complet], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: 'Nom d\'utilisateur ou email déjà utilisé' });
            }
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json({ id: this.lastID, success: true });
    });
});

// Routes pour les capteurs
app.get('/api/capteurs', requireAuth, (req, res) => {
    db.all('SELECT * FROM capteurs ORDER BY created_at DESC', (err, capteurs) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json(capteurs);
    });
});

app.post('/api/capteurs', requireAuth, (req, res) => {
    const { nom, type, localisation } = req.body;
    db.run('INSERT INTO capteurs (nom, type, localisation) VALUES (?, ?, ?)', 
           [nom, type, localisation], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json({ id: this.lastID, success: true });
    });
});

// Routes pour les données des capteurs
app.get('/api/donnees-capteurs', requireAuth, (req, res) => {
    const limit = req.query.limit || 100;
    db.all(`SELECT dc.*, c.nom as capteur_nom 
            FROM donnees_capteurs dc 
            JOIN capteurs c ON dc.capteur_id = c.id 
            ORDER BY dc.timestamp DESC 
            LIMIT ?`, [limit], (err, donnees) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json(donnees);
    });
});

// Routes pour les arbres
app.get('/api/arbres', requireAuth, (req, res) => {
    db.all('SELECT * FROM arbres ORDER BY created_at DESC', (err, arbres) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json(arbres);
    });
});

app.post('/api/arbres', requireAuth, (req, res) => {
    const { nom_variete, age, localisation, date_plantation } = req.body;
    db.run('INSERT INTO arbres (nom_variete, age, localisation, date_plantation) VALUES (?, ?, ?, ?)', 
           [nom_variete, age, localisation, date_plantation], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json({ id: this.lastID, success: true });
    });
});

// Routes pour les interventions
app.get('/api/interventions', requireAuth, (req, res) => {
    db.all(`SELECT i.*, a.nom_variete, u.nom_complet as user_nom 
            FROM interventions i 
            LEFT JOIN arbres a ON i.arbre_id = a.id 
            LEFT JOIN users u ON i.user_id = u.id 
            ORDER BY i.date_intervention DESC`, (err, interventions) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json(interventions);
    });
});

app.post('/api/interventions', requireAuth, (req, res) => {
    const { type, description, arbre_id, date_intervention } = req.body;
    const user_id = req.session.user.id;
    
    db.run('INSERT INTO interventions (type, description, arbre_id, user_id, date_intervention) VALUES (?, ?, ?, ?, ?)', 
           [type, description, arbre_id, user_id, date_intervention], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json({ id: this.lastID, success: true });
    });
});

// Routes pour les alertes
app.get('/api/alertes', requireAuth, (req, res) => {
    const user_id = req.session.user.id;
    db.all('SELECT * FROM alertes WHERE user_id = ? ORDER BY created_at DESC', [user_id], (err, alertes) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json(alertes);
    });
});

// Route pour la page d'accueil
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route pour le tableau de bord
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Route pour la gestion des utilisateurs (admin seulement)
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
    console.log(`Accédez à l'application: http://localhost:${PORT}`);
    console.log(`Identifiants admin par défaut:`);
    console.log(`  Username: admin`);
    console.log(`  Password: admin123`);
}); 