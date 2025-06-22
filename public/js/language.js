// Gestion du changement de langue
let currentLanguage = 'fr';

document.addEventListener('DOMContentLoaded', function() {
    // Charger la langue depuis le localStorage
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
        switchLanguage(savedLanguage);
    }
});

function switchLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    
    // Mettre à jour les boutons de langue
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        }
    });
    
    // Mettre à jour la direction du texte
    if (lang === 'ar') {
        document.documentElement.setAttribute('dir', 'rtl');
        document.documentElement.setAttribute('lang', 'ar');
    } else {
        document.documentElement.setAttribute('dir', 'ltr');
        document.documentElement.setAttribute('lang', 'fr');
    }
    
    // Mettre à jour tous les textes
    updateTexts(lang);
}

function updateTexts(lang) {
    // Mettre à jour tous les éléments avec des attributs data-fr et data-ar
    document.querySelectorAll('[data-fr][data-ar]').forEach(element => {
        if (lang === 'ar') {
            element.textContent = element.getAttribute('data-ar');
        } else {
            element.textContent = element.getAttribute('data-fr');
        }
    });
    
    // Mettre à jour les placeholders
    document.querySelectorAll('input[data-fr-placeholder][data-ar-placeholder]').forEach(input => {
        if (lang === 'ar') {
            input.placeholder = input.getAttribute('data-ar-placeholder');
        } else {
            input.placeholder = input.getAttribute('data-fr-placeholder');
        }
    });
}

// Fonction pour obtenir le texte traduit
function getText(key) {
    const translations = {
        fr: {
            'dashboard': 'Tableau de bord',
            'capteurs': 'Capteurs',
            'arbres': 'Arbres',
            'interventions': 'Interventions',
            'alertes': 'Alertes',
            'deconnexion': 'Déconnexion',
            'temperature': 'Température',
            'humidite': 'Humidité',
            'ph': 'pH',
            'luminosite': 'Luminosité',
            'ajouter': 'Ajouter',
            'modifier': 'Modifier',
            'supprimer': 'Supprimer',
            'annuler': 'Annuler',
            'enregistrer': 'Enregistrer',
            'nom': 'Nom',
            'type': 'Type',
            'localisation': 'Localisation',
            'statut': 'Statut',
            'date': 'Date',
            'description': 'Description',
            'actions': 'Actions',
            'aucune_donnee': 'Aucune donnée disponible',
            'chargement': 'Chargement...',
            'erreur': 'Erreur',
            'succes': 'Succès',
            'confirmation': 'Confirmation',
            'voulez_vous_supprimer': 'Voulez-vous vraiment supprimer cet élément ?',
            'oui': 'Oui',
            'non': 'Non'
        },
        ar: {
            'dashboard': 'لوحة التحكم',
            'capteurs': 'المستشعرات',
            'arbres': 'الأشجار',
            'interventions': 'التدخلات',
            'alertes': 'التنبيهات',
            'deconnexion': 'تسجيل الخروج',
            'temperature': 'درجة الحرارة',
            'humidite': 'الرطوبة',
            'ph': 'الأس الهيدروجيني',
            'luminosite': 'الإضاءة',
            'ajouter': 'إضافة',
            'modifier': 'تعديل',
            'supprimer': 'حذف',
            'annuler': 'إلغاء',
            'enregistrer': 'حفظ',
            'nom': 'الاسم',
            'type': 'النوع',
            'localisation': 'الموقع',
            'statut': 'الحالة',
            'date': 'التاريخ',
            'description': 'الوصف',
            'actions': 'الإجراءات',
            'aucune_donnee': 'لا توجد بيانات متاحة',
            'chargement': 'جاري التحميل...',
            'erreur': 'خطأ',
            'succes': 'نجح',
            'confirmation': 'تأكيد',
            'voulez_vous_supprimer': 'هل تريد حقاً حذف هذا العنصر؟',
            'oui': 'نعم',
            'non': 'لا'
        }
    };
    
    return translations[currentLanguage][key] || key;
}

// Fonction pour formater les dates selon la langue
function formatDate(dateString, lang = currentLanguage) {
    const date = new Date(dateString);
    
    if (lang === 'ar') {
        return date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } else {
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// Fonction pour formater les nombres selon la langue
function formatNumber(number, lang = currentLanguage) {
    if (lang === 'ar') {
        return number.toLocaleString('ar-SA');
    } else {
        return number.toLocaleString('fr-FR');
    }
} 