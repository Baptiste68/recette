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
  // FRUITS
  fruits: [
    {
      emoji: '🍎',
      translations: { fr: 'Pomme', en: 'Apple', es: 'Manzana', de: 'Apfel' },
      shelfLife: 14,
      category: 'fruits'
    },
    {
      emoji: '🍌',
      translations: { fr: 'Banane', en: 'Banana', es: 'Plátano', de: 'Banane' },
      shelfLife: 7,
      category: 'fruits'
    },
    {
      emoji: '🍊',
      translations: { fr: 'Orange', en: 'Orange', es: 'Naranja', de: 'Orange' },
      shelfLife: 10,
      category: 'fruits'
    },
    {
      emoji: '🍇',
      translations: { fr: 'Raisin', en: 'Grapes', es: 'Uvas', de: 'Trauben' },
      shelfLife: 7,
      category: 'fruits'
    },
    {
      emoji: '🍓',
      translations: { fr: 'Fraise', en: 'Strawberry', es: 'Fresa', de: 'Erdbeere' },
      shelfLife: 3,
      category: 'fruits'
    },
    {
      emoji: '🥝',
      translations: { fr: 'Kiwi', en: 'Kiwi', es: 'Kiwi', de: 'Kiwi' },
      shelfLife: 10,
      category: 'fruits'
    },
    {
      emoji: '🍑',
      translations: { fr: 'Cerise', en: 'Cherry', es: 'Cereza', de: 'Kirsche' },
      shelfLife: 5,
      category: 'fruits'
    },
    {
      emoji: '🍒',
      translations: { fr: 'Griotte', en: 'Sour Cherry', es: 'Cereza Agria', de: 'Sauerkirsche' },
      shelfLife: 5,
      category: 'fruits'
    },
    {
      emoji: '🥭',
      translations: { fr: 'Mangue', en: 'Mango', es: 'Mango', de: 'Mango' },
      shelfLife: 7,
      category: 'fruits'
    },
    {
      emoji: '🍍',
      translations: { fr: 'Ananas', en: 'Pineapple', es: 'Piña', de: 'Ananas' },
      shelfLife: 10,
      category: 'fruits'
    },
    {
      emoji: '🥥',
      translations: { fr: 'Noix de coco', en: 'Coconut', es: 'Coco', de: 'Kokosnuss' },
      shelfLife: 30,
      category: 'fruits'
    },
    {
      emoji: '🍋',
      translations: { fr: 'Citron', en: 'Lemon', es: 'Limón', de: 'Zitrone' },
      shelfLife: 14,
      category: 'fruits'
    },
    {
      emoji: '🍐',
      translations: { fr: 'Poire', en: 'Pear', es: 'Pera', de: 'Birne' },
      shelfLife: 10,
      category: 'fruits'
    }
  ],

  // VEGETABLES
  vegetables: [
    {
      emoji: '🥕',
      translations: { fr: 'Carotte', en: 'Carrot', es: 'Zanahoria', de: 'Karotte' },
      shelfLife: 21,
      category: 'vegetables'
    },
    {
      emoji: '🥒',
      translations: { fr: 'Concombre', en: 'Cucumber', es: 'Pepino', de: 'Gurke' },
      shelfLife: 7,
      category: 'vegetables'
    },
    {
      emoji: '🍅',
      translations: { fr: 'Tomate', en: 'Tomato', es: 'Tomate', de: 'Tomate' },
      shelfLife: 7,
      category: 'vegetables'
    },
    {
      emoji: '🥬',
      translations: { fr: 'Salade', en: 'Lettuce', es: 'Lechuga', de: 'Salat' },
      shelfLife: 5,
      category: 'vegetables'
    },
    {
      emoji: '🥔',
      translations: { fr: 'Pomme de terre', en: 'Potato', es: 'Papa', de: 'Kartoffel' },
      shelfLife: 30,
      category: 'vegetables'
    },
    {
      emoji: '🧅',
      translations: { fr: 'Oignon', en: 'Onion', es: 'Cebolla', de: 'Zwiebel' },
      shelfLife: 30,
      category: 'vegetables'
    },
    {
      emoji: '🥦',
      translations: { fr: 'Brocoli', en: 'Broccoli', es: 'Brócoli', de: 'Brokkoli' },
      shelfLife: 7,
      category: 'vegetables'
    },
    {
      emoji: '🌶️',
      translations: { fr: 'Piment', en: 'Chili', es: 'Chile', de: 'Chili' },
      shelfLife: 10,
      category: 'vegetables'
    },
    {
      emoji: '🫒',
      translations: { fr: 'Olive', en: 'Olive', es: 'Aceituna', de: 'Olive' },
      shelfLife: 60,
      category: 'vegetables'
    },
    {
      emoji: '🥑',
      translations: { fr: 'Avocat', en: 'Avocado', es: 'Aguacate', de: 'Avocado' },
      shelfLife: 5,
      category: 'vegetables'
    },
    {
      emoji: '🌽',
      translations: { fr: 'Maïs', en: 'Corn', es: 'Maíz', de: 'Mais' },
      shelfLife: 5,
      category: 'vegetables'
    },
    {
      emoji: '🍆',
      translations: { fr: 'Aubergine', en: 'Eggplant', es: 'Berenjena', de: 'Aubergine' },
      shelfLife: 7,
      category: 'vegetables'
    }
  ],

  // DAIRY
  dairy: [
    {
      emoji: '🥛',
      translations: { fr: 'Lait', en: 'Milk', es: 'Leche', de: 'Milch' },
      shelfLife: 7,
      category: 'dairy'
    },
    {
      emoji: '🧀',
      translations: { fr: 'Fromage', en: 'Cheese', es: 'Queso', de: 'Käse' },
      shelfLife: 14,
      category: 'dairy'
    },
    {
      emoji: '🧈',
      translations: { fr: 'Beurre', en: 'Butter', es: 'Mantequilla', de: 'Butter' },
      shelfLife: 30,
      category: 'dairy'
    },
    {
      emoji: '🥚',
      translations: { fr: 'Œuf', en: 'Egg', es: 'Huevo', de: 'Ei' },
      shelfLife: 21,
      category: 'dairy'
    },
    {
      emoji: '🍦',
      translations: { fr: 'Yaourt', en: 'Yogurt', es: 'Yogur', de: 'Joghurt' },
      shelfLife: 10,
      category: 'dairy'
    }
  ],

  // MEAT
  meat: [
    {
      emoji: '🥩',
      translations: { fr: 'Bœuf', en: 'Beef', es: 'Carne de res', de: 'Rindfleisch' },
      shelfLife: 3,
      category: 'meat'
    },
    {
      emoji: '🍗',
      translations: { fr: 'Poulet', en: 'Chicken', es: 'Pollo', de: 'Hähnchen' },
      shelfLife: 2,
      category: 'meat'
    },
    {
      emoji: '🥓',
      translations: { fr: 'Bacon', en: 'Bacon', es: 'Tocino', de: 'Speck' },
      shelfLife: 7,
      category: 'meat'
    },
    {
      emoji: '🌭',
      translations: { fr: 'Saucisse', en: 'Sausage', es: 'Salchicha', de: 'Wurst' },
      shelfLife: 14,
      category: 'meat'
    }
  ],

  // SEAFOOD
  seafood: [
    {
      emoji: '🐟',
      translations: { fr: 'Poisson', en: 'Fish', es: 'Pescado', de: 'Fisch' },
      shelfLife: 2,
      category: 'seafood'
    },
    {
      emoji: '🦐',
      translations: { fr: 'Crevette', en: 'Shrimp', es: 'Camarón', de: 'Garnele' },
      shelfLife: 2,
      category: 'seafood'
    },
    {
      emoji: '🦀',
      translations: { fr: 'Crabe', en: 'Crab', es: 'Cangrejo', de: 'Krabbe' },
      shelfLife: 2,
      category: 'seafood'
    },
    {
      emoji: '🐙',
      translations: { fr: 'Poulpe', en: 'Octopus', es: 'Pulpo', de: 'Oktopus' },
      shelfLife: 2,
      category: 'seafood'
    }
  ],

  // GRAINS
  grains: [
    {
      emoji: '🍞',
      translations: { fr: 'Pain', en: 'Bread', es: 'Pan', de: 'Brot' },
      shelfLife: 5,
      category: 'grains'
    },
    {
      emoji: '🍝',
      translations: { fr: 'Pâtes', en: 'Pasta', es: 'Pasta', de: 'Nudeln' },
      shelfLife: 365,
      category: 'grains'
    },
    {
      emoji: '🍚',
      translations: { fr: 'Riz', en: 'Rice', es: 'Arroz', de: 'Reis' },
      shelfLife: 365,
      category: 'grains'
    },
    {
      emoji: '🥖',
      translations: { fr: 'Baguette', en: 'Baguette', es: 'Baguette', de: 'Baguette' },
      shelfLife: 2,
      category: 'grains'
    },
    {
      emoji: '🥯',
      translations: { fr: 'Bagel', en: 'Bagel', es: 'Bagel', de: 'Bagel' },
      shelfLife: 5,
      category: 'grains'
    },
    {
      emoji: '🌾',
      translations: { fr: 'Blé', en: 'Wheat', es: 'Trigo', de: 'Weizen' },
      shelfLife: 180,
      category: 'grains'
    }
  ],

  // NUTS
  nuts: [
    {
      emoji: '🥜',
      translations: { fr: 'Arachide', en: 'Peanut', es: 'Cacahuete', de: 'Erdnuss' },
      shelfLife: 90,
      category: 'nuts'
    },
    {
      emoji: '🌰',
      translations: { fr: 'Châtaigne', en: 'Chestnut', es: 'Castaña', de: 'Kastanie' },
      shelfLife: 30,
      category: 'nuts'
    },
    {
      emoji: '🔩',
      translations: { fr: 'Noix', en: 'Walnut', es: 'Nuez', de: 'Walnuss' },
      shelfLife: 60,
      category: 'nuts'
    }
  ],

  // BEVERAGES
  beverages: [
    {
      emoji: '☕',
      translations: { fr: 'Café', en: 'Coffee', es: 'Café', de: 'Kaffee' },
      shelfLife: 365,
      category: 'beverages'
    },
    {
      emoji: '🫖',
      translations: { fr: 'Thé', en: 'Tea', es: 'Té', de: 'Tee' },
      shelfLife: 365,
      category: 'beverages'
    },
    {
      emoji: '🧃',
      translations: { fr: 'Jus', en: 'Juice', es: 'Jugo', de: 'Saft' },
      shelfLife: 30,
      category: 'beverages'
    },
    {
      emoji: '🍷',
      translations: { fr: 'Vin', en: 'Wine', es: 'Vino', de: 'Wein' },
      shelfLife: 1825,
      category: 'beverages'
    }
  ],

  // CONDIMENTS
  condiments: [
    {
      emoji: '🍯',
      translations: { fr: 'Miel', en: 'Honey', es: 'Miel', de: 'Honig' },
      shelfLife: 365,
      category: 'condiments'
    },
    {
      emoji: '🧂',
      translations: { fr: 'Sel', en: 'Salt', es: 'Sal', de: 'Salz' },
      shelfLife: 1825,
      category: 'condiments'
    },
    {
      emoji: '🌿',
      translations: { fr: 'Herbes', en: 'Herbs', es: 'Hierbas', de: 'Kräuter' },
      shelfLife: 180,
      category: 'condiments'
    },
    {
      emoji: '🧄',
      translations: { fr: 'Ail', en: 'Garlic', es: 'Ajo', de: 'Knoblauch' },
      shelfLife: 30,
      category: 'condiments'
    }
  ],

  // SNACKS
  snacks: [
    {
      emoji: '🍿',
      translations: { fr: 'Pop-corn', en: 'Popcorn', es: 'Palomitas', de: 'Popcorn' },
      shelfLife: 30,
      category: 'snacks'
    },
    {
      emoji: '🥨',
      translations: { fr: 'Bretzel', en: 'Pretzel', es: 'Pretzel', de: 'Brezel' },
      shelfLife: 60,
      category: 'snacks'
    },
    {
      emoji: '🍪',
      translations: { fr: 'Cookie', en: 'Cookie', es: 'Galleta', de: 'Keks' },
      shelfLife: 30,
      category: 'snacks'
    },
    {
      emoji: '🍫',
      translations: { fr: 'Chocolat', en: 'Chocolate', es: 'Chocolate', de: 'Schokolade' },
      shelfLife: 180,
      category: 'snacks'
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
