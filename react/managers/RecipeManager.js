// managers/RecipeManager.js
class RecipeManager {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = "https://api.spoonacular.com";
    this.regimesActifs = new Set();
  }

  ajouterRegime(regime) {
    this.regimesActifs.add(regime);
  }

  retirerRegime(regime) {
    this.regimesActifs.delete(regime);
  }

  obtenirRegimesActifs() {
    return Array.from(this.regimesActifs).map(regime => regime.value);
  }

  optimiserUtilisationAliments(inventaire, recettes) {
    // Calcul du score de priorité pour chaque aliment
    const scoresAliments = {};
    const maintenant = new Date();
    
    Object.entries(inventaire).forEach(([nom, details]) => {
      let score = details.quantite; // Score de base = quantité
      
      // Bonus pour les aliments qui expirent bientôt
      if (details.expiration !== "Non specifiee") {
        try {
          const dateExp = new Date(details.expiration);
          const joursRestants = Math.ceil((dateExp - maintenant) / (1000 * 60 * 60 * 24));
          
          if (joursRestants < 0) {
            score += 100; // Très haute priorité pour les expirés
          } else if (joursRestants <= 3) {
            score += 50;  // Haute priorité
          } else if (joursRestants <= 7) {
            score += 20;  // Priorité moyenne
          }
        } catch (e) {
          // Ignorer les dates invalides
        }
      }
      
      scoresAliments[nom.toLowerCase()] = score;
    });

    // Calcul du score pour chaque recette
    recettes.forEach(recette => {
      let scoreRecette = 0;
      const ingredientsUtilises = recette.usedIngredients || [];
      
      ingredientsUtilises.forEach(ingredient => {
        const nomIngredient = ingredient.name.toLowerCase();
        // Recherche d'aliments correspondants dans l'inventaire
        Object.entries(scoresAliments).forEach(([nomInventaire, scoreAliment]) => {
          if (nomIngredient.includes(nomInventaire) || nomInventaire.includes(nomIngredient)) {
            scoreRecette += scoreAliment;
          }
        });
      });
      
      // Bonus pour moins d'ingrédients manqués
      const ingredientsManques = recette.missedIngredientCount || 0;
      scoreRecette += Math.max(0, 20 - ingredientsManques * 2);
      
      recette.scoreOptimisation = scoreRecette;
    });

    // Tri par score décroissant
    return recettes.sort((a, b) => (b.scoreOptimisation || 0) - (a.scoreOptimisation || 0));
  }

  async rechercherRecettesParIngredients(ingredients, nombre = 8) {
    if (!ingredients || ingredients.length === 0) {
      return { success: false, message: "Aucun ingrédient fourni", recettes: [] };
    }

    try {
      const ingredientsStr = ingredients.join(",");
      const url = `${this.baseUrl}/recipes/findByIngredients`;
      
      const params = new URLSearchParams({
        ingredients: ingredientsStr,
        number: nombre.toString(),
        apiKey: this.apiKey,
        ranking: '2', // Maximise les ingrédients utilisés
        ignorePantry: 'true'
      });

      const response = await fetch(`${url}?${params}`);
      
      if (response.ok) {
        const recettes = await response.json();
        
        if (!recettes || recettes.length === 0) {
          return { success: false, message: "Aucune recette trouvée avec ces ingrédients", recettes: [] };
        }

        // Filtrage par régimes alimentaires si spécifiés
        let recettesFiltrees = recettes;
        if (this.regimesActifs.size > 0) {
          recettesFiltrees = await this.filtrerParRegimes(recettes);
        }

        return { success: true, message: "Recettes trouvées avec succès", recettes: recettesFiltrees };
      } else if (response.status === 402) {
        return { success: false, message: "Limite d'API atteinte. Réessayez plus tard.", recettes: [] };
      } else {
        return { success: false, message: `Erreur API: ${response.status}`, recettes: [] };
      }
    } catch (error) {
      return { success: false, message: "Erreur de connexion. Vérifiez votre internet.", recettes: [] };
    }
  }

  async filtrerParRegimes(recettes) {
    // Pour une implémentation complète, il faudrait faire des appels à l'API
    // /recipes/{id}/information pour chaque recette pour vérifier les régimes
    // Pour l'instant, on retourne les recettes telles quelles
    return recettes;
  }

  async obtenirDetailsRecette(recipeId) {
    try {
      const url = `${this.baseUrl}/recipes/${recipeId}/information`;
      const params = new URLSearchParams({
        apiKey: this.apiKey,
        includeNutrition: 'false'
      });

      const response = await fetch(`${url}?${params}`);
      
      if (response.ok) {
        const details = await response.json();
        return { success: true, message: "Détails récupérés avec succès", details };
      } else if (response.status === 402) {
        return { success: false, message: "Limite d'API atteinte", details: {} };
      } else {
        return { success: false, message: `Erreur API: ${response.status}`, details: {} };
      }
    } catch (error) {
      return { success: false, message: "Erreur de connexion", details: {} };
    }
  }

  formaterRecettes(recettesBrutes, inventaire) {
    if (!recettesBrutes || recettesBrutes.length === 0) {
      return "Aucune recette trouvée avec vos ingrédients.\nEssayez d'ajouter d'autres aliments !";
    }

    // Optimisation de l'ordre des recettes
    const recettesOptimisees = this.optimiserUtilisationAliments(inventaire, recettesBrutes);
    
    // En-tête avec information sur les régimes
    let resultat = "🍽️ RECETTES SUGGÉRÉES (OPTIMISÉES) 🍽️\n";
    if (this.regimesActifs.size > 0) {
      const regimesStr = Array.from(this.regimesActifs).map(r => r.nom).join(", ");
      resultat += `📋 Régimes actifs: ${regimesStr}\n`;
    }
    resultat += "=".repeat(50) + "\n\n";
    
    recettesOptimisees.forEach((recette, index) => {
      const titre = recette.title;
      const ingredientsManques = recette.missedIngredientCount || 0;
      const ingredientsUtilises = recette.usedIngredientCount || 0;
      const scoreOptimisation = recette.scoreOptimisation || 0;
      
      // Icône et score de compatibilité
      let icone, score;
      if (ingredientsManques === 0) {
        icone = "⭐";
        score = "PARFAIT MATCH !";
      } else if (ingredientsManques <= 2) {
        icone = "🔥";
        score = "TRÈS BON MATCH";
      } else if (ingredientsManques <= 4) {
        icone = "👍";
        score = "BON MATCH";
      } else {
        icone = "🤔";
        score = "MATCH PARTIEL";
      }
      
      // Formatage de chaque recette
      resultat += `${index + 1}. ${icone} ${titre}\n`;
      resultat += `   🎯 ${score}\n`;
      resultat += `   ✅ Utilise ${ingredientsUtilises} de vos ingrédients\n`;
      
      if (ingredientsManques > 0) {
        resultat += `   ❌ Manque ${ingredientsManques} ingrédient(s)\n`;
      }
      
      if (scoreOptimisation > 0) {
        resultat += `   📊 Score d'optimisation: ${scoreOptimisation.toFixed(0)}\n`;
      }
      
      // Affichage des ingrédients utilisés de l'inventaire
      const ingredientsUtilisesDetails = recette.usedIngredients || [];
      if (ingredientsUtilisesDetails.length > 0) {
        resultat += "   🥘 Vos ingrédients utilisés: ";
        const nomsUtilises = ingredientsUtilisesDetails.slice(0, 3).map(ing => ing.name);
        resultat += nomsUtilises.join(", ");
        if (ingredientsUtilisesDetails.length > 3) {
          resultat += ` (+ ${ingredientsUtilisesDetails.length - 3} autres)`;
        }
        resultat += "\n";
      }
      
      resultat += "\n";
    });

    // Conseils d'optimisation
    resultat += "💡 CONSEILS D'OPTIMISATION:\n";
    resultat += "• Les recettes sont triées pour maximiser l'utilisation de vos aliments\n";
    resultat += "• Priorité donnée aux aliments qui expirent bientôt\n";
    if (this.regimesActifs.size > 0) {
      resultat += "• Filtrage selon vos préférences alimentaires\n";
    }
    
    return resultat;
  }

  async rechercherRecettesParNom(nom, nombre = 5) {
    try {
      const url = `${this.baseUrl}/recipes/complexSearch`;
      const params = new URLSearchParams({
        query: nom,
        number: nombre.toString(),
        apiKey: this.apiKey,
        addRecipeInformation: 'true'
      });

      // Ajout des régimes alimentaires
      if (this.regimesActifs.size > 0) {
        params.set('diet', this.obtenirRegimesActifs().join(','));
      }

      const response = await fetch(`${url}?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        const recettes = data.results || [];
        if (recettes.length === 0) {
          return { success: false, message: `Aucune recette trouvée pour '${nom}'`, recettes: [] };
        }
        
        return { success: true, message: `Recettes trouvées pour '${nom}'`, recettes };
      } else {
        return { success: false, message: `Erreur API: ${response.status}`, recettes: [] };
      }
    } catch (error) {
      return { success: false, message: `Erreur: ${error.message}`, recettes: [] };
    }
  }

  // Méthodes utilitaires pour les statistiques
  calculerStatistiquesRecettes(recettes, inventaire) {
    const stats = {
      totalRecettes: recettes.length,
      parfaitMatch: 0,
      bonMatch: 0,
      matchPartiel: 0,
      ingredientsMoyensManques: 0,
      ingredientsMoyensUtilises: 0
    };

    let totalManques = 0;
    let totalUtilises = 0;

    recettes.forEach(recette => {
      const manques = recette.missedIngredientCount || 0;
      const utilises = recette.usedIngredientCount || 0;
      
      totalManques += manques;
      totalUtilises += utilises;

      if (manques === 0) {
        stats.parfaitMatch++;
      } else if (manques <= 2) {
        stats.bonMatch++;
      } else {
        stats.matchPartiel++;
      }
    });

    if (recettes.length > 0) {
      stats.ingredientsMoyensManques = (totalManques / recettes.length).toFixed(1);
      stats.ingredientsMoyensUtilises = (totalUtilises / recettes.length).toFixed(1);
    }

    return stats;
  }
}

export default RecipeManager;
