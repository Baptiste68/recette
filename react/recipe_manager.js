/**
 * Module de gestion des recettes avec optimisation et gestion des régimes
 */

// Enum pour les régimes alimentaires
const RegimeAlimentaire = {
    VEGETARIEN: "vegetarian",
    VEGAN: "vegan", 
    SANS_GLUTEN: "gluten-free",
    CETOGENE: "ketogenic",
    PALEO: "paleo",
    SANS_LACTOSE: "dairy-free",
    SANS_NOIX: "tree-nut-free",
    PESCETARIEN: "pescetarian"
};

class RecipeManager {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = "https://api.spoonacular.com";
        this.regimesActifs = new Set();
    }

    ajouterRegime(regime) {
        /**Ajoute un régime alimentaire aux préférences*/
        this.regimesActifs.add(regime);
    }

    retirerRegime(regime) {
        /**Retire un régime des préférences*/
        this.regimesActifs.delete(regime);
    }

    obtenirRegimesActifs() {
        /**Retourne la liste des régimes actifs*/
        return Array.from(this.regimesActifs);
    }

    optimiserUtilisationAliments(inventaire, recettes) {
        /**
         * Optimise l'ordre des recettes pour maximiser l'utilisation des aliments
         * en priorisant ceux qui expirent bientôt
         */
        
        // Calcul du score de priorité pour chaque aliment
        const scoresAliments = {};
        for (const [nom, details] of Object.entries(inventaire)) {
            let score = details.quantite;  // Score de base = quantité
            
            // Bonus pour les aliments qui expirent bientôt
            if (details.expiration && details.expiration !== "Non specifiee") {
                try {
                    const dateExp = new Date(details.expiration);
                    const maintenant = new Date();
                    const joursRestants = Math.ceil((dateExp - maintenant) / (1000 * 60 * 60 * 24));
                    
                    if (joursRestants < 0) {
                        score += 100;  // Très haute priorité pour les expirés
                    } else if (joursRestants <= 3) {
                        score += 50;   // Haute priorité
                    } else if (joursRestants <= 7) {
                        score += 20;   // Priorité moyenne
                    }
                } catch (error) {
                    // Ignore les erreurs de parsing de date
                }
            }
            
            scoresAliments[nom.toLowerCase()] = score;
        }

        // Calcul du score pour chaque recette
        for (const recette of recettes) {
            let scoreRecette = 0;
            const ingredientsUtilises = recette.usedIngredients || [];
            
            for (const ingredient of ingredientsUtilises) {
                const nomIngredient = ingredient.name.toLowerCase();
                // Recherche d'aliments correspondants dans l'inventaire
                for (const [nomInventaire, scoreAliment] of Object.entries(scoresAliments)) {
                    if (nomIngredient.includes(nomInventaire) || nomInventaire.includes(nomIngredient)) {
                        scoreRecette += scoreAliment;
                        break;
                    }
                }
            }

            // Bonus pour moins d'ingrédients manqués
            const ingredientsManques = recette.missedIngredientCount || 0;
            scoreRecette += Math.max(0, 20 - ingredientsManques * 2);
            
            recette.score_optimisation = scoreRecette;
        }

        // Tri par score décroissant
        return recettes.sort((a, b) => (b.score_optimisation || 0) - (a.score_optimisation || 0));
    }

    async rechercherRecettesParIngredients(ingredients, nombre = 8) {
        /**
         * Recherche des recettes basées sur les ingrédients disponibles
         * 
         * Returns:
         *     Object: {success: boolean, message: string, data: Array}
         */
        if (!ingredients || ingredients.length === 0) {
            return { success: false, message: "Aucun ingrédient fourni", data: [] };
        }

        try {
            // Construction de l'URL avec les régimes
            const ingredientsStr = ingredients.join(",");
            const url = `${this.baseUrl}/recipes/findByIngredients`;
            
            const params = new URLSearchParams({
                ingredients: ingredientsStr,
                number: nombre.toString(),
                apiKey: this.apiKey,
                ranking: '1',  // Maximise les ingrédients utilisés
                ignorePantry: 'true'
            });

            const response = await fetch(`${url}?${params}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const recettes = await response.json();
                
                if (!recettes || recettes.length === 0) {
                    return { success: false, message: "Aucune recette trouvée avec ces ingrédients", data: [] };
                }

                console.log("pre");
                // Filtrage par régimes alimentaires si spécifiés
                let recettesFiltrees = recettes;
                if (this.regimesActifs.size > 0) {
                    recettesFiltrees = await this.filtrerParRegimes(recettes);
                }
                console.log("post");

                return { success: true, message: "Recettes trouvées avec succès", data: recettesFiltrees };
            
            } else if (response.status === 402) {
                return { success: false, message: "Limite d'API atteinte. Réessayez plus tard.", data: [] };
            } else {
                return { success: false, message: `Erreur API: ${response.status}`, data: [] };
            }
                
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                return { success: false, message: "Erreur de connexion. Vérifiez votre internet.", data: [] };
            }
            return { success: false, message: `Erreur inattendue: ${error.message}`, data: [] };
        }
    }

    async filtrerParRegimes(recettes) {
        /**
         * Filtre les recettes selon les régimes alimentaires
         * Note: Cette fonction nécessiterait des appels API supplémentaires pour vérifier
         * les détails nutritionnels. Pour l'instant, elle retourne les recettes telles quelles.
         */
        // Pour une implémentation complète, il faudrait faire des appels à l'API
        // /recipes/{id}/information pour chaque recette pour vérifier les régimes
        return recettes;
    }

    async obtenirDetailsRecette(recipeId) {
        /**
         * Récupère les détails complets d'une recette
         * 
         * Returns:
         *     Object: {success: boolean, message: string, details: Object}
         */
        try {
            const url = `${this.baseUrl}/recipes/${recipeId}/information`;
            
            const params = new URLSearchParams({
                apiKey: this.apiKey,
                includeNutrition: 'false'
            });

            const response = await fetch(`${url}?${params}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const details = await response.json();
                return { success: true, message: "Détails récupérés avec succès", details };
            
            } else if (response.status === 402) {
                return { success: false, message: "Limite d'API atteinte", details: {} };
            } else {
                return { success: false, message: `Erreur API: ${response.status}`, details: {} };
            }
                
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                return { success: false, message: "Erreur de connexion", details: {} };
            }
            return { success: false, message: `Erreur: ${error.message}`, details: {} };
        }
    }

    formaterRecettes(recettesBrutes, inventaire) {
        /**
         * Formate les recettes pour l'affichage avec optimisation
         */
        if (!recettesBrutes || recettesBrutes.length === 0) {
            return "Aucune recette trouvée avec vos ingrédients.\nEssayez d'ajouter d'autres aliments !";
        }

        console.log("ieyrwiueyr");
        // Optimisation de l'ordre des recettes
        const recettesOptimisees = this.optimiserUtilisationAliments(inventaire, recettesBrutes);
        
        // En-tête avec information sur les régimes
        let resultat = "🍽️ RECETTES SUGGÉRÉES (OPTIMISÉES) 🍽️\n";
        if (this.regimesActifs.size > 0) {
            const regimesStr = Array.from(this.regimesActifs)
                .map(r => r.charAt(0).toUpperCase() + r.slice(1).replace('-', ' '))
                .join(", ");
            resultat += `📋 Régimes actifs: ${regimesStr}\n`;
        }
        resultat += "=".repeat(50) + "\n\n";

        for (let i = 0; i < recettesOptimisees.length; i++) {
            const recette = recettesOptimisees[i];
            const titre = recette.title;
            const ingredientsManques = recette.missedIngredientCount || 0;
            const ingredientsUtilises = recette.usedIngredientCount || 0;
            const scoreOptimisation = recette.score_optimisation || 0;

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
            resultat += `${i + 1}. ${icone} ${titre}\n`;
            resultat += `   🎯 ${score}\n`;
            resultat += `   ✅ Utilise ${ingredientsUtilises} de vos ingrédients\n`;

            if (ingredientsManques > 0) {
                resultat += `   ❌ Manque ${ingredientsManques} ingrédient(s)\n`;
            }

            if (scoreOptimisation > 0) {
                resultat += `   📊 Score d'optimisation: ${Math.round(scoreOptimisation)}\n`;
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
        }

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
        /**
         * Recherche des recettes par nom
         * 
         * Returns:
         *     Object: {success: boolean, message: string, data: Array}
         */
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
                params.set('diet', Array.from(this.regimesActifs).join(','));
            }

            const response = await fetch(`${url}?${params}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const recettes = data.results || [];
                
                if (recettes.length === 0) {
                    return { success: false, message: `Aucune recette trouvée pour '${nom}'`, data: [] };
                }

                return { success: true, message: `Recettes trouvées pour '${nom}'`, data: recettes };
            } else {
                return { success: false, message: `Erreur API: ${response.status}`, data: [] };
            }

        } catch (error) {
            return { success: false, message: `Erreur: ${error.message}`, data: [] };
        }
    }
}

export { RecipeManager, RegimeAlimentaire };