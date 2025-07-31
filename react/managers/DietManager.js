// managers/DietManager.js
class DietManager {
  constructor() {
    this.regimesActifs = new Set();
    this.allergiesActives = new Set();
    this.preferences = {
      caloriesMax: null,
      caloriesMin: null,
      proteinesMin: null,
      lipidesMax: null,
      glucidesMax: null,
      niveauDifficulte: null // easy, medium, hard
    };
  }

  ajouterRegime(regime) {
    // Vérification de compatibilité
    if (!this._verifierCompatibiliteRegime(regime)) {
      return false;
    }
    
    this.regimesActifs.add(regime);
    return true;
  }

  retirerRegime(regime) {
    this.regimesActifs.delete(regime);
  }

  ajouterAllergie(allergie) {
    this.allergiesActives.add(allergie);
    // Auto-ajout des régimes correspondants
    this._autoAjouterRegimesAllergie(allergie);
  }

  retirerAllergie(allergie) {
    this.allergiesActives.delete(allergie);
  }

  _verifierCompatibiliteRegime(nouveauRegime) {
    // Vérification des incompatibilités entre régimes
    const incompatibilites = {
      'vegetarian': ['pescetarian'],
      'vegan': ['vegetarian', 'pescetarian'],
      'ketogenic': []
    };

    if (incompatibilites[nouveauRegime.value]) {
      for (const regime of this.regimesActifs) {
        if (incompatibilites[nouveauRegime.value].includes(regime.value)) {
          return false;
        }
      }
    }

    return true;
  }

  _autoAjouterRegimesAllergie(allergie) {
    // Correspondances automatiques allergies -> régimes
    const correspondances = {
      'dairy': 'dairy-free',
      'gluten': 'gluten-free',
      'tree nut': 'tree-nut-free'
    };

    // Cette logique nécessiterait l'importation des enums
    // Pour simplifier, on laisse cette méthode comme placeholder
  }

  definirPreferencesNutritionnelles(preferences) {
    Object.keys(preferences).forEach(key => {
      if (this.preferences.hasOwnProperty(key)) {
        this.preferences[key] = preferences[key];
      }
    });
  }

  obtenirRegimesAPI() {
    return Array.from(this.regimesActifs).map(regime => regime.value);
  }

  obtenirAllergiesAPI() {
    return Array.from(this.allergiesActives).map(allergie => allergie.value);
  }

  obtenirResumePreferences() {
    let resume = "🍽️ VOS PRÉFÉRENCES ALIMENTAIRES\n";
    resume += "=".repeat(40) + "\n\n";
    
    if (this.regimesActifs.size > 0) {
      resume += "📋 RÉGIMES ALIMENTAIRES:\n";
      this.regimesActifs.forEach(regime => {
        resume += `   ${regime.emoji} ${regime.nom} - ${regime.description}\n`;
      });
      resume += "\n";
    }
    
    if (this.allergiesActives.size > 0) {
      resume += "⚠️ ALLERGIES ET INTOLÉRANCES:\n";
      this.allergiesActives.forEach(allergie => {
        resume += `   ${allergie.emoji} ${allergie.nom}\n`;
      });
      resume += "\n";
    }

    // Préférences nutritionnelles
    const prefsDefinies = Object.entries(this.preferences).filter(([_, value]) => value !== null);
    if (prefsDefinies.length > 0) {
      resume += "📊 PRÉFÉRENCES NUTRITIONNELLES:\n";
      prefsDefinies.forEach(([key, value]) => {
        const labels = {
          caloriesMin: "🔥 Calories min",
          caloriesMax: "🔥 Calories max", 
          proteinesMin: "💪 Protéines min",
          lipidesMax: "🥑 Lipides max",
          glucidesMax: "🍞 Glucides max",
          niveauDifficulte: "👨‍🍳 Difficulté"
        };
        resume += `   ${labels[key]}: ${value}\n`;
      });
      resume += "\n";
    }
    
    if (this.regimesActifs.size === 0 && this.allergiesActives.size === 0 && prefsDefinies.length === 0) {
      resume += "Aucune préférence définie.\n";
      resume += "Configurez vos préférences pour des suggestions personnalisées !\n";
    }
    
    return resume;
  }

  obtenirParametresRechercheAPI() {
    const params = {};
    
    // Régimes alimentaires
    if (this.regimesActifs.size > 0) {
      params.diet = this.obtenirRegimesAPI().join(',');
    }
    
    // Allergies (intolerances dans l'API Spoonacular)
    if (this.allergiesActives.size > 0) {
      params.intolerances = this.obtenirAllergiesAPI().join(',');
    }
    
    // Préférences nutritionnelles
    if (this.preferences.caloriesMin) params.minCalories = this.preferences.caloriesMin;
    if (this.preferences.caloriesMax) params.maxCalories = this.preferences.caloriesMax;
    if (this.preferences.proteinesMin) params.minProtein = this.preferences.proteinesMin;
    if (this.preferences.lipidesMax) params.maxFat = this.preferences.lipidesMax;
    if (this.preferences.glucidesMax) params.maxCarbs = this.preferences.glucidesMax;
    
    return params;
  }

  validerAlimentCompatible(nomAliment) {
    const nomLower = nomAliment.toLowerCase();
    
    // Vérification des allergies
    for (const allergie of this.allergiesActives) {
      if (this._alimentContientAllergene(nomLower, allergie)) {
        return { compatible: false, raison: `Contient ${allergie.nom} (allergie déclarée)` };
      }
    }
    
    // Vérification des régimes
    for (const regime of this.regimesActifs) {
      if (!this._alimentCompatibleRegime(nomLower, regime)) {
        return { compatible: false, raison: `Non compatible avec le régime ${regime.nom}` };
      }
    }
    
    return { compatible: true, raison: "" };
  }

  _alimentContientAllergene(nomAliment, allergie) {
    const allergenesMots = {
      'gluten': ['blé', 'farine', 'pain', 'pâtes', 'orge', 'seigle'],
      'dairy': ['lait', 'fromage', 'yaourt', 'beurre', 'crème'],
      'egg': ['œuf', 'oeuf'],
      'tree nut': ['noix', 'amande', 'noisette', 'pistache', 'cajou'],
      'seafood': ['poisson', 'saumon', 'thon', 'crevette', 'homard'],
      'soy': ['soja', 'tofu']
    };
    
    if (allergenesMots[allergie.value]) {
      return allergenesMots[allergie.value].some(mot => nomAliment.includes(mot));
    }
    
    return false;
  }

  _alimentCompatibleRegime(nomAliment, regime) {
    const incompatibles = {
      'vegetarian': ['viande', 'porc', 'bœuf', 'agneau', 'poisson', 'thon', 'saumon'],
      'vegan': ['viande', 'porc', 'bœuf', 'agneau', 'poisson', 'lait', 'fromage', 'œuf', 'miel'],
      'pescetarian': ['viande', 'porc', 'bœuf', 'agneau', 'poulet'],
      'gluten-free': ['blé', 'farine', 'pain', 'pâtes', 'orge', 'seigle'],
      'dairy-free': ['lait', 'fromage', 'yaourt', 'beurre', 'crème']
    };
    
    if (incompatibles[regime.value]) {
      return !incompatibles[regime.value].some(mot => nomAliment.includes(mot));
    }
    
    return true;
  }

  obtenirSuggestionsAliments(regime = null) {
    const suggestions = {
      'vegetarian': ['Tofu', 'Lentilles', 'Quinoa', 'Épinards', 'Avocat', 'Noix', 'Fromage'],
      'vegan': ['Tofu', 'Lentilles', 'Quinoa', 'Épinards', 'Avocat', 'Amandes', 'Chou-fleur'],
      'ketogenic': ['Avocat', 'Saumon', 'Œufs', 'Brocoli', 'Fromage', 'Huile d\'olive', 'Noix'],
      'paleo': ['Viande', 'Poisson', 'Légumes', 'Fruits', 'Noix', 'Graines', 'Huile de coco']
    };
    
    if (regime && suggestions[regime.value]) {
      return suggestions[regime.value];
    } else if (this.regimesActifs.size > 0) {
      // Retourne les suggestions du premier régime actif
      const premierRegime = Array.from(this.regimesActifs)[0];
      return suggestions[premierRegime.value] || [];
    } else {
      return ['Légumes variés', 'Fruits de saison', 'Protéines', 'Céréales complètes'];
    }
  }

  resetPreferences() {
    this.regimesActifs.clear();
    this.allergiesActives.clear();
    Object.keys(this.preferences).forEach(key => {
      this.preferences[key] = null;
    });
  }

  // Sauvegarde des préférences
  sauvegarderPreferences() {
    try {
      const donnees = {
        regimes: Array.from(this.regimesActifs),
        allergies: Array.from(this.allergiesActives),
        preferences: this.preferences,
        dateSauvegarde: new Date().toISOString()
      };
      localStorage.setItem('diet_preferences', JSON.stringify(donnees));
      return { success: true, message: "Préférences sauvegardées" };
    } catch (error) {
      return { success: false, message: `Erreur sauvegarde: ${error.message}` };
    }
  }

  // Chargement des préférences
  chargerPreferences() {
    try {
      const donnees = localStorage.getItem('diet_preferences');
      if (!donnees) return { success: false, message: "Aucune préférence sauvegardée" };

      const parsed = JSON.parse(donnees);
      this.regimesActifs = new Set(parsed.regimes || []);
      this.allergiesActives = new Set(parsed.allergies || []);
      this.preferences = { ...this.preferences, ...parsed.preferences };
      
      return { success: true, message: "Préférences chargées" };
    } catch (error) {
      return { success: false, message: `Erreur chargement: ${error.message}` };
    }
  }
}

export default DietManager;
