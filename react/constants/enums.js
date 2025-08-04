// constants/enums.js

export const RegimeAlimentaire = {
  VEGETARIEN: { 
    value: "vegetarian", 
    emoji: "🥬", 
    nom: "Végétarien", 
    description: "Pas de viande ni poisson" 
  },
  VEGAN: { 
    value: "vegan", 
    emoji: "🌱", 
    nom: "Végan", 
    description: "Aucun produit animal" 
  },
  SANS_GLUTEN: { 
    value: "gluten-free", 
    emoji: "🌾", 
    nom: "Sans gluten", 
    description: "Sans blé, orge, seigle" 
  },
  CETOGENE: { 
    value: "ketogenic", 
    emoji: "🥑", 
    nom: "Cétogène", 
    description: "Très faible en glucides" 
  },
  PALEO: { 
    value: "paleo", 
    emoji: "🦴", 
    nom: "Paléo", 
    description: "Aliments non transformés" 
  },
  SANS_LACTOSE: { 
    value: "dairy-free", 
    emoji: "🥛", 
    nom: "Sans lactose", 
    description: "Sans produits laitiers" 
  },
  SANS_NOIX: { 
    value: "tree-nut-free", 
    emoji: "🥜", 
    nom: "Sans noix", 
    description: "Sans fruits à coque" 
  },
  PESCETARIEN: { 
    value: "pescetarian", 
    emoji: "🐟", 
    nom: "Pescétarien", 
    description: "Végétarien + poisson" 
  },
  MEDITERANNEEN: { 
    value: "mediterranean", 
    emoji: "🫒", 
    nom: "Méditerranéen", 
    description: "Riche en légumes et huile d'olive" 
  },
  SANS_SUCRE_AJOUTE: { 
    value: "low-sugar", 
    emoji: "🍯", 
    nom: "Sans sucre ajouté", 
    description: "Faible en sucres ajoutés" 
  }
};

export const Allergie = {
  GLUTEN: { 
    value: "gluten", 
    emoji: "🌾", 
    nom: "Gluten" 
  },
  LACTOSE: { 
    value: "dairy", 
    emoji: "🥛", 
    nom: "Lactose/Produits laitiers" 
  },
  OEUFS: { 
    value: "egg", 
    emoji: "🥚", 
    nom: "Œufs" 
  },
  NOIX: { 
    value: "tree nut", 
    emoji: "🥜", 
    nom: "Noix et fruits à coque" 
  },
  ARACHIDES: { 
    value: "peanut", 
    emoji: "🥜", 
    nom: "Arachides" 
  },
  POISSON: { 
    value: "seafood", 
    emoji: "🐟", 
    nom: "Poisson et fruits de mer" 
  },
  SOJA: { 
    value: "soy", 
    emoji: "🫘", 
    nom: "Soja" 
  },
  SESAME: { 
    value: "sesame", 
    emoji: "🫘", 
    nom: "Sésame" 
  }
};

// Constantes pour les durées d'expiration
export const DUREES_CONSERVATION = {
  TRES_FRAIS: {
    jours: 4,
    aliments: ['Salade', 'Fraise', 'Cerise', 'Griotte', 'Lait', 'Poisson']
  },
  FRAIS: {
    jours: 7,
    aliments: ['Pomme', 'Banane', 'Orange', 'Carotte', 'Concombre', 'Tomate', 'Pain', 'Baguette']
  },
  MOYEN: {
    jours: 14,
    aliments: ['Fromage', 'Œuf', 'Pomme de terre', 'Oignon']
  },
  LONGUE: {
    jours: 60,
    aliments: ['Riz', 'Pâtes', 'Miel', 'Thé', 'Café', 'Beurre']
  }
};

// Configuration API
export const API_CONFIG = {
  BASE_URL: "https://api.spoonacular.com",
  ENDPOINTS: {
    FIND_BY_INGREDIENTS: "/recipes/findByIngredients",
    COMPLEX_SEARCH: "/recipes/complexSearch",
    RECIPE_INFORMATION: "/recipes/{id}/information"
  },
  DEFAULT_PARAMS: {
    RANKING: 2,
    IGNORE_PANTRY: true,
    INCLUDE_NUTRITION: false
  }
};

// Messages d'erreur standardisés
export const ERROR_MESSAGES = {
  NO_INGREDIENTS: "Aucun ingrédient fourni",
  NO_RECIPES_FOUND: "Aucune recette trouvée",
  API_LIMIT_REACHED: "Limite d'API atteinte. Réessayez plus tard.",
  CONNECTION_ERROR: "Erreur de connexion. Vérifiez votre internet.",
  EMPTY_INVENTORY: "Votre inventaire est vide",
  INVALID_QUANTITY: "La quantité doit être positive",
  EMPTY_FOOD_NAME: "Veuillez saisir le nom de l'aliment"
};

// Messages de succès
export const SUCCESS_MESSAGES = {
  FOOD_ADDED: "ajouté avec succès !",
  FOOD_UPDATED: "mis à jour !",
  FOOD_DELETED: "supprimé de l'inventaire",
  RECIPES_FOUND: "Recettes trouvées avec succès",
  PREFERENCES_SAVED: "Préférences sauvegardées",
  PREFERENCES_RESET: "Préférences réinitialisées !"
};