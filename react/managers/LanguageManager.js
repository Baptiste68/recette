// managers/LanguageManager.js
class LanguageManager {
  constructor() {
    this.currentLanguage = this.loadLanguage() || 'fr';
    this.listeners = [];
  }

  // Chargement de la langue sauvegardée
  loadLanguage() {
    try {
      return localStorage.getItem('app_language');
    } catch (error) {
      return null;
    }
  }

  // Sauvegarde de la langue
  saveLanguage(language) {
    try {
      localStorage.setItem('app_language', language);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Changement de langue avec notification des listeners
  setLanguage(language) {
    this.currentLanguage = language;
    this.saveLanguage(language);
    this.notifyListeners();
  }

  // Obtenir la langue actuelle
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  // Ajouter un listener pour les changements de langue
  addListener(callback) {
    this.listeners.push(callback);
  }

  // Supprimer un listener
  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  // Notifier tous les listeners
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.currentLanguage));
  }

  // Obtenir une traduction
  t(key, params = {}) {
    const keys = key.split('.');
    let translation = translations[this.currentLanguage];
    
    for (const k of keys) {
      translation = translation?.[k];
    }
    
    if (!translation) {
      // Fallback vers l'anglais si la traduction n'existe pas
      translation = translations['en'];
      for (const k of keys) {
        translation = translation?.[k];
      }
    }
    
    if (!translation) {
      return key; // Retourner la clé si aucune traduction trouvée
    }
    
    // Remplacer les paramètres dans la traduction
    return Object.keys(params).reduce((str, param) => {
      return str.replace(`{{${param}}}`, params[param]);
    }, translation);
  }

  // Obtenir les langues disponibles
  getAvailableLanguages() {
    return [
      { code: 'fr', name: 'Français', flag: '🇫🇷' },
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'es', name: 'Español', flag: '🇪🇸' },
      { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    ];
  }
}

// Traductions
const translations = {
  fr: {
    // Navigation
    nav: {
      inventory: 'Inventaire',
      diets: 'Régimes',
      recipes: 'Recettes'
    },
    
    // Inventaire
    inventory: {
      title: 'Gestion Inventaire',
      subtitle: 'Optimisez votre stock alimentaire',
      popularFoods: 'Aliments populaires',
      addFood: 'Ajouter un aliment',
      quickActions: 'Actions rapides',
      currentInventory: 'Inventaire actuel',
      empty: 'Inventaire vide\n\nAjoutez des aliments pour commencer !',
      searchFood: "🔍 Rechercher un aliment...",
      noResults: "Aucun résultat trouvé",
      
      // Formulaire
      foodName: 'Nom de l\'aliment',
      quantity: 'Quantité',
      expiration: 'Date d\'expiration',
      addToInventory: 'Ajouter à l\'inventaire',
      
      // Actions
      viewInventory: 'Voir inventaire',
      expiredFoods: 'Aliments expirés',
      statistics: 'Statistiques',
      
      // Messages
      added: 'ajouté avec succès !',
      updated: 'mis à jour ! Quantité totale',
      deleted: 'supprimé de l\'inventaire',
      emptyMessage: 'Votre inventaire est vide.',
      
      // Statuts
      expired: 'EXPIRÉ',
      expiresIn: 'Expire dans {{days}} jour(s)',
      expiresOn: 'Expire le {{date}}',
      noDate: 'Date non spécifiée',

      // Vider Inventaire
      clearAll: 'Vider tout l\'inventaire',
      clearConfirm: 'Êtes-vous sûr de vouloir supprimer TOUS les {{count}} aliment(s) ? Cette action est irréversible !',
      alreadyEmpty: 'L\'inventaire est déjà vide !',
      clearSuccess: '✅ Inventaire vidé ! {{count}} aliment(s) supprimé(s).',
      clearError: '❌ Erreur lors du vidage de l\'inventaire'
    },
    
    // Régimes
    diets: {
      title: 'Préférences Alimentaires',
      subtitle: 'Configurez vos régimes et allergies',
      dietTypes: 'Régimes alimentaires',
      allergies: 'Allergies et intolérances',
      summary: 'Voir résumé',
      reset: 'Réinitialiser',
      resetConfirm: 'Êtes-vous sûr de vouloir réinitialiser toutes vos préférences ?',
      resetSuccess: 'Préférences réinitialisées !'
    },
    
    // Recettes
    recipes: {
      title: 'Suggestions de Recettes',
      subtitle: 'Trouvez des recettes avec vos ingrédients',
      optimizedSearch: 'Recherche optimisée',
      optimizedDesc: 'Trouve les meilleures recettes avec vos ingrédients disponibles.\nPriorise les aliments qui expirent bientôt !',
      searchOptimized: 'Recherche optimisée',
      searchByName: 'Recherche par nom',
      searchByNameDesc: 'Nom de la recette (ex: pasta, pizza, soup...)',
      search: 'Rechercher',
      usefulActions: 'Actions utiles',
      priorityFoods: 'Aliments à utiliser',
      shoppingSuggestions: 'Suggestions d\'achats',
      
      // Messages
      searching: 'Recherche...',
      noRecipes: 'Aucune recette trouvée',
      emptyInventory: 'Ajoutez d\'abord des aliments à votre inventaire !',
      enterRecipeName: 'Veuillez saisir le nom d\'une recette.',
      
      // Affichage des recettes
      recipesFound: 'recettes trouvées • Optimisées pour votre inventaire',
      recipeSummary: 'Résumé des Recettes',
      perfectMatches: 'Matchs parfaits',
      goodMatches: 'Bons matchs',
      partialMatches: 'Matchs partiels',
      recipePages: 'Pages de Recettes',
      page: 'Page',
      recipes: 'Recettes',
      
      // Détails
      viewDetails: 'Voir détails',
      fullRecipe: 'Recette complète',
      ingredients: 'Ingrédients',
      instructions: 'Instructions',
      minutes: 'minutes',
      servings: 'portions',
      close: 'Fermer',
      originalSite: 'Site original',
      
      // Navigation
      home: 'Accueil',
      previous: 'Précédent',
      next: 'Suivant',
      
      // Scores
      perfectMatch: 'PARFAIT MATCH !',
      veryGoodMatch: 'TRÈS BON MATCH',
      goodMatch: 'BON MATCH',
      partialMatch: 'MATCH PARTIEL',
      uses: 'Utilise {{count}} de vos ingrédients',
      missing: 'Manque {{count}} ingrédient(s)',
      yourIngredients: 'Vos ingrédients'
    },
    
    // Général
    common: {
      quantity: 'Quantité',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      confirm: 'Confirmation',
      cancel: 'Annuler',
      delete: 'Supprimer',
      save: 'Sauvegarder',
      edit: 'Modifier',
      add: 'Ajouter',
      remove: 'Supprimer',
      language: 'Langue'
    }
  },
  
  en: {
    // Navigation
    nav: {
      inventory: 'Inventory',
      diets: 'Diets',
      recipes: 'Recipes'
    },
    
    // Inventory
    inventory: {
      title: 'Inventory Management',
      subtitle: 'Optimize your food stock',
      popularFoods: 'Popular foods',
      addFood: 'Add food',
      quickActions: 'Quick actions',
      currentInventory: 'Current inventory',
      empty: 'Empty inventory\n\nAdd foods to get started!',
      searchFood: "🔍 Search for food...",
      noResults: "No results found",
      
      // Form
      foodName: 'Food name',
      quantity: 'Quantity',
      expiration: 'Expiration date',
      addToInventory: 'Add to inventory',
      
      // Actions
      viewInventory: 'View inventory',
      expiredFoods: 'Expired foods',
      statistics: 'Statistics',
      
      // Messages
      added: 'added successfully!',
      updated: 'updated! Total quantity',
      deleted: 'removed from inventory',
      emptyMessage: 'Your inventory is empty.',
      
      // Status
      expired: 'EXPIRED',
      expiresIn: 'Expires in {{days}} day(s)',
      expiresOn: 'Expires on {{date}}',
      noDate: 'No date specified',

      // Empty
      clearAll: 'Clear entire inventory',
      clearConfirm: 'Are you sure you want to delete ALL {{count}} item(s)? This action cannot be undone!',
      alreadyEmpty: 'Inventory is already empty!',
      clearSuccess: '✅ Inventory cleared! {{count}} item(s) removed.',
      clearError: '❌ Error while clearing inventory'
    },
    
    // Diets
    diets: {
      title: 'Dietary Preferences',
      subtitle: 'Configure your diets and allergies',
      dietTypes: 'Diet types',
      allergies: 'Allergies and intolerances',
      summary: 'View summary',
      reset: 'Reset',
      resetConfirm: 'Are you sure you want to reset all your preferences?',
      resetSuccess: 'Preferences reset!'
    },
    
    // Recipes
    recipes: {
      title: 'Recipe Suggestions',
      subtitle: 'Find recipes with your ingredients',
      optimizedSearch: 'Optimized search',
      optimizedDesc: 'Find the best recipes with your available ingredients.\nPrioritizes foods that expire soon!',
      searchOptimized: 'Optimized search',
      searchByName: 'Search by name',
      searchByNameDesc: 'Recipe name (e.g: pasta, pizza, soup...)',
      search: 'Search',
      usefulActions: 'Useful actions',
      priorityFoods: 'Foods to use',
      shoppingSuggestions: 'Shopping suggestions',
      
      // Messages
      searching: 'Searching...',
      noRecipes: 'No recipes found',
      emptyInventory: 'Add foods to your inventory first!',
      enterRecipeName: 'Please enter a recipe name.',
      
      // Recipe display
      recipesFound: 'recipes found • Optimized for your inventory',
      recipeSummary: 'Recipe Summary',
      perfectMatches: 'Perfect matches',
      goodMatches: 'Good matches',
      partialMatches: 'Partial matches',
      recipePages: 'Recipe Pages',
      page: 'Page',
      recipes: 'Recipes',
      
      // Details
      viewDetails: 'View details',
      fullRecipe: 'Full recipe',
      ingredients: 'Ingredients',
      instructions: 'Instructions',
      minutes: 'minutes',
      servings: 'servings',
      close: 'Close',
      originalSite: 'Original site',
      
      // Navigation
      home: 'Home',
      previous: 'Previous',
      next: 'Next',
      
      // Scores
      perfectMatch: 'PERFECT MATCH!',
      veryGoodMatch: 'VERY GOOD MATCH',
      goodMatch: 'GOOD MATCH',
      partialMatch: 'PARTIAL MATCH',
      uses: 'Uses {{count}} of your ingredients',
      missing: 'Missing {{count}} ingredient(s)',
      yourIngredients: 'Your ingredients'
    },
    
    // Common
    common: {
      quantity: 'Quantity',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      confirm: 'Confirmation',
      cancel: 'Cancel',
      delete: 'Delete',
      save: 'Save',
      edit: 'Edit',
      add: 'Add',
      remove: 'Remove',
      language: 'Language'
    }
  },
  
  es: {
    // Navigation
    nav: {
      inventory: 'Inventario',
      diets: 'Dietas',
      recipes: 'Recetas'
    },
    
    // Inventory
    inventory: {
      title: 'Gestión de Inventario',
      subtitle: 'Optimiza tu stock de alimentos',
      popularFoods: 'Alimentos populares',
      addFood: 'Agregar alimento',
      quickActions: 'Acciones rápidas',
      currentInventory: 'Inventario actual',
      empty: 'Inventario vacío\n\n¡Agrega alimentos para comenzar!',
      
      // Form
      foodName: 'Nombre del alimento',
      quantity: 'Cantidad',
      expiration: 'Fecha de caducidad',
      addToInventory: 'Agregar al inventario',
      
      // Actions
      viewInventory: 'Ver inventario',
      expiredFoods: 'Alimentos caducados',
      statistics: 'Estadísticas',
      
      // Messages
      added: '¡agregado con éxito!',
      updated: '¡actualizado! Cantidad total',
      deleted: 'eliminado del inventario',
      emptyMessage: 'Tu inventario está vacío.',
      
      // Status
      expired: 'CADUCADO',
      expiresIn: 'Caduca en {{days}} día(s)',
      expiresOn: 'Caduca el {{date}}',
      noDate: 'Sin fecha especificada'
    },
    
    // Diets
    diets: {
      title: 'Preferencias Dietéticas',
      subtitle: 'Configura tus dietas y alergias',
      dietTypes: 'Tipos de dieta',
      allergies: 'Alergias e intolerancias',
      summary: 'Ver resumen',
      reset: 'Restablecer',
      resetConfirm: '¿Estás seguro de que quieres restablecer todas tus preferencias?',
      resetSuccess: '¡Preferencias restablecidas!'
    },
    
    // Recipes
    recipes: {
      title: 'Sugerencias de Recetas',
      subtitle: 'Encuentra recetas con tus ingredientes',
      optimizedSearch: 'Búsqueda optimizada',
      optimizedDesc: 'Encuentra las mejores recetas con tus ingredientes disponibles.\n¡Prioriza alimentos que caducan pronto!',
      searchOptimized: 'Búsqueda optimizada',
      searchByName: 'Buscar por nombre',
      searchByNameDesc: 'Nombre de la receta (ej: pasta, pizza, sopa...)',
      search: 'Buscar',
      usefulActions: 'Acciones útiles',
      priorityFoods: 'Alimentos a usar',
      shoppingSuggestions: 'Sugerencias de compras',
      
      // Messages
      searching: 'Buscando...',
      noRecipes: 'No se encontraron recetas',
      emptyInventory: '¡Primero agrega alimentos a tu inventario!',
      enterRecipeName: 'Por favor ingresa el nombre de una receta.',
      
      // Recipe display
      recipesFound: 'recetas encontradas • Optimizadas para tu inventario',
      recipeSummary: 'Resumen de Recetas',
      perfectMatches: 'Coincidencias perfectas',
      goodMatches: 'Buenas coincidencias',
      partialMatches: 'Coincidencias parciales',
      recipePages: 'Páginas de Recetas',
      page: 'Página',
      recipes: 'Recetas',
      
      // Details
      viewDetails: 'Ver detalles',
      fullRecipe: 'Receta completa',
      ingredients: 'Ingredientes',
      instructions: 'Instrucciones',
      minutes: 'minutos',
      servings: 'porciones',
      close: 'Cerrar',
      originalSite: 'Sitio original',
      
      // Navigation
      home: 'Inicio',
      previous: 'Anterior',
      next: 'Siguiente',
      
      // Scores
      perfectMatch: '¡COINCIDENCIA PERFECTA!',
      veryGoodMatch: 'MUY BUENA COINCIDENCIA',
      goodMatch: 'BUENA COINCIDENCIA',
      partialMatch: 'COINCIDENCIA PARCIAL',
      uses: 'Usa {{count}} de tus ingredientes',
      missing: 'Faltan {{count}} ingrediente(s)',
      yourIngredients: 'Tus ingredientes'
    },
    
    // Common
    common: {
      quantity: 'Cantidad',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      confirm: 'Confirmación',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      save: 'Guardar',
      edit: 'Editar',
      add: 'Agregar',
      remove: 'Eliminar',
      language: 'Idioma'
    }
  },
  
  de: {
    // Navigation
    nav: {
      inventory: 'Inventar',
      diets: 'Diäten',
      recipes: 'Rezepte'
    },
    
    // Inventory
    inventory: {
      title: 'Inventar-Verwaltung',
      subtitle: 'Optimieren Sie Ihren Lebensmittelvorrat',
      popularFoods: 'Beliebte Lebensmittel',
      addFood: 'Lebensmittel hinzufügen',
      quickActions: 'Schnelle Aktionen',
      currentInventory: 'Aktuelles Inventar',
      empty: 'Leeres Inventar\n\nFügen Sie Lebensmittel hinzu, um zu beginnen!',
      
      // Form
      foodName: 'Name des Lebensmittels',
      quantity: 'Menge',
      expiration: 'Ablaufdatum',
      addToInventory: 'Zum Inventar hinzufügen',
      
      // Actions
      viewInventory: 'Inventar anzeigen',
      expiredFoods: 'Abgelaufene Lebensmittel',
      statistics: 'Statistiken',
      
      // Messages
      added: 'erfolgreich hinzugefügt!',
      updated: 'aktualisiert! Gesamtmenge',
      deleted: 'aus dem Inventar entfernt',
      emptyMessage: 'Ihr Inventar ist leer.',
      
      // Status
      expired: 'ABGELAUFEN',
      expiresIn: 'Läuft ab in {{days}} Tag(en)',
      expiresOn: 'Läuft ab am {{date}}',
      noDate: 'Kein Datum angegeben'
    },
    
    // Diets
    diets: {
      title: 'Ernährungspräferenzen',
      subtitle: 'Konfigurieren Sie Ihre Diäten und Allergien',
      dietTypes: 'Diättypen',
      allergies: 'Allergien und Unverträglichkeiten',
      summary: 'Zusammenfassung anzeigen',
      reset: 'Zurücksetzen',
      resetConfirm: 'Sind Sie sicher, dass Sie alle Ihre Präferenzen zurücksetzen möchten?',
      resetSuccess: 'Präferenzen zurückgesetzt!'
    },
    
    // Recipes
    recipes: {
      title: 'Rezeptvorschläge',
      subtitle: 'Finden Sie Rezepte mit Ihren Zutaten',
      optimizedSearch: 'Optimierte Suche',
      optimizedDesc: 'Finden Sie die besten Rezepte mit Ihren verfügbaren Zutaten.\nPriorisiert Lebensmittel, die bald ablaufen!',
      searchOptimized: 'Optimierte Suche',
      searchByName: 'Nach Name suchen',
      searchByNameDesc: 'Rezeptname (z.B: Pasta, Pizza, Suppe...)',
      search: 'Suchen',
      usefulActions: 'Nützliche Aktionen',
      priorityFoods: 'Zu verwendende Lebensmittel',
      shoppingSuggestions: 'Einkaufsvorschläge',
      
      // Messages
      searching: 'Suche...',
      noRecipes: 'Keine Rezepte gefunden',
      emptyInventory: 'Fügen Sie zuerst Lebensmittel zu Ihrem Inventar hinzu!',
      enterRecipeName: 'Bitte geben Sie einen Rezeptnamen ein.',
      
      // Recipe display
      recipesFound: 'Rezepte gefunden • Optimiert für Ihr Inventar',
      recipeSummary: 'Rezept-Zusammenfassung',
      perfectMatches: 'Perfekte Übereinstimmungen',
      goodMatches: 'Gute Übereinstimmungen',
      partialMatches: 'Teilweise Übereinstimmungen',
      recipePages: 'Rezeptseiten',
      page: 'Seite',
      recipes: 'Rezepte',
      
      // Details
      viewDetails: 'Details anzeigen',
      fullRecipe: 'Vollständiges Rezept',
      ingredients: 'Zutaten',
      instructions: 'Anweisungen',
      minutes: 'Minuten',
      servings: 'Portionen',
      close: 'Schließen',
      originalSite: 'Original-Website',
      
      // Navigation
      home: 'Startseite',
      previous: 'Vorherige',
      next: 'Nächste',
      
      // Scores
      perfectMatch: 'PERFEKTE ÜBEREINSTIMMUNG!',
      veryGoodMatch: 'SEHR GUTE ÜBEREINSTIMMUNG',
      goodMatch: 'GUTE ÜBEREINSTIMMUNG',
      partialMatch: 'TEILWEISE ÜBEREINSTIMMUNG',
      uses: 'Verwendet {{count}} Ihrer Zutaten',
      missing: 'Fehlen {{count}} Zutat(en)',
      yourIngredients: 'Ihre Zutaten'
    },
    
    // Common
    common: {
      quantity: 'Menge',
      loading: 'Laden...',
      error: 'Fehler',
      success: 'Erfolg',
      confirm: 'Bestätigung',
      cancel: 'Abbrechen',
      delete: 'Löschen',
      save: 'Speichern',
      edit: 'Bearbeiten',
      add: 'Hinzufügen',
      remove: 'Entfernen',
      language: 'Sprache'
    }
  }
};

export default LanguageManager;
