// Gestion de l'authentification
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Vérifier si l'utilisateur est déjà connecté
    checkAuthStatus();
});

async function handleLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const username = formData.get('username');
    const password = formData.get('password');
    
    const loginMessage = document.getElementById('loginMessage');
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            loginMessage.textContent = 'Connexion réussie ! Redirection...';
            loginMessage.className = 'message success';
            
            // Rediriger vers le tableau de bord
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
        } else {
            loginMessage.textContent = data.error || 'Erreur de connexion';
            loginMessage.className = 'message error';
        }
    } catch (error) {
        console.error('Erreur:', error);
        loginMessage.textContent = 'Erreur de connexion au serveur';
        loginMessage.className = 'message error';
    }
}

async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        
        if (data.user) {
            // L'utilisateur est connecté, rediriger vers le tableau de bord
            if (window.location.pathname === '/') {
                window.location.href = '/dashboard';
            }
        }
    } catch (error) {
        // L'utilisateur n'est pas connecté, rester sur la page de connexion
    }
}

async function logout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST'
        });
        
        if (response.ok) {
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
    }
}

// Fonction pour vérifier l'authentification sur les pages protégées
async function requireAuth() {
    try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        
        if (!data.user) {
            window.location.href = '/';
            return null;
        }
        
        return data.user;
    } catch (error) {
        window.location.href = '/';
        return null;
    }
}

// Fonction pour vérifier les permissions admin
async function requireAdmin() {
    const user = await requireAuth();
    if (user && user.role === 'admin') {
        return user;
    } else {
        window.location.href = '/dashboard';
        return null;
    }
} 