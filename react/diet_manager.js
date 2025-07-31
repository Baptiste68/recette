/**
 * Module de gestion des régimes alimentaires et préférences nutritionnelles
 */

// RegimeAlimentaire enum equivalent
export const RegimeAlimentaire = {
  VEGETARIEN: {
    apiValue: "vegetarian",
    emoji: "🥬",
    nomAffichage: "Végétarien",
    description: "Pas de viande ni poisson"
  },
  VEGAN: {
    apiValue: "vegan",
    emoji: "🌱",
    nomAffichage: "Végan",
    description: "Aucun produit animal"
  },
  SANS_GLUTEN: {
    apiValue: "gluten-free",
    emoji: "🌾",
    nomAffichage: "Sans gluten",
    description: "Sans blé, orge, seigle"
  },
  CETOGENE: {
    apiValue: "ketogenic",
    emoji: "🥑",
    nomAffichage: "Cétogène",
    description: "Très faible en glucides"
  },
  PALEO: {
    apiValue: "paleo",
    emoji: "🦴",
    nomAffichage: "Paléo",
    description: "Aliments non transformés"
  },
  SANS_LACTOSE: {
    apiValue: "dairy-free",
    emoji: "🥛",
    nomAffichage: "Sans lactose",
    description: "Sans produits laitiers"
  },
  SANS_NOIX: {
    apiValue: "tree-nut-free",
    emoji: "🥜",
    nomAffichage: "Sans noix",
    description: "Sans fruits à coque"
  },
  PESCETARIEN: {
    apiValue: "pescetarian",
    emoji: "🐟",
    nomAffichage: "Pescétarien",
    description: "Végétarien + poisson"
  },
  MEDITERANNEEN: {
    apiValue: "mediterranean",
    emoji: "🫒",
    nomAffichage: "Méditerranéen",
    description: "Riche en légumes et huile d'olive"
  },
  SANS_SUC_AJOUTE: {
    apiValue: "low-sugar",
    emoji: "🍯",
    nomAffichage: "Sans sucre ajouté",
    description: "Faible en sucres ajoutés"
  }
};

// Allergie enum equivalent
export const Allergie = {
  GLUTEN: {
    apiValue: "gluten",
    emoji: "🌾",
    nomAffichage: "Gluten"
  },
  LACTOSE: {
    apiValue: "dairy",
    emoji: "🥛",
    nomAffichage: "Lactose/Produits laitiers"
  },
  OEUFS: {
    apiValue: "egg",
    emoji: "🥚",
    nomAffichage: "Œufs"
  },
  NOIX: {
    apiValue: "tree nut",
    emoji: "🥜",
    nomAffichage: "Noix et fruits à coque"
  },
  ARACHIDES: {
    apiValue: "peanut",
    emoji: "🥜",
    nomAffichage: "Arachides"
  },
  POISSON: {
    apiValue: "seafood",
    emoji: "🐟",
    nomAffichage: "Poisson et fruits de mer"
  },
  SOJA: {
    apiValue: "soy",
    emoji: "🫘",
    nomAffichage: "Soja"
  },
  SESAME: {
    apiValue: "sesame",
    emoji: "🫘",
    nomAffichage: "Sésame"
  }
};

export class DietManager {
  constructor() {
    this.regimesActifs = new Set();
    this.allergiesActives = new Set();
    this.preferences = {
      caloriesMax: null,
      caloriesMin: null,
      proteinesMin: null,
      lipidesMax: null,
      glucidesMax: null,
      niveauDifficulte: null  // easy, medium, hard
    };
  }

  /**
   * Ajoute un régime alimentaire
   */
  ajouterRegime(regime) {
    // Vérification de compatibilité
    if (!this._verifierCompatibiliteRegime(regime)) {
      return false;
    }
    
    this.regimesActifs.add(regime);
    return true;
  }

  /**
   * Retire un régime alimentaire
   */
  retirerRegime(regime) {
    this.regimesActifs.delete(regime);
  }

  /**
   * Ajoute une allergie
   */
  ajouterAllergie(allergie) {
    this.allergiesActives.add(allergie);
    // Auto-ajout des régimes correspondants
    this._autoAjouterRegimesAllergie(allergie);
  }

  /**
   * Retire une allergie
   */
  retirerAllergie(allergie) {
    this.allergiesActives.delete(allergie);
  }

  /**
   * Vérifie si un régime est compatible avec les régimes existants
   */
  _verifierCompatibiliteRegime(nouveauRegime) {
    const incompatibilites = {
      [RegimeAlimentaire.VEGETARIEN]: [RegimeAlimentaire.PESCETARIEN],
      [RegimeAlimentaire.VEGAN]: [RegimeAlimentaire.VEGETARIEN, RegimeAlimentaire.PESCETARIEN],
      [RegimeAlimentaire.CETOGENE]: [RegimeAlimentaire.MEDITERANNEEN],
    };
    
    if (incompatibilites[nouveauRegime]) {
      for (const regimeExistant of this.regimesActifs) {
        if (incompatibilites[nouveauRegime].includes(regimeExistant)) {
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * Ajoute automatiquement les régimes correspondant aux allergies
   */
  _autoAjouterRegimesAllergie(allergie) {
    const correspondances = {
      [Allergie.LACTOSE]: RegimeAlimentaire.SANS_LACTOSE,
      [Allergie.GLUTEN]: RegimeAlimentaire.SANS_GLUTEN,
      [Allergie.NOIX]: RegimeAlimentaire.SANS_NOIX,
      [Allergie.ARACHIDES]: RegimeAlimentaire.SANS_NOIX,
    };
    
    if (correspondances[allergie]) {
      this.regimesActifs.add(correspondances[allergie]);
    }
  }

  /**
   * Définit les préférences nutritionnelles
   */
  definirPreferencesNutritionnelles(kwargs) {
    Object.keys(kwargs).forEach(key => {
      if (this.preferences.hasOwnProperty(key)) {
        this.preferences[key] = kwargs[key];
      }
    });
  }

  /**
   * Retourne les valeurs API des régimes actifs
   */
  obtenirRegimesApi() {
    return Array.from(this.regimesActifs).map(regime => regime.apiValue);
  }

  /**
   * Retourne les valeurs API des allergies actives
   */
  obtenirAllergiesApi() {
    return Array.from(this.allergiesActives).map(allergie => allergie.apiValue);
  }

  /**
   * Retourne un résumé des préférences alimentaires
   */
  obtenirResumePreferences() {
    let resume = "🍽️ VOS PRÉFÉRENCES ALIMENTAIRES\n";
    resume += "=" .repeat(40) + "\n\n";
    
    if (this.regimesActifs.size > 0) {
      resume += "📋 RÉGIMES ALIMENTAIRES:\n";
      const regimesSorted = Array.from(this.regimesActifs).sort((a, b) => 
        a.nomAffichage.localeCompare(b.nomAffichage)
      );
      regimesSorted.forEach(regime => {
        resume += `   ${regime.emoji} ${regime.nomAffichage} - ${regime.description}\n`;
      });
      resume += "\n";
    }
    
    if (this.allergiesActives.size > 0) {
      resume += "⚠️ ALLERGIES ET INTOLÉRANCES:\n";
      const allergiesSorted = Array.from(this.allergiesActives).sort((a, b) => 
        a.nomAffichage.localeCompare(b.nomAffichage)
      );
      allergiesSorted.forEach(allergie => {
        resume += `   ${allergie.emoji} ${allergie.nomAffichage}\n`;
      });
      resume += "\n";
    }
    
    // Préférences nutritionnelles
    const prefsDefinies = Object.fromEntries(
      Object.entries(this.preferences).filter(([k, v]) => v !== null)
    );
    
    if (Object.keys(prefsDefinies).length > 0) {
      resume += "📊 PRÉFÉRENCES NUTRITIONNELLES:\n";
      if (prefsDefinies.caloriesMin || prefsDefinies.caloriesMax) {
        const calMin = prefsDefinies.caloriesMin || 'Non défini';
        const calMax = prefsDefinies.caloriesMax || 'Non défini';
        resume += `   🔥 Calories: ${calMin} - ${calMax} kcal\n`;
      }
      if (prefsDefinies.proteinesMin) {
        resume += `   💪 Protéines min: ${prefsDefinies.proteinesMin}g\n`;
      }
      if (prefsDefinies.lipidesMax) {
        resume += `   🥑 Lipides max: ${prefsDefinies.lipidesMax}g\n`;
      }
      if (prefsDefinies.glucidesMax) {
        resume += `   🍞 Glucides max: ${prefsDefinies.glucidesMax}g\n`;
      }
      if (prefsDefinies.niveauDifficulte) {
        resume += `   👨‍🍳 Difficulté: ${prefsDefinies.niveauDifficulte}\n`;
      }
      resume += "\n";
    }
    
    if (this.regimesActifs.size === 0 && this.allergiesActives.size === 0 && Object.keys(prefsDefinies).length === 0) {
      resume += "Aucune préférence définie.\n";
      resume += "Configurez vos préférences pour des suggestions personnalisées !\n";
    }
    
    return resume;
  }

  /**
   * Retourne les paramètres pour les requêtes API
   */
  obtenirParametresRechercheApi() {
    const params = {};
    
    // Régimes alimentaires
    if (this.regimesActifs.size > 0) {
      params.diet = this.obtenirRegimesApi().join(',');
    }
    
    // Allergies (intolerances dans l'API Spoonacular)
    if (this.allergiesActives.size > 0) {
      params.intolerances = this.obtenirAllergiesApi().join(',');
    }
    
    // Préférences nutritionnelles
    if (this.preferences.caloriesMin) {
      params.minCalories = this.preferences.caloriesMin;
    }
    if (this.preferences.caloriesMax) {
      params.maxCalories = this.preferences.caloriesMax;
    }
    if (this.preferences.proteinesMin) {
      params.minProtein = this.preferences.proteinesMin;
    }
    if (this.preferences.lipidesMax) {
      params.maxFat = this.preferences.lipidesMax;
    }
    if (this.preferences.glucidesMax) {
      params.maxCarbs = this.preferences.glucidesMax;
    }
    
    return params;
  }

  /**
   * Vérifie si un aliment est compatible avec les régimes et allergies
   * Returns: [compatible, raison_si_incompatible]
   */
  validerAlimentCompatible(nomAliment) {
    const nomLower = nomAliment.toLowerCase();
    
    // Vérification des allergies
    for (const allergie of this.allergiesActives) {
      if (this._alimentContientAllergene(nomLower, allergie)) {
        return [false, `Contient ${allergie.nomAffichage} (allergie déclarée)`];
      }
    }
    
    // Vérification des régimes
    for (const regime of this.regimesActifs) {
      if (!this._alimentCompatibleRegime(nomLower, regime)) {
        return [false, `Non compatible avec le régime ${regime.nomAffichage}`];
      }
    }
    
    return [true, ""];
  }

  /**
   * Vérifie si un aliment contient un allergène
   */
  _alimentContientAllergene(nomAliment, allergie) {
    const allergenesMoCles = {
      [Allergie.GLUTEN]: ['blé', 'farine', 'pain', 'pâtes', 'orge', 'seigle'],
      [Allergie.LACTOSE]: ['lait', 'fromage', 'yaourt', 'beurre', 'crème'],
      [Allergie.OEUFS]: ['œuf', 'oeuf'],
      [Allergie.NOIX]: ['noix', 'amande', 'noisette', 'pistache', 'cajou'],
      [Allergie.ARACHIDES]: ['arachide', 'cacahuète'],
      [Allergie.POISSON]: ['poisson', 'saumon', 'thon', 'crevette', 'homard'],
      [Allergie.SOJA]: ['soja', 'tofu'],
      [Allergie.SESAME]: ['sésame', 'tahini']
    };
    
    if (allergenesMoCles[allergie]) {
      return allergenesMoCles[allergie].some(mot => nomAliment.includes(mot));
    }
    
    return false;
  }

  /**
   * Vérifie si un aliment est compatible avec un régime
   */
  _alimentCompatibleRegime(nomAliment, regime) {
    // Aliments incompatibles par régime
    const incompatibles = {
      [RegimeAlimentaire.VEGETARIEN]: ['viande', 'porc', 'bœuf', 'agneau', 'poisson', 'thon', 'saumon'],
      [RegimeAlimentaire.VEGAN]: ['viande', 'porc', 'bœuf', 'agneau', 'poisson', 'lait', 'fromage', 'œuf', 'miel'],
      [RegimeAlimentaire.PESCETARIEN]: ['viande', 'porc', 'bœuf', 'agneau', 'poulet'],
      [RegimeAlimentaire.SANS_GLUTEN]: ['blé', 'farine', 'pain', 'pâtes', 'orge', 'seigle'],
      [RegimeAlimentaire.SANS_LACTOSE]: ['lait', 'fromage', 'yaourt', 'beurre', 'crème'],
    };
    
    if (incompatibles[regime]) {
      return !incompatibles[regime].some(mot => nomAliment.includes(mot));
    }
    
    return true;
  }

  /**
   * Retourne des suggestions d'aliments selon les préférences
   */
  obtenirSuggestionsAliments(regime = null) {
    const suggestions = {
      [RegimeAlimentaire.VEGETARIEN]: [
        'Tofu', 'Lentilles', 'Quinoa', 'Épinards', 'Avocat', 'Noix', 'Fromage'
      ],
      [RegimeAlimentaire.VEGAN]: [
        'Tofu', 'Lentilles', 'Quinoa', 'Épinards', 'Avocat', 'Amandes', 'Chou-fleur'
      ],
      [RegimeAlimentaire.CETOGENE]: [
        'Avocat', 'Saumon', 'Œufs', 'Brocoli', 'Fromage', 'Huile d\'olive', 'Noix'
      ],
      [RegimeAlimentaire.MEDITERANNEEN]: [
        'Tomates', 'Huile d\'olive', 'Poisson', 'Légumes verts', 'Herbes fraîches'
      ],
      [RegimeAlimentaire.PALEO]: [
        'Viande', 'Poisson', 'Légumes', 'Fruits', 'Noix', 'Graines', 'Huile de coco'
      ]
    };
    
    if (regime && suggestions[regime]) {
      return suggestions[regime];
    } else if (this.regimesActifs.size > 0) {
      // Retourne les suggestions du premier régime actif
      const premierRegime = this.regimesActifs.values().next().value;
      return suggestions[premierRegime] || [];
    } else {
      return ['Légumes variés', 'Fruits de saison', 'Protéines', 'Céréales complètes'];
    }
  }

  /**
   * Remet à zéro toutes les préférences
   */
  resetPreferences() {
    this.regimesActifs.clear();
    this.allergiesActives.clear();
    Object.keys(this.preferences).forEach(key => {
      this.preferences[key] = null;
    });
  }

  /**
   * Affiche le résumé des préférences alimentaires
   */
  afficherResumePreferences(window) {
    const resume = this.obtenirResumePreferences();
    return window.infoDialog("Vos préférences", resume);
  }
}