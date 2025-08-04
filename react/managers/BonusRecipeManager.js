// managers/BonusRecipeManager.js
import bonusRecipesData from '../data/bonusRecipes.json';

class BonusRecipeManager {
  constructor() {
    this.bonusRecipes = bonusRecipesData.bonusRecipes || [];
    this.loadCustomRecipes();
  }

  // Charger les recettes personnalisées depuis le localStorage
  loadCustomRecipes() {
    try {
      const customRecipes = JSON.parse(localStorage.getItem('customBonusRecipes') || '[]');
      this.bonusRecipes = [...bonusRecipesData.bonusRecipes, ...customRecipes];
    } catch (error) {
      console.error('Erreur lors du chargement des recettes personnalisées:', error);
    }
  }

  // Sauvegarder les recettes personnalisées
  saveCustomRecipes() {
    try {
      const customRecipes = this.bonusRecipes.filter(recipe => recipe.isCustom);
      localStorage.setItem('customBonusRecipes', JSON.stringify(customRecipes));
      return { success: true, message: 'Recettes sauvegardées avec succès' };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      return { success: false, message: 'Erreur lors de la sauvegarde' };
    }
  }

  // Obtenir toutes les recettes bonus
  getAllBonusRecipes() {
    return this.bonusRecipes;
  }

  // Rechercher des recettes bonus par ingrédients
  searchByIngredients(availableIngredients) {
    const results = [];
    
    this.bonusRecipes.forEach(recipe => {
      const recipeIngredients = recipe.ingredients.map(ing => ing.toLowerCase());
      const matchingIngredients = [];
      const missingIngredients = [];
      
      recipeIngredients.forEach(recipeIng => {
        const found = availableIngredients.some(availableIng => 
          availableIng.toLowerCase().includes(recipeIng) || 
          recipeIng.includes(availableIng.toLowerCase())
        );
        
        if (found) {
          matchingIngredients.push(recipeIng);
        } else {
          missingIngredients.push(recipeIng);
        }
      });

      if (matchingIngredients.length > 0) {
        results.push({
          ...recipe,
          usedIngredientCount: matchingIngredients.length,
          missedIngredientCount: missingIngredients.length,
          usedIngredients: matchingIngredients.map(ing => ({ name: ing })),
          missedIngredients: missingIngredients.map(ing => ({ name: ing })),
          matchPercentage: (matchingIngredients.length / recipeIngredients.length) * 100,
          isBonus: true
        });
      }
    });

    // Trier par pourcentage de correspondance
    return results.sort((a, b) => b.matchPercentage - a.matchPercentage);
  }

  // Rechercher des recettes bonus par nom
  searchByName(query) {
    const searchTerm = query.toLowerCase();
    
    return this.bonusRecipes.filter(recipe => 
      recipe.title.toLowerCase().includes(searchTerm) ||
      recipe.summary.toLowerCase().includes(searchTerm) ||
      recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm)) ||
      recipe.cuisines.some(cuisine => cuisine.toLowerCase().includes(searchTerm)) ||
      recipe.category.toLowerCase().includes(searchTerm)
    ).map(recipe => ({
      ...recipe,
      isBonus: true
    }));
  }

  // Obtenir une recette bonus par ID
  getRecipeById(id) {
    const recipe = this.bonusRecipes.find(recipe => recipe.id === id);
    if (recipe) {
      return {
        success: true,
        details: { ...recipe, isBonus: true }
      };
    }
    return {
      success: false,
      message: 'Recette bonus introuvable'
    };
  }

  // Ajouter une nouvelle recette personnalisée
  addCustomRecipe(recipeData) {
    try {
      const newRecipe = {
        ...recipeData,
        id: `custom_${Date.now()}`,
        isBonus: true,
        isCustom: true,
        author: 'Vous',
        sourceName: 'Mes Recettes',
        creditsText: 'Recette personnalisée'
      };

      this.bonusRecipes.push(newRecipe);
      this.saveCustomRecipes();

      return {
        success: true,
        message: 'Recette ajoutée avec succès',
        recipe: newRecipe
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de l\'ajout de la recette'
      };
    }
  }

  // Supprimer une recette personnalisée
  deleteCustomRecipe(id) {
    const recipeIndex = this.bonusRecipes.findIndex(recipe => 
      recipe.id === id && recipe.isCustom
    );

    if (recipeIndex !== -1) {
      this.bonusRecipes.splice(recipeIndex, 1);
      this.saveCustomRecipes();
      return {
        success: true,
        message: 'Recette supprimée avec succès'
      };
    }

    return {
      success: false,
      message: 'Recette introuvable ou non modifiable'
    };
  }

  // Modifier une recette personnalisée
  updateCustomRecipe(id, updatedData) {
    const recipeIndex = this.bonusRecipes.findIndex(recipe => 
      recipe.id === id && recipe.isCustom
    );

    if (recipeIndex !== -1) {
      this.bonusRecipes[recipeIndex] = {
        ...this.bonusRecipes[recipeIndex],
        ...updatedData,
        isBonus: true,
        isCustom: true
      };
      
      this.saveCustomRecipes();
      return {
        success: true,
        message: 'Recette mise à jour avec succès',
        recipe: this.bonusRecipes[recipeIndex]
      };
    }

    return {
      success: false,
      message: 'Recette introuvable ou non modifiable'
    };
  }

  // Obtenir des statistiques sur les recettes bonus
  getStats() {
    const totalRecipes = this.bonusRecipes.length;
    const customRecipes = this.bonusRecipes.filter(r => r.isCustom).length;
    const defaultRecipes = totalRecipes - customRecipes;
    
    const categories = {};
    const cuisines = {};
    const difficulties = {};

    this.bonusRecipes.forEach(recipe => {
      // Catégories
      if (recipe.category) {
        categories[recipe.category] = (categories[recipe.category] || 0) + 1;
      }
      
      // Cuisines
      recipe.cuisines.forEach(cuisine => {
        cuisines[cuisine] = (cuisines[cuisine] || 0) + 1;
      });
      
      // Difficultés
      if (recipe.difficulty) {
        difficulties[recipe.difficulty] = (difficulties[recipe.difficulty] || 0) + 1;
      }
    });

    return {
      totalRecipes,
      customRecipes,
      defaultRecipes,
      categories,
      cuisines,
      difficulties,
      averageTime: Math.round(
        this.bonusRecipes.reduce((sum, r) => sum + (r.readyInMinutes || 0), 0) / totalRecipes
      )
    };
  }

  // Exporter toutes les recettes personnalisées
  exportCustomRecipes() {
    const customRecipes = this.bonusRecipes.filter(recipe => recipe.isCustom);
    const dataStr = JSON.stringify({ bonusRecipes: customRecipes }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mes_recettes_personnalisees.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  // Importer des recettes depuis un fichier JSON
  async importCustomRecipes(file) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (data.bonusRecipes && Array.isArray(data.bonusRecipes)) {
        const importedRecipes = data.bonusRecipes.map(recipe => ({
          ...recipe,
          id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          isBonus: true,
          isCustom: true
        }));
        
        this.bonusRecipes.push(...importedRecipes);
        this.saveCustomRecipes();
        
        return {
          success: true,
          message: `${importedRecipes.length} recette(s) importée(s) avec succès`
        };
      } else {
        return {
          success: false,
          message: 'Format de fichier invalide'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de l\'importation du fichier'
      };
    }
  }
}

export default BonusRecipeManager;