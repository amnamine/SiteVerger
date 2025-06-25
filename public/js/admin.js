// Gestion de l'administration
let currentUser = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
    // Navigation simple via cards dans la section admin
    const btnShowUsers = document.getElementById('btnShowUsers');
    const sectionUsers = document.getElementById('users');
    const sectionAdmin = document.querySelector('.section-admin');
    function showSection(section) {
        sectionUsers.style.display = 'none';
        sectionAdmin.style.display = 'none';
        section.classList.remove('fadeInUp');
        void section.offsetWidth;
        section.style.display = 'block';
        section.classList.add('fadeInUp');
    }
    if (btnShowUsers && sectionUsers && sectionAdmin) {
        btnShowUsers.addEventListener('click', function() { showSection(sectionUsers); });
        // Par défaut, aucune section affichée
        sectionUsers.style.display = 'none';
        sectionAdmin.style.display = 'block';
    }
});

async function initializeAdmin() {
    // Vérifier les permissions admin
    currentUser = await requireAdmin();
    if (!currentUser) return;
    
    // Afficher le nom de l'utilisateur
    document.getElementById('userName').textContent = currentUser.nom_complet;
    
    // Charger la liste des utilisateurs
    loadUsers();
}

async function loadUsers() {
    try {
        const response = await fetch('/api/users');
        const users = await response.json();
        
        const tbody = document.querySelector('#usersTable tbody');
        
        if (users.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" data-fr="Aucun utilisateur trouvé" data-ar="لم يتم العثور على مستخدمين">Aucun utilisateur trouvé</td></tr>`;
            return;
        }
        
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.nom_complet}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td><span class="role-badge role-${user.role}">${user.role}</span></td>
                <td>${formatDate(user.created_at)}</td>
                <td>
                    <button class="btn btn-secondary" onclick="editUser(${user.id})" data-fr="Modifier" data-ar="تعديل">Modifier</button>
                    ${user.id !== currentUser.id ? `<button class="btn btn-secondary" onclick="deleteUser(${user.id})" data-fr="Supprimer" data-ar="حذف">Supprimer</button>` : ''}
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
    }
}

function showAddUserModal() {
    const content = `
        <form id="addUserForm">
            <div class="form-group">
                <label for="userNomComplet" data-fr="Nom complet" data-ar="الاسم الكامل">Nom complet</label>
                <input type="text" id="userNomComplet" name="nom_complet" required>
            </div>
            <div class="form-group">
                <label for="userUsername" data-fr="Nom d'utilisateur" data-ar="اسم المستخدم">Nom d'utilisateur</label>
                <input type="text" id="userUsername" name="username" required>
            </div>
            <div class="form-group">
                <label for="userEmail" data-fr="Email" data-ar="البريد الإلكتروني">Email</label>
                <input type="email" id="userEmail" name="email" required>
            </div>
            <div class="form-group">
                <label for="userPassword" data-fr="Mot de passe" data-ar="كلمة المرور">Mot de passe</label>
                <input type="password" id="userPassword" name="password" required>
            </div>
            <div class="form-group">
                <label for="userRole" data-fr="Rôle" data-ar="الدور">Rôle</label>
                <select id="userRole" name="role" required>
                    <option value="fermier" data-fr="Fermier" data-ar="مزارع">Fermier</option>
                    <option value="admin" data-fr="Administrateur" data-ar="مدير">Administrateur</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()" data-fr="Annuler" data-ar="إلغاء">Annuler</button>
                <button type="submit" class="btn btn-primary" data-fr="Ajouter" data-ar="إضافة">Ajouter</button>
            </div>
        </form>
    `;
    
    showModal('Ajouter un utilisateur', content);
    
    document.getElementById('addUserForm').addEventListener('submit', handleAddUser);
}

async function handleAddUser(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = {
        nom_complet: formData.get('nom_complet'),
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: formData.get('role')
    };
    
    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            closeModal();
            loadUsers();
        } else {
            const errorData = await response.json();
            alert(errorData.error || 'Erreur lors de l\'ajout de l\'utilisateur');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de l\'ajout de l\'utilisateur');
    }
}

function editUser(id) {
    // Implémenter l'édition des utilisateurs
    alert('Fonctionnalité d\'édition à implémenter');
}

function deleteUser(id) {
    if (confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
        // Implémenter la suppression des utilisateurs
        alert('Fonctionnalité de suppression à implémenter');
    }
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