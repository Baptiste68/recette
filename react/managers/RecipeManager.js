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

  /**
    * Optimise l'utilisation des aliments en priorisant les recettes qui utilisent le plus d'ingrédients
    * @param {Object} inventaire - Inventaire disponible
    * @param {Array} recettes - Liste des recettes
    * @returns {Array} Recettes optimisées et triées
  */
  optimiserUtilisationAliments(inventaire, recettes) {
    if (!recettes || recettes.length === 0) return [];
    
    const ingredientsDisponibles = Object.keys(inventaire).map(nom => nom.toLowerCase());
    const alimentsExpires = this.obtenirAlimentsExpires(inventaire);
    const alimentsBientotExpires = this.obtenirAlimentsBientotExpires(inventaire, 3);
    
    console.log(`🔍 Optimisation de ${recettes.length} recettes avec ${ingredientsDisponibles.length} ingrédients disponibles`);
    
    // Analyser chaque recette et calculer son score d'optimisation
    const recettesAnalysees = recettes.map(recette => {
        const analysis = this.analyserRecette(recette, inventaire, ingredientsDisponibles, alimentsExpires, alimentsBientotExpires);
        return {
            ...recette,
            ...analysis
        };
    });
    
    // Filtrer les recettes qui utilisent au moins 2 ingrédients (sauf si c'est le seul choix)
    let recettesFiltrees = recettesAnalysees.filter(r => r.utilisationScore >= 2);
    
    // Si pas assez de recettes avec 2+ ingrédients, inclure celles avec 1 ingrédient
    if (recettesFiltrees.length < 3) {
        recettesFiltrees = recettesAnalysees.filter(r => r.utilisationScore >= 1);
    }
    
    // Si toujours pas assez, prendre toutes les recettes
    if (recettesFiltrees.length === 0) {
        recettesFiltrees = recettesAnalysees;
    }
    
    // Trier par score total (priorité aux recettes qui utilisent le plus d'ingrédients)
    const recettesTriees = recettesFiltrees.sort((a, b) => {
        // Priorité 1: Score d'utilisation (nombre d'ingrédients utilisés)
        if (b.utilisationScore !== a.utilisationScore) {
            return b.utilisationScore - a.utilisationScore;
        }
        
        // Priorité 2: Score d'urgence (aliments qui expirent)
        if (b.urgenceScore !== a.urgenceScore) {
            return b.urgenceScore - a.urgenceScore;
        }
        
        // Priorité 3: Ratio d'utilisation (% d'ingrédients disponibles utilisés)
        if (b.ratioUtilisation !== a.ratioUtilisation) {
            return b.ratioUtilisation - a.ratioUtilisation;
        }
        
        // Priorité 4: Moins d'ingrédients manquants
        return a.missedIngredientCount - b.missedIngredientCount;
    });
    
    console.log(`✅ Optimisation terminée: ${recettesTriees.length} recettes triées`);
    console.log(`Top 3 scores d'utilisation: ${recettesTriees.slice(0, 3).map(r => r.utilisationScore).join(', ')}`);
    
    return recettesTriees;
  }

  /**
 * Analyse une recette et calcule ses scores d'optimisation
 * @param {Object} recette - Recette à analyser
 * @param {Object} inventaire - Inventaire disponible
 * @param {Array} ingredientsDisponibles - Liste des ingrédients disponibles
 * @param {Array} alimentsExpires - Aliments expirés
 * @param {Array} alimentsBientotExpires - Aliments bientôt expirés
 * @returns {Object} Analyse complète de la recette
 */
  analyserRecette(recette, inventaire, ingredientsDisponibles, alimentsExpires, alimentsBientotExpires) {
        // Ingrédients utilisés de l'inventaire
        const ingredientsUtilises = this.obtenirIngredientsUtilises(recette, ingredientsDisponibles);
        
        // Ingrédients manquants
        const ingredientsManques = this.obtenirIngredientsManques(recette, ingredientsDisponibles);
        
        // Score d'utilisation = nombre d'ingrédients de l'inventaire utilisés
        const utilisationScore = ingredientsUtilises.length;
        
        // Score d'urgence = bonus pour les aliments qui expirent
        let urgenceScore = 0;
        ingredientsUtilises.forEach(ingredient => {
            if (alimentsExpires.some(expire => this.correspondIngredient(expire, ingredient))) {
                urgenceScore += 10; // Bonus élevé pour aliments expirés
            } else if (alimentsBientotExpires.some(([bientot]) => this.correspondIngredient(bientot, ingredient))) {
                urgenceScore += 5; // Bonus moyen pour aliments bientôt expirés
            }
        });
        
        // Ratio d'utilisation = % des ingrédients disponibles qui sont utilisés
        const ratioUtilisation = ingredientsDisponibles.length > 0 ? 
            (ingredientsUtilises.length / ingredientsDisponibles.length) : 0;
        
        // Score de complexité = bonus pour les recettes qui utilisent beaucoup d'ingrédients disponibles
        const complexiteScore = utilisationScore >= 4 ? 20 : utilisationScore >= 3 ? 10 : utilisationScore >= 2 ? 5 : 0;
        
        // Score total
        const scoreTotal = utilisationScore * 10 + urgenceScore + complexiteScore + (ratioUtilisation * 5);
        
        return {
            utilisationScore,
            urgenceScore,
            ratioUtilisation: Math.round(ratioUtilisation * 100) / 100,
            complexiteScore,
            scoreTotal: Math.round(scoreTotal),
            usedIngredientCount: utilisationScore,
            missedIngredientCount: ingredientsManques.length,
            usedIngredients: ingredientsUtilises.map(ing => ({ name: ing })),
            missedIngredients: ingredientsManques.map(ing => ({ name: ing }))
        };
  }

    /**
     * Obtient les ingrédients utilisés de l'inventaire pour une recette
     * @param {Object} recette - Recette à analyser
     * @param {Array} ingredientsDisponibles - Ingrédients disponibles
     * @returns {Array} Liste des ingrédients utilisés
     */
  obtenirIngredientsUtilises(recette, ingredientsDisponibles) {
        const ingredientsRecette = this.extraireIngredientsRecette(recette);
        const utilises = [];
        
        ingredientsRecette.forEach(ingredient => {
            const trouve = ingredientsDisponibles.find(dispo => 
                this.correspondIngredient(dispo, ingredient)
            );
            if (trouve) {
                utilises.push(ingredient);
            }
        });
        
        return utilises;
  }

/**
     * Obtient les ingrédients manquants pour une recette
     * @param {Object} recette - Recette à analyser
     * @param {Array} ingredientsDisponibles - Ingrédients disponibles
     * @returns {Array} Liste des ingrédients manquants
     */
  obtenirIngredientsManques(recette, ingredientsDisponibles) {
        const ingredientsRecette = this.extraireIngredientsRecette(recette);
        const manques = [];
        
        ingredientsRecette.forEach(ingredient => {
            const trouve = ingredientsDisponibles.find(dispo => 
                this.correspondIngredient(dispo, ingredient)
            );
            if (!trouve) {
                manques.push(ingredient);
            }
        });
        
        return manques;
  }

/**
 * Extrait les ingrédients d'une recette (gère les différents formats d'API)
 * @param {Object} recette - Recette
 * @returns {Array} Liste des ingrédients
 */
  extraireIngredientsRecette(recette) {
    let ingredients = [];
    
    // Format Spoonacular avec usedIngredients/missedIngredients
    if (recette.usedIngredients && Array.isArray(recette.usedIngredients)) {
        ingredients = [...ingredients, ...recette.usedIngredients.map(ing => ing.name || ing.original || ing)];
    }
    if (recette.missedIngredients && Array.isArray(recette.missedIngredients)) {
        ingredients = [...ingredients, ...recette.missedIngredients.map(ing => ing.name || ing.original || ing)];
    }
    
    // Format Spoonacular avec extendedIngredients
    if (recette.extendedIngredients && Array.isArray(recette.extendedIngredients)) {
        ingredients = [...ingredients, ...recette.extendedIngredients.map(ing => ing.name || ing.original || ing)];
    }
    
    // Format simple avec liste d'ingrédients
    if (recette.ingredients && Array.isArray(recette.ingredients)) {
        ingredients = [...ingredients, ...recette.ingredients];
    }
    
    // Nettoyer et normaliser les ingrédients
    return ingredients
        .filter(ing => ing && typeof ing === 'string')
        .map(ing => ing.toLowerCase().trim())
        .filter((ing, index, arr) => arr.indexOf(ing) === index); // Supprimer les doublons
  }

/**
 * Vérifie si un ingrédient correspond à un aliment disponible
 * @param {string} alimentDispo - Aliment disponible dans l'inventaire
 * @param {string} ingredientRecette - Ingrédient de la recette
 * @returns {boolean} True si correspondance
 */
  correspondIngredient(alimentDispo, ingredientRecette) {
    if (!alimentDispo || !ingredientRecette) return false;
    
    const aliment = alimentDispo.toLowerCase().trim();
    const ingredient = ingredientRecette.toLowerCase().trim();
    
    // Correspondance exacte
    if (aliment === ingredient) return true;
    
    // Correspondance partielle (l'un contient l'autre)
    if (aliment.includes(ingredient) || ingredient.includes(aliment)) return true;
    
    // Mappings spéciaux pour améliorer les correspondances
    const mappings = {
        'tomate': ['tomato', 'tomatoes'],
        'oignon': ['onion', 'onions'],
        'carotte': ['carrot', 'carrots'],
        'pomme de terre': ['potato', 'potatoes'],
        'bœuf': ['beef', 'ground beef'],
        'poulet': ['chicken', 'chicken breast'],
        'fromage': ['cheese', 'cheddar', 'mozzarella'],
        'lait': ['milk'],
        'œuf': ['egg', 'eggs'],
        'ail': ['garlic'],
        'herbes': ['herbs', 'parsley', 'basil', 'thyme']
    };
    
    // Vérifier les mappings
    for (const [francais, anglais] of Object.entries(mappings)) {
        if (aliment.includes(francais) && anglais.some(eng => ingredient.includes(eng))) {
            return true;
        }
        if (anglais.some(eng => aliment.includes(eng)) && ingredient.includes(francais)) {
            return true;
        }
    }
    
    return false;
 }

/**
 * Obtient les aliments expirés de l'inventaire
 * @param {Object} inventaire - Inventaire
 * @returns {Array} Liste des aliments expirés
 */
  obtenirAlimentsExpires(inventaire) {
    const aujourd_hui = new Date();
    return Object.entries(inventaire)
        .filter(([nom, details]) => {
            const dateExpiration = new Date(details.expiration);
            return dateExpiration < aujourd_hui;
        })
        .map(([nom]) => nom);
  }

    /**
     * Obtient les aliments qui expirent bientôt
     * @param {Object} inventaire - Inventaire
     * @param {number} jours - Nombre de jours avant expiration
     * @returns {Array} Liste des aliments avec jours restants
     */
    obtenirAlimentsBientotExpires(inventaire, jours = 3) {
    const aujourd_hui = new Date();
    const limite = new Date();
    limite.setDate(aujourd_hui.getDate() + jours);
    
    return Object.entries(inventaire)
        .filter(([nom, details]) => {
            const dateExpiration = new Date(details.expiration);
            return dateExpiration > aujourd_hui && dateExpiration <= limite;
        })
        .map(([nom, details]) => {
            const dateExpiration = new Date(details.expiration);
            const joursRestants = Math.ceil((dateExpiration - aujourd_hui) / (1000 * 60 * 60 * 24));
            return [nom, joursRestants];
        });
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

  /**
 * Recherche des recettes en utilisant une stratégie d'ingrédients optimisée
 * @param {Array} ingredients - Liste des ingrédients disponibles
 * @param {number} number - Nombre de recettes à retourner
 * @returns {Object} Résultat de la recherche
 */
  async rechercherRecettesParIngredients(ingredients, number = 10) {
    if (!ingredients || ingredients.length === 0) {
        return {
            success: false,
            message: "Aucun ingrédient fourni pour la recherche",
            recettes: []
        };
    }

    try {
        console.log(`🔍 Recherche stratégique avec ${ingredients.length} ingrédients:`, ingredients);
        
        // Stratégie 1: Recherche avec tous les ingrédients
        let allRecipes = [];
        
        if (ingredients.length >= 2) {
            console.log("📋 Stratégie 1: Recherche avec tous les ingrédients...");
            const resultTousIngredients = await this.rechercherAvecIngredients(ingredients, Math.max(6, number));
            if (resultTousIngredients.success && resultTousIngredients.recettes.length > 0) {
                allRecipes = [...allRecipes, ...resultTousIngredients.recettes];
                console.log(`✅ Trouvé ${resultTousIngredients.recettes.length} recettes avec tous les ingrédients`);
            }
        }
        
        // Stratégie 2: Recherche avec combinaisons d'ingrédients
        if (ingredients.length >= 3 && allRecipes.length < number) {
            console.log("📋 Stratégie 2: Recherche par combinaisons...");
            const combinaisonsRecettes = await this.rechercherParCombinaisons(ingredients, number - allRecipes.length);
            allRecipes = [...allRecipes, ...combinaisonsRecettes];
            console.log(`✅ Ajouté ${combinaisonsRecettes.length} recettes par combinaisons`);
        }
        
        // Stratégie 3: Recherche avec ingrédients principaux seulement
        if (allRecipes.length < number) {
            console.log("📋 Stratégie 3: Recherche avec ingrédients principaux...");
            const ingredientsPrincipaux = this.selectionnerIngredientsPrincipaux(ingredients);
            const resultPrincipaux = await this.rechercherAvecIngredients(ingredientsPrincipaux, number - allRecipes.length);
            if (resultPrincipaux.success && resultPrincipaux.recettes.length > 0) {
                allRecipes = [...allRecipes, ...resultPrincipaux.recettes];
                console.log(`✅ Ajouté ${resultPrincipaux.recettes.length} recettes avec ingrédients principaux`);
            }
        }
        
        // Supprimer les doublons
        const recettesUniques = this.supprimerDoublonsRecettes(allRecipes);
        
        console.log(`🎯 Résultat final: ${recettesUniques.length} recettes uniques trouvées`);
        
        return {
            success: true,
            message: `${recettesUniques.length} recettes trouvées avec stratégie optimisée`,
            recettes: recettesUniques.slice(0, number),
            strategies: {
                tousIngredients: ingredients.length,
                combinaisons: ingredients.length >= 3,
                principaux: true
            }
        };
        
    } catch (error) {
        console.error('Erreur lors de la recherche stratégique:', error);
        return {
            success: false,
            message: `Erreur lors de la recherche: ${error.message}`,
            recettes: []
        };
    }
  }

  /**
 * Recherche avec une liste spécifique d'ingrédients
 * @param {Array} ingredients - Ingrédients à utiliser
 * @param {number} number - Nombre de recettes
 * @returns {Object} Résultat de la recherche
 */
  async rechercherAvecIngredients(ingredients, number = 10) {
    const ingredientsStr = ingredients.join(',');
    const url = `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${this.apiKey}&ingredients=${encodeURIComponent(ingredientsStr)}&number=${number}&ranking=2&ignorePantry=true`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erreur API: ${response.status}`);
        }
        
        const data = await response.json();
        return {
            success: true,
            recettes: data || [],
            ingredients: ingredients
        };
    } catch (error) {
        console.error('Erreur recherche API:', error);
        return {
            success: false,
            recettes: [],
            ingredients: ingredients
        };
    }
  }

  /**
 * Recherche par combinaisons d'ingrédients pour maximiser l'utilisation
 * @param {Array} ingredients - Liste complète des ingrédients
 * @param {number} number - Nombre de recettes à chercher
 * @returns {Array} Recettes trouvées
 */
  async rechercherParCombinaisons(ingredients, number = 6) {
    const combinaisons = this.genererCombinaisons(ingredients, 3, 4); // Combinaisons de 3-4 ingrédients
    const recettes = [];
    
    // Tester les meilleures combinaisons
    for (let i = 0; i < Math.min(combinaisons.length, 3) && recettes.length < number; i++) {
        const combinaison = combinaisons[i];
        console.log(`🔍 Test combinaison: ${combinaison.join(', ')}`);
        
        const result = await this.rechercherAvecIngredients(combinaison, 3);
        if (result.success && result.recettes.length > 0) {
            recettes.push(...result.recettes);
            console.log(`✅ Trouvé ${result.recettes.length} recettes avec cette combinaison`);
        }
        
        // Petite pause pour éviter les limites de taux
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    return recettes;
  }

  /**
 * Génère des combinaisons d'ingrédients
 * @param {Array} ingredients - Liste des ingrédients
 * @param {number} minSize - Taille minimale des combinaisons
 * @param {number} maxSize - Taille maximale des combinaisons
 * @returns {Array} Combinaisons générées
 */
  genererCombinaisons(ingredients, minSize = 2, maxSize = 4) {
    const combinaisons = [];
    
    // Générer des combinaisons de différentes tailles
    for (let taille = Math.min(maxSize, ingredients.length); taille >= minSize; taille--) {
        const combsTaille = this.combiner(ingredients, taille);
        combinaisons.push(...combsTaille);
        if (combinaisons.length >= 10) break; // Limiter le nombre de combinaisons
    }
    
    // Prioriser les combinaisons avec des ingrédients principaux
    return combinaisons.sort((a, b) => {
        const scoreA = this.scorerCombinaison(a);
        const scoreB = this.scorerCombinaison(b);
        return scoreB - scoreA;
    });
  }

  /**
 * Génère toutes les combinaisons possibles de taille donnée
 * @param {Array} arr - Tableau d'éléments
 * @param {number} size - Taille des combinaisons
 * @returns {Array} Combinaisons
 */
  combiner(arr, size) {
    if (size === 1) return arr.map(el => [el]);
    if (size > arr.length) return [];
    
    const result = [];
    for (let i = 0; i <= arr.length - size; i++) {
        const head = arr[i];
        const tailCombs = this.combiner(arr.slice(i + 1), size - 1);
        for (const tail of tailCombs) {
            result.push([head, ...tail]);
        }
    }
    return result;
  }

  /**
 * Attribue un score à une combinaison d'ingrédients
 * @param {Array} combinaison - Combinaison d'ingrédients
 * @returns {number} Score de la combinaison
 */
  scorerCombinaison(combinaison) {
    const ingredientsPrincipaux = ['bœuf', 'poulet', 'poisson', 'tomate', 'oignon', 'carotte', 'pomme de terre'];
    let score = combinaison.length * 10; // Bonus pour les combinaisons plus grandes
    
    // Bonus pour les ingrédients principaux
    combinaison.forEach(ingredient => {
        if (ingredientsPrincipaux.some(principal => 
            ingredient.toLowerCase().includes(principal) || principal.includes(ingredient.toLowerCase())
        )) {
            score += 20;
        }
    });
    
    return score;
  }

  /**
 * Sélectionne les ingrédients principaux les plus polyvalents
 * @param {Array} ingredients - Liste complète des ingrédients
 * @returns {Array} Ingrédients principaux sélectionnés
 */
  selectionnerIngredientsPrincipaux(ingredients) {
    const priorites = {
        'viandes': ['bœuf', 'poulet', 'porc', 'agneau', 'poisson'],
        'legumes_base': ['tomate', 'oignon', 'carotte', 'pomme de terre', 'ail'],
        'produits_laitiers': ['fromage', 'lait', 'beurre', 'crème'],
        'cereales': ['riz', 'pâtes', 'pain', 'farine']
    };
    
    const selectionnes = [];
    
    // Sélectionner un ingrédient de chaque catégorie si disponible
    Object.values(priorites).forEach(categorie => {
        const trouve = ingredients.find(ingredient => 
            categorie.some(prioritaire => 
                ingredient.toLowerCase().includes(prioritaire) || 
                prioritaire.includes(ingredient.toLowerCase())
            )
        );
        if (trouve && !selectionnes.includes(trouve)) {
            selectionnes.push(trouve);
        }
    });
    
    // Ajouter d'autres ingrédients si pas assez
    const autres = ingredients.filter(ing => !selectionnes.includes(ing));
    selectionnes.push(...autres.slice(0, Math.max(0, 6 - selectionnes.length)));
    
    console.log(`🎯 Ingrédients principaux sélectionnés:`, selectionnes);
    return selectionnes;
  }

  /**
 * Supprime les recettes en doublon
 * @param {Array} recettes - Liste des recettes
 * @returns {Array} Recettes sans doublons
 */
  supprimerDoublonsRecettes(recettes) {
    const vues = new Set();
    return recettes.filter(recette => {
        const identifiant = recette.id || recette.title || JSON.stringify(recette);
        if (vues.has(identifiant)) {
            return false;
        }
        vues.add(identifiant);
        return true;
    });
 }

  /**
 * Construit l'URL optimisée pour l'API Spoonacular
 * @param {Array} ingredients - Ingrédients
 * @param {number} number - Nombre de recettes
 * @param {Object} options - Options supplémentaires
 * @returns {string} URL construite
 */
  construireUrlOptimisee(ingredients, number = 10, options = {}) {
    const baseUrl = 'https://api.spoonacular.com/recipes/findByIngredients';
    const params = new URLSearchParams();
    
    // Paramètres de base
    params.append('apiKey', this.apiKey);
    params.append('ingredients', ingredients.join(','));
    params.append('number', number.toString());
    
    // Paramètres d'optimisation pour favoriser l'utilisation maximale d'ingrédients
    params.append('ranking', '2'); // 2 = maximise les ingrédients utilisés
    params.append('ignorePantry', 'true'); // Ignore les ingrédients de base communs
    params.append('limitLicense', 'false'); // Inclut toutes les recettes
    
    // Paramètres supplémentaires selon les options
    if (options.fillIngredients !== false) {
        params.append('fillIngredients', 'true'); // Retourne plus d'infos sur les ingrédients
    }
    
    if (options.addRecipeInformation) {
        params.append('addRecipeInformation', 'true'); // Inclut plus d'infos sur la recette
    }
    
    return `${baseUrl}?${params.toString()}`;
  }

  /**
 * Version améliorée de la recherche avec paramètres optimisés
 * @param {Array} ingredients - Ingrédients disponibles
 * @param {number} number - Nombre de recettes
 * @returns {Object} Résultat optimisé
 */
  async rechercherAvecParametresOptimises(ingredients, number = 10) {
    console.log(`🎯 Recherche optimisée avec ${ingredients.length} ingrédients`);
    
    try {
        // URL avec paramètres optimisés
        const url = this.construireUrlOptimisee(ingredients, number, {
            fillIngredients: true,
            addRecipeInformation: true
        });
        
        console.log(`📡 Requête API: ${url.replace(this.apiKey, 'API_KEY')}`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Erreur API Spoonacular: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
            throw new Error('Format de réponse API inattendu');
        }
        
        // Enrichir les données avec des métriques d'utilisation
        const recettesEnrichies = data.map(recette => ({
            ...recette,
            // Calculer le taux d'utilisation des ingrédients disponibles
            tauxUtilisation: this.calculerTauxUtilisation(recette, ingredients),
            // Marquer les ingrédients prioritaires utilisés
            ingredientsPrioritaires: this.identifierIngredientsPrioritaires(recette, ingredients)
        }));
        
        // Trier par taux d'utilisation décroissant
        const recettesTriees = recettesEnrichies.sort((a, b) => {
            // Priorité 1: Nombre d'ingrédients utilisés
            const utilisesA = a.usedIngredientCount || 0;
            const utilisesB = b.usedIngredientCount || 0;
            
            if (utilisesB !== utilisesA) {
                return utilisesB - utilisesA;
            }
            
            // Priorité 2: Taux d'utilisation
            if (b.tauxUtilisation !== a.tauxUtilisation) {
                return b.tauxUtilisation - a.tauxUtilisation;
            }
            
            // Priorité 3: Moins d'ingrédients manquants
            const manquesA = a.missedIngredientCount || 0;
            const manquesB = b.missedIngredientCount || 0;
            return manquesA - manquesB;
        });
        
        console.log(`✅ ${recettesTriees.length} recettes trouvées et optimisées`);
        if (recettesTriees.length > 0) {
            console.log(`🥇 Meilleure recette: "${recettesTriees[0].title}" (${recettesTriees[0].usedIngredientCount} ingrédients utilisés)`);
        }
        
        return {
            success: true,
            message: `${recettesTriees.length} recettes trouvées avec optimisation`,
            recettes: recettesTriees,
            stats: {
                totalRecettes: recettesTriees.length,
                moyenneIngredientsUtilises: recettesTriees.length > 0 
                    ? Math.round(recettesTriees.reduce((sum, r) => sum + (r.usedIngredientCount || 0), 0) / recettesTriees.length * 10) / 10
                    : 0,
                meilleureUtilisation: Math.max(...recettesTriees.map(r => r.usedIngredientCount || 0))
            }
        };
        
    } catch (error) {
        console.error('Erreur lors de la recherche optimisée:', error);
        return {
            success: false,
            message: `Erreur lors de la recherche: ${error.message}`,
            recettes: []
        };
    }
  }

  /**
 * Calcule le taux d'utilisation des ingrédients disponibles
 * @param {Object} recette - Recette à analyser
 * @param {Array} ingredientsDisponibles - Ingrédients disponibles
 * @returns {number} Taux d'utilisation (0-1)
 */
  calculerTauxUtilisation(recette, ingredientsDisponibles) {
    const ingredientsUtilises = recette.usedIngredientCount || 0;
    return ingredientsDisponibles.length > 0 ? ingredientsUtilises / ingredientsDisponibles.length : 0;
  }

  /**
 * Identifie les ingrédients prioritaires utilisés dans une recette
 * @param {Object} recette - Recette à analyser
 * @param {Array} ingredientsDisponibles - Ingrédients disponibles
 * @returns {Array} Ingrédients prioritaires utilisés
 */
  identifierIngredientsPrioritaires(recette, ingredientsDisponibles) {
    const prioritaires = ['bœuf', 'poulet', 'poisson', 'tomate', 'oignon', 'fromage'];
    const utilises = recette.usedIngredients || [];
    
    return utilises.filter(ingredient => {
        const nom = (ingredient.name || ingredient.original || '').toLowerCase();
        return prioritaires.some(prioritaire => 
            nom.includes(prioritaire) || 
            ingredientsDisponibles.some(dispo => 
                dispo.toLowerCase().includes(prioritaire) && nom.includes(dispo.toLowerCase())
            )
        );
    });
  }
}

export default RecipeManager;
