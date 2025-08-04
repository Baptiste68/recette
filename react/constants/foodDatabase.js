// constants/foodDatabase.js

export const FOOD_CATEGORIES = {
  FRUITS: {
    id: 'fruits',
    icon: '🍎',
    color: '#ff6b6b',
    translations: {
      fr: 'Fruits',
      en: 'Fruits',
      es: 'Frutas',
      de: 'Früchte'
    }
  },
  VEGETABLES: {
    id: 'vegetables',
    icon: '🥕',
    color: '#51cf66',
    translations: {
      fr: 'Légumes',
      en: 'Vegetables',
      es: 'Verduras',
      de: 'Gemüse'
    }
  },
  DAIRY: {
    id: 'dairy',
    icon: '🥛',
    color: '#74c0fc',
    translations: {
      fr: 'Produits laitiers',
      en: 'Dairy products',
      es: 'Productos lácteos',
      de: 'Milchprodukte'
    }
  },
  MEAT: {
    id: 'meat',
    icon: '🍖',
    color: '#ff8787',
    translations: {
      fr: 'Viandes',
      en: 'Meat',
      es: 'Carnes',
      de: 'Fleisch'
    }
  },
  SEAFOOD: {
    id: 'seafood',
    icon: '🐟',
    color: '#4dabf7',
    translations: {
      fr: 'Fruits de mer',
      en: 'Seafood',
      es: 'Mariscos',
      de: 'Meeresfrüchte'
    }
  },
  GRAINS: {
    id: 'grains',
    icon: '🌾',
    color: '#ffd43b',
    translations: {
      fr: 'Céréales',
      en: 'Grains',
      es: 'Cereales',
      de: 'Getreide'
    }
  },
  NUTS: {
    id: 'nuts',
    icon: '🥜',
    color: '#d0bfff',
    translations: {
      fr: 'Noix & Graines',
      en: 'Nuts & Seeds',
      es: 'Nueces y Semillas',
      de: 'Nüsse & Samen'
    }
  },
  BEVERAGES: {
    id: 'beverages',
    icon: '☕',
    color: '#845ef7',
    translations: {
      fr: 'Boissons',
      en: 'Beverages',
      es: 'Bebidas',
      de: 'Getränke'
    }
  },
  CONDIMENTS: {
    id: 'condiments',
    icon: '🧂',
    color: '#69db7c',
    translations: {
      fr: 'Condiments',
      en: 'Condiments',
      es: 'Condimentos',
      de: 'Gewürze'
    }
  },
  SNACKS: {
    id: 'snacks',
    icon: '🍿',
    color: '#ffa94d',
    translations: {
      fr: 'Collations',
      en: 'Snacks',
      es: 'Aperitivos',
      de: 'Snacks'
    }
  }
};

export const PREDEFINED_FOODS = {
  // FRUITS - Version complète avec quantités standards
  fruits: [
    {
      emoji: '🍎',
      translations: { fr: 'Pomme', en: 'Apple', es: 'Manzana', de: 'Apfel' },
      shelfLife: 14,
      category: 'fruits',
      defaultQuantity: 1,
      defaultUnit: 'pièces'
    },
    {
      emoji: '🍌',
      translations: { fr: 'Banane', en: 'Banana', es: 'Plátano', de: 'Banane' },
      shelfLife: 7,
      category: 'fruits',
      defaultQuantity: 1,
      defaultUnit: 'pièces'
    },
    {
      emoji: '🍊',
      translations: { fr: 'Orange', en: 'Orange', es: 'Naranja', de: 'Orange' },
      shelfLife: 10,
      category: 'fruits',
      defaultQuantity: 1,
      defaultUnit: 'pièces'
    },
    {
      emoji: '🍇',
      translations: { fr: 'Raisin', en: 'Grapes', es: 'Uvas', de: 'Trauben' },
      shelfLife: 7,
      category: 'fruits',
      defaultQuantity: 500,
      defaultUnit: 'g'
    },
    {
      emoji: '🍓',
      translations: { fr: 'Fraise', en: 'Strawberry', es: 'Fresa', de: 'Erdbeere' },
      shelfLife: 3,
      category: 'fruits',
      defaultQuantity: 250,
      defaultUnit: 'g'
    },
    {
      emoji: '🥝',
      translations: { fr: 'Kiwi', en: 'Kiwi', es: 'Kiwi', de: 'Kiwi' },
      shelfLife: 10,
      category: 'fruits',
      defaultQuantity: 1,
      defaultUnit: 'pièces'
    },
    {
      emoji: '🍑',
      translations: { fr: 'Cerise', en: 'Cherry', es: 'Cereza', de: 'Kirsche' },
      shelfLife: 5,
      category: 'fruits',
      defaultQuantity: 300,
      defaultUnit: 'g'
    },
    {
      emoji: '🍒',
      translations: { fr: 'Griotte', en: 'Sour Cherry', es: 'Cereza Agria', de: 'Sauerkirsche' },
      shelfLife: 5,
      category: 'fruits',
      defaultQuantity: 250,
      defaultUnit: 'g'
    },
    {
      emoji: '🥭',
      translations: { fr: 'Mangue', en: 'Mango', es: 'Mango', de: 'Mango' },
      shelfLife: 7,
      category: 'fruits',
      defaultQuantity: 1,
      defaultUnit: 'pièces'
    },
    {
      emoji: '🍍',
      translations: { fr: 'Ananas', en: 'Pineapple', es: 'Piña', de: 'Ananas' },
      shelfLife: 10,
      category: 'fruits',
      defaultQuantity: 1,
      defaultUnit: 'pièce'
    },
    {
      emoji: '🥥',
      translations: { fr: 'Noix de coco', en: 'Coconut', es: 'Coco', de: 'Kokosnuss' },
      shelfLife: 30,
      category: 'fruits',
      defaultQuantity: 1,
      defaultUnit: 'pièce'
    },
    {
      emoji: '🍋',
      translations: { fr: 'Citron', en: 'Lemon', es: 'Limón', de: 'Zitrone' },
      shelfLife: 14,
      category: 'fruits',
      defaultQuantity: 1,
      defaultUnit: 'pièces'
    },
    {
      emoji: '🍐',
      translations: { fr: 'Poire', en: 'Pear', es: 'Pera', de: 'Birne' },
      shelfLife: 10,
      category: 'fruits',
      defaultQuantity: 1,
      defaultUnit: 'pièces'
    }
  ],

  // VEGETABLES - Version complète avec quantités standards
  vegetables: [
    {
      emoji: '🥕',
      translations: { fr: 'Carotte', en: 'Carrot', es: 'Zanahoria', de: 'Karotte' },
      shelfLife: 21,
      category: 'vegetables',
      defaultQuantity: 1,
      defaultUnit: 'kg'
    },
    {
      emoji: '🥒',
      translations: { fr: 'Concombre', en: 'Cucumber', es: 'Pepino', de: 'Gurke' },
      shelfLife: 7,
      category: 'vegetables',
      defaultQuantity: 1,
      defaultUnit: 'pièces'
    },
    {
      emoji: '🍅',
      translations: { fr: 'Tomate', en: 'Tomato', es: 'Tomate', de: 'Tomate' },
      shelfLife: 7,
      category: 'vegetables',
      defaultQuantity: 1,
      defaultUnit: 'pièces'
    },
    {
      emoji: '🥬',
      translations: { fr: 'Salade', en: 'Lettuce', es: 'Lechuga', de: 'Salat' },
      shelfLife: 5,
      category: 'vegetables',
      defaultQuantity: 1,
      defaultUnit: 'pièce'
    },
    {
      emoji: '🥔',
      translations: { fr: 'Pomme de terre', en: 'Potato', es: 'Papa', de: 'Kartoffel' },
      shelfLife: 30,
      category: 'vegetables',
      defaultQuantity: 1,
      defaultUnit: 'kg'
    },
    {
      emoji: '🧅',
      translations: { fr: 'Oignon', en: 'Onion', es: 'Cebolla', de: 'Zwiebel' },
      shelfLife: 30,
      category: 'vegetables',
      defaultQuantity: 1,
      defaultUnit: 'kg'
    },
    {
      emoji: '🥦',
      translations: { fr: 'Brocoli', en: 'Broccoli', es: 'Brócoli', de: 'Brokkoli' },
      shelfLife: 7,
      category: 'vegetables',
      defaultQuantity: 1,
      defaultUnit: 'pièce'
    },
    {
      emoji: '🌶️',
      translations: { fr: 'Piment', en: 'Chili', es: 'Chile', de: 'Chili' },
      shelfLife: 10,
      category: 'vegetables',
      defaultQuantity: 100,
      defaultUnit: 'g'
    },
    {
      emoji: '🫒',
      translations: { fr: 'Olive', en: 'Olive', es: 'Aceituna', de: 'Olive' },
      shelfLife: 60,
      category: 'vegetables',
      defaultQuantity: 200,
      defaultUnit: 'g'
    },
    {
      emoji: '🥑',
      translations: { fr: 'Avocat', en: 'Avocado', es: 'Aguacate', de: 'Avocado' },
      shelfLife: 5,
      category: 'vegetables',
      defaultQuantity: 1,
      defaultUnit: 'pièces'
    },
    {
      emoji: '🌽',
      translations: { fr: 'Maïs', en: 'Corn', es: 'Maíz', de: 'Mais' },
      shelfLife: 5,
      category: 'vegetables',
      defaultQuantity: 1,
      defaultUnit: 'épis'
    },
    {
      emoji: '🍆',
      translations: { fr: 'Aubergine', en: 'Eggplant', es: 'Berenjena', de: 'Aubergine' },
      shelfLife: 7,
      category: 'vegetables',
      defaultQuantity: 1,
      defaultUnit: 'pièces'
    }
  ],

  // DAIRY - Version complète avec quantités standards
  dairy: [
    {
      emoji: '🥛',
      translations: { fr: 'Lait', en: 'Milk', es: 'Leche', de: 'Milch' },
      shelfLife: 7,
      category: 'dairy',
      defaultQuantity: 1,
      defaultUnit: 'L'
    },
    {
      emoji: '🧀',
      translations: { fr: 'Fromage', en: 'Cheese', es: 'Queso', de: 'Käse' },
      shelfLife: 14,
      category: 'dairy',
      defaultQuantity: 250,
      defaultUnit: 'g'
    },
    {
      emoji: '🧈',
      translations: { fr: 'Beurre', en: 'Butter', es: 'Mantequilla', de: 'Butter' },
      shelfLife: 30,
      category: 'dairy',
      defaultQuantity: 250,
      defaultUnit: 'g'
    },
    {
      emoji: '🥚',
      translations: { fr: 'Œuf', en: 'Egg', es: 'Huevo', de: 'Ei' },
      shelfLife: 21,
      category: 'dairy',
      defaultQuantity: 12,
      defaultUnit: 'pièces'
    },
    {
      emoji: '🍦',
      translations: { fr: 'Yaourt', en: 'Yogurt', es: 'Yogur', de: 'Joghurt' },
      shelfLife: 10,
      category: 'dairy',
      defaultQuantity: 4,
      defaultUnit: 'pots'
    }
  ],

  // MEAT - Version complète avec quantités standards
  meat: [
    {
      emoji: '🥩',
      translations: { fr: 'Bœuf', en: 'Beef', es: 'Carne de res', de: 'Rindfleisch' },
      shelfLife: 3,
      category: 'meat',
      defaultQuantity: 500,
      defaultUnit: 'g'
    },
    {
      emoji: '🍗',
      translations: { fr: 'Poulet', en: 'Chicken', es: 'Pollo', de: 'Hähnchen' },
      shelfLife: 2,
      category: 'meat',
      defaultQuantity: 1,
      defaultUnit: 'kg'
    },
    {
      emoji: '🥓',
      translations: { fr: 'Bacon', en: 'Bacon', es: 'Tocino', de: 'Speck' },
      shelfLife: 7,
      category: 'meat',
      defaultQuantity: 200,
      defaultUnit: 'g'
    },
    {
      emoji: '🌭',
      translations: { fr: 'Saucisse', en: 'Sausage', es: 'Salchicha', de: 'Wurst' },
      shelfLife: 14,
      category: 'meat',
      defaultQuantity: 6,
      defaultUnit: 'pièces'
    }
  ],

  // SEAFOOD - Version complète avec quantités standards
  seafood: [
    {
      emoji: '🐟',
      translations: { fr: 'Poisson', en: 'Fish', es: 'Pescado', de: 'Fisch' },
      shelfLife: 2,
      category: 'seafood',
      defaultQuantity: 400,
      defaultUnit: 'g'
    },
    {
      emoji: '🦐',
      translations: { fr: 'Crevette', en: 'Shrimp', es: 'Camarón', de: 'Garnele' },
      shelfLife: 2,
      category: 'seafood',
      defaultQuantity: 300,
      defaultUnit: 'g'
    },
    {
      emoji: '🦀',
      translations: { fr: 'Crabe', en: 'Crab', es: 'Cangrejo', de: 'Krabbe' },
      shelfLife: 2,
      category: 'seafood',
      defaultQuantity: 2,
      defaultUnit: 'pièces'
    },
    {
      emoji: '🐙',
      translations: { fr: 'Poulpe', en: 'Octopus', es: 'Pulpo', de: 'Oktopus' },
      shelfLife: 2,
      category: 'seafood',
      defaultQuantity: 500,
      defaultUnit: 'g'
    }
  ],

  // GRAINS - Version complète avec quantités standards
  grains: [
    {
      emoji: '🍞',
      translations: { fr: 'Pain', en: 'Bread', es: 'Pan', de: 'Brot' },
      shelfLife: 5,
      category: 'grains',
      defaultQuantity: 1,
      defaultUnit: 'pièce'
    },
    {
      emoji: '🍝',
      translations: { fr: 'Pâtes', en: 'Pasta', es: 'Pasta', de: 'Nudeln' },
      shelfLife: 365,
      category: 'grains',
      defaultQuantity: 500,
      defaultUnit: 'g'
    },
    {
      emoji: '🍚',
      translations: { fr: 'Riz', en: 'Rice', es: 'Arroz', de: 'Reis' },
      shelfLife: 365,
      category: 'grains',
      defaultQuantity: 1,
      defaultUnit: 'kg'
    },
    {
      emoji: '🥖',
      translations: { fr: 'Baguette', en: 'Baguette', es: 'Baguette', de: 'Baguette' },
      shelfLife: 2,
      category: 'grains',
      defaultQuantity: 1,
      defaultUnit: 'pièce'
    },
    {
      emoji: '🥯',
      translations: { fr: 'Bagel', en: 'Bagel', es: 'Bagel', de: 'Bagel' },
      shelfLife: 5,
      category: 'grains',
      defaultQuantity: 6,
      defaultUnit: 'pièces'
    },
    {
      emoji: '🌾',
      translations: { fr: 'Blé', en: 'Wheat', es: 'Trigo', de: 'Weizen' },
      shelfLife: 180,
      category: 'grains',
      defaultQuantity: 1,
      defaultUnit: 'kg'
    }
  ],

  // NUTS - Version complète avec quantités standards
  nuts: [
    {
      emoji: '🥜',
      translations: { fr: 'Arachide', en: 'Peanut', es: 'Cacahuete', de: 'Erdnuss' },
      shelfLife: 90,
      category: 'nuts',
      defaultQuantity: 250,
      defaultUnit: 'g'
    },
    {
      emoji: '🌰',
      translations: { fr: 'Châtaigne', en: 'Chestnut', es: 'Castaña', de: 'Kastanie' },
      shelfLife: 30,
      category: 'nuts',
      defaultQuantity: 500,
      defaultUnit: 'g'
    },
    {
      emoji: '🧱🔩',
      translations: { fr: 'Noix', en: 'Walnut', es: 'Nuez', de: 'Walnuss' },
      shelfLife: 60,
      category: 'nuts',
      defaultQuantity: 250,
      defaultUnit: 'g'
    }
  ],

  // BEVERAGES - Version complète avec quantités standards
  beverages: [
    {
      emoji: '☕',
      translations: { fr: 'Café', en: 'Coffee', es: 'Café', de: 'Kaffee' },
      shelfLife: 365,
      category: 'beverages',
      defaultQuantity: 250,
      defaultUnit: 'g'
    },
    {
      emoji: '🫖',
      translations: { fr: 'Thé', en: 'Tea', es: 'Té', de: 'Tee' },
      shelfLife: 365,
      category: 'beverages',
      defaultQuantity: 20,
      defaultUnit: 'sachets'
    },
    {
      emoji: '🧃',
      translations: { fr: 'Jus', en: 'Juice', es: 'Jugo', de: 'Saft' },
      shelfLife: 30,
      category: 'beverages',
      defaultQuantity: 1,
      defaultUnit: 'L'
    },
    {
      emoji: '🍷',
      translations: { fr: 'Vin', en: 'Wine', es: 'Vino', de: 'Wein' },
      shelfLife: 1825,
      category: 'beverages',
      defaultQuantity: 1,
      defaultUnit: 'bouteille'
    }
  ],

  // CONDIMENTS - Version complète avec quantités standards
  condiments: [
    {
      emoji: '🍯',
      translations: { fr: 'Miel', en: 'Honey', es: 'Miel', de: 'Honig' },
      shelfLife: 365,
      category: 'condiments',
      defaultQuantity: 250,
      defaultUnit: 'g'
    },
    {
      emoji: '🧂',
      translations: { fr: 'Sel', en: 'Salt', es: 'Sal', de: 'Salz' },
      shelfLife: 1825,
      category: 'condiments',
      defaultQuantity: 1,
      defaultUnit: 'kg'
    },
    {
      emoji: '🌿',
      translations: { fr: 'Herbes', en: 'Herbs', es: 'Hierbas', de: 'Kräuter' },
      shelfLife: 180,
      category: 'condiments',
      defaultQuantity: 1,
      defaultUnit: 'bouquet'
    },
    {
      emoji: '🧄',
      translations: { fr: 'Ail', en: 'Garlic', es: 'Ajo', de: 'Knoblauch' },
      shelfLife: 30,
      category: 'condiments',
      defaultQuantity: 1,
      defaultUnit: 'tête'
    }
  ],

  // SNACKS - Version complète avec quantités standards
  snacks: [
    {
      emoji: '🍿',
      translations: { fr: 'Pop-corn', en: 'Popcorn', es: 'Palomitas', de: 'Popcorn' },
      shelfLife: 30,
      category: 'snacks',
      defaultQuantity: 100,
      defaultUnit: 'g'
    },
    {
      emoji: '🥨',
      translations: { fr: 'Bretzel', en: 'Pretzel', es: 'Pretzel', de: 'Brezel' },
      shelfLife: 60,
      category: 'snacks',
      defaultQuantity: 200,
      defaultUnit: 'g'
    },
    {
      emoji: '🍪',
      translations: { fr: 'Cookie', en: 'Cookie', es: 'Galleta', de: 'Keks' },
      shelfLife: 30,
      category: 'snacks',
      defaultQuantity: 12,
      defaultUnit: 'pièces'
    },
    {
      emoji: '🍫',
      translations: { fr: 'Chocolat', en: 'Chocolate', es: 'Chocolate', de: 'Schokolade' },
      shelfLife: 180,
      category: 'snacks',
      defaultQuantity: 100,
      defaultUnit: 'g'
    }
  ]
};

// Fonction utilitaire pour obtenir tous les aliments sous forme de liste plate
export const getAllFoods = () => {
  return Object.values(PREDEFINED_FOODS).flat();
};

// Fonction pour obtenir un aliment par nom dans une langue donnée
export const getFoodByName = (name, language = 'fr') => {
  const allFoods = getAllFoods();
  return allFoods.find(food => 
    food.translations[language]?.toLowerCase() === name.toLowerCase()
  );
};

// Fonction pour obtenir le nom d'un aliment dans une langue donnée
export const getFoodName = (food, language = 'fr') => {
  return food.translations[language] || food.translations['en'] || 'Unknown';
};

// Fonction pour obtenir les aliments d'une catégorie
export const getFoodsByCategory = (categoryId) => {
  return PREDEFINED_FOODS[categoryId] || [];
};

// Fonction pour rechercher des aliments
export const searchFoods = (query, language = 'fr') => {
  if (!query || query.length < 2) return [];
  
  const allFoods = getAllFoods();
  const queryLower = query.toLowerCase();
  
  return allFoods.filter(food => 
    food.translations[language]?.toLowerCase().includes(queryLower) ||
    food.translations['en']?.toLowerCase().includes(queryLower)
  );
};


// Système d'unités par catégorie d'aliments
export const FOOD_UNITS = {
  fruits: {
    defaultUnit: 'pièce',
    units: ['pièce', 'kg', 'g', 'barquette'],
    suggestions: { 1: 'pièce', 500: 'g', 1000: 'kg' }
  },
  vegetables: {
    defaultUnit: 'pièce', 
    units: ['pièce', 'kg', 'g', 'botte', 'sachet'],
    suggestions: { 1: 'pièce', 200: 'g', 500: 'g', 1000: 'kg' }
  },
  dairy: {
    defaultUnit: 'L',
    units: ['L', 'cl', 'ml', 'g', 'pièce', 'tranche'],
    suggestions: { 1: 'L', 250: 'g', 6: 'pièces', 12: 'tranches' }
  },
  meat: {
    defaultUnit: 'g',
    units: ['g', 'kg', 'pièce', 'tranche', 'portion'],
    suggestions: { 250: 'g', 500: 'g', 1000: 'kg', 4: 'tranches' }
  },
  seafood: {
    defaultUnit: 'g',
    units: ['g', 'kg', 'pièce', 'filet'],
    suggestions: { 200: 'g', 400: 'g', 1: 'pièce', 2: 'filets' }
  },
  grains: {
    defaultUnit: 'g',
    units: ['g', 'kg', 'pièce', 'sachet', 'tranche'],
    suggestions: { 500: 'g', 1000: 'kg', 1: 'pièce', 8: 'tranches' }
  },
  nuts: {
    defaultUnit: 'g',
    units: ['g', 'kg', 'sachet', 'poignée'],
    suggestions: { 100: 'g', 250: 'g', 500: 'g' }
  },
  beverages: {
    defaultUnit: 'L',
    units: ['L', 'ml', 'cl', 'bouteille', 'canette', 'tasse'],
    suggestions: { 1: 'L', 500: 'ml', 33: 'cl', 1: 'bouteille' }
  },
  condiments: {
    defaultUnit: 'g',
    units: ['g', 'ml', 'cl', 'c. à soupe', 'c. à café', 'pincée', 'bouquet', 'gousse'],
    suggestions: { 250: 'g', 500: 'ml', 1: 'bouquet', 1: 'gousse' }
  },
  snacks: {
    defaultUnit: 'g',
    units: ['g', 'pièce', 'sachet', 'paquet'],
    suggestions: { 100: 'g', 1: 'paquet', 6: 'pièces' }
  }
};

// Fonction pour obtenir l'unité suggérée pour un aliment
export const getSuggestedUnit = (foodName, quantity = 1, language = 'fr') => {
  const food = getFoodByName(foodName, language);
  
  // Si l'aliment est dans la base, utiliser ses valeurs par défaut
  if (food && food.defaultUnit) {
    const categoryUnits = FOOD_UNITS[food.category];
    
    return {
      unit: food.defaultUnit,
      quantity: food.defaultQuantity || 1,
      availableUnits: categoryUnits ? categoryUnits.units : [food.defaultUnit, 'pièce', 'g', 'kg'],
      defaultUnit: food.defaultUnit
    };
  }
  
  // Valeurs par défaut si aliment non trouvé
  return {
    unit: 'pièce',
    quantity: 1,
    availableUnits: ['pièce', 'g', 'kg', 'L', 'ml', 'sachet'],
    defaultUnit: 'pièce'
  };
};

//Obtient la quantité et unité standard pour un aliment
export const getStandardQuantity = (foodName, language = 'fr') => {
  // Chercher l'aliment dans la base de données
  const food = getFoodByName(foodName, language);
  
  if (food && food.defaultQuantity && food.defaultUnit) {
    return {
      quantity: food.defaultQuantity,
      unit: food.defaultUnit,
      found: true
    };
  }
  
  // Valeur par défaut si aliment non trouvé
  return {
    quantity: 1,
    unit: 'pièce',
    found: false
  };
};

// Unités de mesure avec leurs équivalences
export const UNIT_CONVERSIONS = {
  // Poids
  'g': { base: 'g', factor: 1, type: 'weight' },
  'kg': { base: 'g', factor: 1000, type: 'weight' },
  
  // Volume
  'ml': { base: 'ml', factor: 1, type: 'volume' },
  'cl': { base: 'ml', factor: 10, type: 'volume' },
  'L': { base: 'ml', factor: 1000, type: 'volume' },
  
  // Pièces et portions
  'pièce': { base: 'pièce', factor: 1, type: 'count' },
  'pièces': { base: 'pièce', factor: 1, type: 'count' },
  'tranche': { base: 'tranche', factor: 1, type: 'count' },
  'tranches': { base: 'tranche', factor: 1, type: 'count' },
  
  // Mesures culinaires
  'cuillère à soupe': { base: 'ml', factor: 15, type: 'volume' },
  'cuillère à café': { base: 'ml', factor: 5, type: 'volume' },
  'tasse': { base: 'ml', factor: 250, type: 'volume' },
  
  // Conditionnements
  'bouteille': { base: 'pièce', factor: 1, type: 'package' },
  'canette': { base: 'pièce', factor: 1, type: 'package' },
  'sachet': { base: 'pièce', factor: 1, type: 'package' },
  'paquet': { base: 'pièce', factor: 1, type: 'package' },
  'boîte': { base: 'pièce', factor: 1, type: 'package' }
};