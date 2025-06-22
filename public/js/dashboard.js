// Gestion du tableau de bord
let currentUser = null;
let charts = {};

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

async function initializeDashboard() {
    // Vérifier l'authentification
    currentUser = await requireAuth();
    if (!currentUser) return;
    
    // Afficher le nom de l'utilisateur
    document.getElementById('userName').textContent = currentUser.nom_complet;
    
    // Gérer les permissions admin
    if (currentUser.role !== 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    }
    
    // Initialiser la navigation
    initializeNavigation();
    
    // Charger les données initiales
    loadOverviewData();
    
    // Charger les données des sections
    loadCapteurs();
    loadArbres();
    loadInterventions();
    loadAlertes();
    
    // Initialiser les graphiques
    initializeCharts();
}

function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.dashboard-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetSection = this.getAttribute('data-section');
            
            // Mettre à jour la navigation active
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Afficher la section correspondante
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });
            
            // Charger les données de la section si nécessaire
            switch(targetSection) {
                case 'capteurs':
                    loadCapteurs();
                    break;
                case 'arbres':
                    loadArbres();
                    break;
                case 'interventions':
                    loadInterventions();
                    break;
                case 'alertes':
                    loadAlertes();
                    break;
            }
        });
    });
}

async function loadOverviewData() {
    try {
        // Charger les données des capteurs
        const capteursResponse = await fetch('/api/capteurs');
        const capteurs = await capteursResponse.json();
        
        // Charger les données des arbres
        const arbresResponse = await fetch('/api/arbres');
        const arbres = await arbresResponse.json();
        
        // Charger les données des interventions
        const interventionsResponse = await fetch('/api/interventions');
        const interventions = await interventionsResponse.json();
        
        // Charger les alertes
        const alertesResponse = await fetch('/api/alertes');
        const alertes = await alertesResponse.json();
        
        // Mettre à jour les statistiques
        updateOverviewStats(capteurs, arbres, interventions, alertes);
        
        // Mettre à jour les dernières interventions
        updateRecentInterventions(interventions.slice(0, 5));
        
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
    }
}

function updateOverviewStats(capteurs, arbres, interventions, alertes) {
    // Température actuelle (simulation)
    const currentTemp = document.getElementById('currentTemp');
    currentTemp.textContent = '24°C';
    
    // Humidité actuelle (simulation)
    const currentHumidity = document.getElementById('currentHumidity');
    currentHumidity.textContent = '65%';
    
    // Nombre d'arbres
    const treeCount = document.getElementById('treeCount');
    treeCount.textContent = arbres.length;
    
    // Nombre d'alertes non lues
    const alertCount = document.getElementById('alertCount');
    const unreadAlerts = alertes.filter(alerte => !alerte.lu);
    alertCount.textContent = unreadAlerts.length;
}

function updateRecentInterventions(interventions) {
    const tbody = document.querySelector('#recentInterventionsTable tbody');
    
    if (interventions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" data-fr="Aucune intervention récente" data-ar="لا توجد تدخلات حديثة">Aucune intervention récente</td></tr>`;
        return;
    }
    
    tbody.innerHTML = interventions.map(intervention => `
        <tr>
            <td>${formatDate(intervention.date_intervention)}</td>
            <td>${intervention.type}</td>
            <td>${intervention.nom_variete || 'N/A'}</td>
            <td>${intervention.user_nom || 'N/A'}</td>
            <td><span class="status-badge status-${intervention.statut}">${intervention.statut}</span></td>
        </tr>
    `).join('');
}

async function loadCapteurs() {
    try {
        const response = await fetch('/api/capteurs');
        const capteurs = await response.json();
        
        const tbody = document.querySelector('#capteursTable tbody');
        
        if (capteurs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" data-fr="Aucun capteur trouvé" data-ar="لم يتم العثور على مستشعرات">Aucun capteur trouvé</td></tr>`;
            return;
        }
        
        tbody.innerHTML = capteurs.map(capteur => `
            <tr>
                <td>${capteur.nom}</td>
                <td>${capteur.type}</td>
                <td>${capteur.localisation}</td>
                <td><span class="status-badge status-${capteur.statut}">${capteur.statut}</span></td>
                <td>${formatDate(capteur.created_at)}</td>
                <td>
                    <button class="btn btn-secondary" onclick="editCapteur(${capteur.id})" data-fr="Modifier" data-ar="تعديل">Modifier</button>
                    <button class="btn btn-secondary" onclick="deleteCapteur(${capteur.id})" data-fr="Supprimer" data-ar="حذف">Supprimer</button>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Erreur lors du chargement des capteurs:', error);
    }
}

async function loadArbres() {
    try {
        const response = await fetch('/api/arbres');
        const arbres = await response.json();
        
        const tbody = document.querySelector('#arbresTable tbody');
        
        if (arbres.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" data-fr="Aucun arbre trouvé" data-ar="لم يتم العثور على أشجار">Aucun arbre trouvé</td></tr>`;
            return;
        }
        
        tbody.innerHTML = arbres.map(arbre => `
            <tr>
                <td>${arbre.nom_variete}</td>
                <td>${arbre.age} ans</td>
                <td>${arbre.localisation}</td>
                <td><span class="status-badge status-${arbre.statut}">${arbre.statut}</span></td>
                <td>${formatDate(arbre.date_plantation)}</td>
                <td>
                    <button class="btn btn-secondary" onclick="editArbre(${arbre.id})" data-fr="Modifier" data-ar="تعديل">Modifier</button>
                    <button class="btn btn-secondary" onclick="deleteArbre(${arbre.id})" data-fr="Supprimer" data-ar="حذف">Supprimer</button>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Erreur lors du chargement des arbres:', error);
    }
}

async function loadInterventions() {
    try {
        const response = await fetch('/api/interventions');
        const interventions = await response.json();
        
        const tbody = document.querySelector('#interventionsTable tbody');
        
        if (interventions.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" data-fr="Aucune intervention trouvée" data-ar="لم يتم العثور على تدخلات">Aucune intervention trouvée</td></tr>`;
            return;
        }
        
        tbody.innerHTML = interventions.map(intervention => `
            <tr>
                <td>${formatDate(intervention.date_intervention)}</td>
                <td>${intervention.type}</td>
                <td>${intervention.description || 'N/A'}</td>
                <td>${intervention.nom_variete || 'N/A'}</td>
                <td>${intervention.user_nom || 'N/A'}</td>
                <td><span class="status-badge status-${intervention.statut}">${intervention.statut}</span></td>
                <td>
                    <button class="btn btn-secondary" onclick="editIntervention(${intervention.id})" data-fr="Modifier" data-ar="تعديل">Modifier</button>
                    <button class="btn btn-secondary" onclick="deleteIntervention(${intervention.id})" data-fr="Supprimer" data-ar="حذف">Supprimer</button>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Erreur lors du chargement des interventions:', error);
    }
}

async function loadAlertes() {
    try {
        const response = await fetch('/api/alertes');
        const alertes = await response.json();
        
        const container = document.getElementById('alertesContainer');
        
        if (alertes.length === 0) {
            container.innerHTML = `<div class="message" data-fr="Aucune alerte active" data-ar="لا توجد تنبيهات نشطة">Aucune alerte active</div>`;
            return;
        }
        
        container.innerHTML = alertes.map(alerte => `
            <div class="alerte-item ${alerte.lu ? 'read' : 'unread'} niveau-${alerte.niveau}">
                <div class="alerte-header">
                    <span class="alerte-type">${alerte.type}</span>
                    <span class="alerte-date">${formatDate(alerte.created_at)}</span>
                </div>
                <div class="alerte-message">${alerte.message}</div>
                ${!alerte.lu ? `<button class="btn btn-primary" onclick="markAlerteAsRead(${alerte.id})" data-fr="Marquer comme lu" data-ar="تحديد كمقروء">Marquer comme lu</button>` : ''}
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Erreur lors du chargement des alertes:', error);
    }
}

function initializeCharts() {
    // Graphique de température
    const tempCtx = document.getElementById('tempChart').getContext('2d');
    charts.temperature = new Chart(tempCtx, {
        type: 'line',
        data: {
            labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
            datasets: [{
                label: 'Température (°C)',
                data: [18, 16, 20, 25, 24, 22],
                borderColor: '#2e7d32',
                backgroundColor: 'rgba(46, 125, 50, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
    
    // Graphique d'humidité
    const humidityCtx = document.getElementById('humidityChart').getContext('2d');
    charts.humidity = new Chart(humidityCtx, {
        type: 'line',
        data: {
            labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
            datasets: [{
                label: 'Humidité (%)',
                data: [70, 75, 65, 60, 65, 70],
                borderColor: '#4caf50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

// Fonctions pour les modals
function showModal(title, content) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('modalOverlay').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modalOverlay').style.display = 'none';
}

function showAddCapteurModal() {
    const content = `
        <form id="addCapteurForm">
            <div class="form-group">
                <label for="capteurNom" data-fr="Nom du capteur" data-ar="اسم المستشعر">Nom du capteur</label>
                <input type="text" id="capteurNom" name="nom" required>
            </div>
            <div class="form-group">
                <label for="capteurType" data-fr="Type" data-ar="النوع">Type</label>
                <select id="capteurType" name="type" required>
                    <option value="temperature" data-fr="Température" data-ar="درجة الحرارة">Température</option>
                    <option value="humidite" data-fr="Humidité" data-ar="الرطوبة">Humidité</option>
                    <option value="ph" data-fr="pH" data-ar="الأس الهيدروجيني">pH</option>
                    <option value="luminosite" data-fr="Luminosité" data-ar="الإضاءة">Luminosité</option>
                </select>
            </div>
            <div class="form-group">
                <label for="capteurLocalisation" data-fr="Localisation" data-ar="الموقع">Localisation</label>
                <input type="text" id="capteurLocalisation" name="localisation" required>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()" data-fr="Annuler" data-ar="إلغاء">Annuler</button>
                <button type="submit" class="btn btn-primary" data-fr="Ajouter" data-ar="إضافة">Ajouter</button>
            </div>
        </form>
    `;
    
    showModal('Ajouter un capteur', content);
    
    document.getElementById('addCapteurForm').addEventListener('submit', handleAddCapteur);
}

async function handleAddCapteur(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = {
        nom: formData.get('nom'),
        type: formData.get('type'),
        localisation: formData.get('localisation')
    };
    
    try {
        const response = await fetch('/api/capteurs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            closeModal();
            loadCapteurs();
        } else {
            alert('Erreur lors de l\'ajout du capteur');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de l\'ajout du capteur');
    }
}

function showAddArbreModal() {
    const content = `
        <form id="addArbreForm">
            <div class="form-group">
                <label for="arbreVariete" data-fr="Variété" data-ar="النوع">Variété</label>
                <input type="text" id="arbreVariete" name="nom_variete" required>
            </div>
            <div class="form-group">
                <label for="arbreAge" data-fr="Âge (années)" data-ar="العمر (سنوات)">Âge (années)</label>
                <input type="number" id="arbreAge" name="age" min="0" required>
            </div>
            <div class="form-group">
                <label for="arbreLocalisation" data-fr="Localisation" data-ar="الموقع">Localisation</label>
                <input type="text" id="arbreLocalisation" name="localisation" required>
            </div>
            <div class="form-group">
                <label for="arbreDatePlantation" data-fr="Date de plantation" data-ar="تاريخ الزراعة">Date de plantation</label>
                <input type="date" id="arbreDatePlantation" name="date_plantation" required>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()" data-fr="Annuler" data-ar="إلغاء">Annuler</button>
                <button type="submit" class="btn btn-primary" data-fr="Ajouter" data-ar="إضافة">Ajouter</button>
            </div>
        </form>
    `;
    
    showModal('Ajouter un arbre', content);
    
    document.getElementById('addArbreForm').addEventListener('submit', handleAddArbre);
}

async function handleAddArbre(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = {
        nom_variete: formData.get('nom_variete'),
        age: parseInt(formData.get('age')),
        localisation: formData.get('localisation'),
        date_plantation: formData.get('date_plantation')
    };
    
    try {
        const response = await fetch('/api/arbres', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            closeModal();
            loadArbres();
            loadOverviewData();
        } else {
            alert('Erreur lors de l\'ajout de l\'arbre');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de l\'ajout de l\'arbre');
    }
}

function showAddInterventionModal() {
    const content = `
        <form id="addInterventionForm">
            <div class="form-group">
                <label for="interventionType" data-fr="Type d'intervention" data-ar="نوع التدخل">Type d'intervention</label>
                <select id="interventionType" name="type" required>
                    <option value="taille" data-fr="Taille" data-ar="تقليم">Taille</option>
                    <option value="traitement" data-fr="Traitement" data-ar="علاج">Traitement</option>
                    <option value="recolte" data-fr="Récolte" data-ar="حصاد">Récolte</option>
                    <option value="irrigation" data-fr="Irrigation" data-ar="ري">Irrigation</option>
                </select>
            </div>
            <div class="form-group">
                <label for="interventionDescription" data-fr="Description" data-ar="الوصف">Description</label>
                <textarea id="interventionDescription" name="description" rows="3"></textarea>
            </div>
            <div class="form-group">
                <label for="interventionDate" data-fr="Date d'intervention" data-ar="تاريخ التدخل">Date d'intervention</label>
                <input type="date" id="interventionDate" name="date_intervention" required>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()" data-fr="Annuler" data-ar="إلغاء">Annuler</button>
                <button type="submit" class="btn btn-primary" data-fr="Planifier" data-ar="تخطيط">Planifier</button>
            </div>
        </form>
    `;
    
    showModal('Planifier une intervention', content);
    
    document.getElementById('addInterventionForm').addEventListener('submit', handleAddIntervention);
}

async function handleAddIntervention(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = {
        type: formData.get('type'),
        description: formData.get('description'),
        date_intervention: formData.get('date_intervention')
    };
    
    try {
        const response = await fetch('/api/interventions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            closeModal();
            loadInterventions();
            loadOverviewData();
        } else {
            alert('Erreur lors de la planification de l\'intervention');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la planification de l\'intervention');
    }
}

// Fonctions utilitaires
function editCapteur(id) {
    alert('Fonctionnalité d\'édition à implémenter');
}

function deleteCapteur(id) {
    if (confirm('Voulez-vous vraiment supprimer ce capteur ?')) {
        alert('Fonctionnalité de suppression à implémenter');
    }
}

function editArbre(id) {
    alert('Fonctionnalité d\'édition à implémenter');
}

function deleteArbre(id) {
    if (confirm('Voulez-vous vraiment supprimer cet arbre ?')) {
        alert('Fonctionnalité de suppression à implémenter');
    }
}

function editIntervention(id) {
    alert('Fonctionnalité d\'édition à implémenter');
}

function deleteIntervention(id) {
    if (confirm('Voulez-vous vraiment supprimer cette intervention ?')) {
        alert('Fonctionnalité de suppression à implémenter');
    }
}

async function markAlerteAsRead(id) {
    alert('Fonctionnalité à implémenter');
}

function showUsersManagement() {
    window.location.href = '/admin';
}

function backupDatabase() {
    alert('Fonctionnalité de sauvegarde à implémenter');
} 