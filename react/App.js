// App.js - Composant principal avec intégration des nouveaux modules (conserve la structure existante)
import React, { useState, useEffect } from 'react';
import InventoryManager from './managers/InventoryManager';
import DietManager from './managers/DietManager';
import RecipeManager from './managers/RecipeManager';
import { RecipeDisplayComponent } from './managers/RecipeDisplayManager';
import { RegimeAlimentaire, Allergie } from './constants/enums';
import { palette } from './constants/colors';
import { styles } from './styles/AppStyles';
import BonusRecipeManager from './managers/BonusRecipeManager';
import { getSuggestedUnit, FOOD_UNITS, getStandardQuantity } from './constants/foodDatabase.js';

// Import des nouveaux modules
import { 
  FOOD_CATEGORIES, 
  PREDEFINED_FOODS, 
  getAllFoods, 
  getFoodByName, 
  getFoodName, 
  searchFoods,
  getFoodsByCategory
} from './constants/foodDatabase.js';
import LanguageManager from './managers/LanguageManager.js';

const API_KEY = "ded78740b47643a18aecd38bc430db1a";

// Initialisation du gestionnaire de langue
const languageManager = new LanguageManager();

const InventaireApp = () => {
  // États existants conservés
  const [currentTab, setCurrentTab] = useState('inventaire');
  const [inventoryManager] = useState(() => new InventoryManager());
  const [dietManager] = useState(() => new DietManager());
  const [recipeManager] = useState(() => new RecipeManager(API_KEY));
  const [bonusRecipeManager] = useState(() => new BonusRecipeManager());
  
  // États pour l'inventaire
  const [inventaire, setInventaire] = useState({});
  const [nomAliment, setNomAliment] = useState('');
  const [quantiteAliment, setQuantiteAliment] = useState('');
  const [expirationAliment, setExpirationAliment] = useState('');
  
  // États pour les régimes
  const [regimesActifs, setRegimesActifs] = useState(new Set());
  const [allergiesActives, setAllergiesActives] = useState(new Set());
  
  // États pour les recettes avec nouveau système d'affichage
  const [nomRecette, setNomRecette] = useState('');
  const [recettes, setRecettes] = useState([]);
  const [showRecipes, setShowRecipes] = useState(false);
  const [loading, setLoading] = useState(false);

  // Nouveaux états pour les unités
  const [selectedUnit, setSelectedUnit] = useState('pièce');
  const [availableUnits, setAvailableUnits] = useState(['pièce']);

  // Nouveaux états pour l'intégration
  const [currentLanguage, setCurrentLanguage] = useState(languageManager.getCurrentLanguage());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  // Initialisation des listeners de langue
  useEffect(() => {
    const handleLanguageChange = (newLanguage) => {
      setCurrentLanguage(newLanguage);
    };

    languageManager.addListener(handleLanguageChange);
    return () => languageManager.removeListener(handleLanguageChange);
  }, []);

  // Fonction utilitaire pour les traductions
  const t = (key, params = {}) => languageManager.t(key, params);

  // Fonction améliorée pour obtenir les aliments prédéfinis avec la base de données
  const getEnhancedAlimentsPredefinis = () => {
    const enhancedFoods = {};
    
    // Si une catégorie est sélectionnée, utiliser seulement cette catégorie
    if (selectedCategory) {
      const categoryFoods = getFoodsByCategory(selectedCategory);
      categoryFoods.forEach(food => {
        enhancedFoods[food.emoji] = getFoodName(food, currentLanguage);
      });
    } else {
      // Sinon, prendre quelques aliments de chaque catégorie
      Object.values(FOOD_CATEGORIES).forEach(category => {
        const categoryFoods = PREDEFINED_FOODS[category.id] || [];
        categoryFoods.slice(0, 4).forEach(food => {
          enhancedFoods[food.emoji] = getFoodName(food, currentLanguage);
        });
      });
    }

    // Fallback vers les aliments existants
    const fallbackFoods = {
      "🍎": "Pomme", "🍌": "Banane", "🍊": "Orange", "🍇": "Raisin",
      "🍓": "Fraise", "🥝": "Kiwi", "🥕": "Carotte", "🥒": "Concombre",
      "🍅": "Tomate", "🥬": "Salade", "🥔": "Pomme de terre", "🧅": "Oignon",
      "🥩": "Bœuf", "🍗": "Poulet", "🐟": "Poisson", "🥚": "Œuf",
      "🧀": "Fromage", "🥛": "Lait", "🍞": "Pain", "🍝": "Pâtes",
      "🍚": "Riz", "🥖": "Baguette", "🫖": "Thé", "☕": "Café"
    };

    return Object.keys(enhancedFoods).length > 0 ? enhancedFoods : fallbackFoods;
  };

  const alimentsPredefinis = getEnhancedAlimentsPredefinis();

  // Mise à jour de l'inventaire (conservée)
  const rafraichirInventaire = () => {
    setInventaire(inventoryManager.obtenirInventaire());
  };

  // Chargement initial des données sauvegardées (conservé)
  useEffect(() => {
    const inventoryResult = inventoryManager.chargerInventaire();
    if (inventoryResult.success) {
      console.log('Inventaire chargé:', inventoryResult.message);
    }
    
    const dietResult = dietManager.chargerPreferences();
    if (dietResult.success) {
      console.log('Préférences chargées:', dietResult.message);
      setRegimesActifs(new Set(dietManager.regimesActifs));
      setAllergiesActives(new Set(dietManager.allergiesActives));
    }
    
    rafraichirInventaire();
  }, []);

  // Sauvegarde automatique (conservée)
  useEffect(() => {
    const interval = setInterval(() => {
      inventoryManager.sauvegarderInventaire();
      dietManager.sauvegarderPreferences();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
        // Si on clique en dehors du champ de recherche, vider la recherche
        if (searchQuery && !event.target.closest('.search-container')) {
        setSearchQuery('');
        }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchQuery]);

  // Calcul de date d'expiration intelligente amélioré
  const calculerDateExpirationIntelligente = (nomAliment) => {
    // D'abord chercher dans la base de données
    const foodFromDb = getFoodByName(nomAliment, currentLanguage);
    if (foodFromDb && foodFromDb.shelfLife) {
      const date = new Date();
      date.setDate(date.getDate() + foodFromDb.shelfLife);
      return date.toISOString().split('T')[0];
    }

    // Fallback vers l'ancienne méthode
    const durees = {
      'tres_frais': ['Salade', 'Fraise', 'Cerise', 'Lait', 'Poisson'],
      'frais': ['Pomme', 'Banane', 'Orange', 'Carotte', 'Concombre', 'Tomate', 'Pain'],
      'moyen': ['Fromage', 'Œuf', 'Pomme de terre', 'Oignon'],
      'longue': ['Riz', 'Pâtes', 'Miel', 'Thé', 'Café', 'Beurre']
    };
    
    let jours = 30;
    for (const [categorie, aliments] of Object.entries(durees)) {
      if (aliments.includes(nomAliment)) {
        switch (categorie) {
          case 'tres_frais': jours = 4; break;
          case 'frais': jours = 7; break;
          case 'moyen': jours = 14; break;
          case 'longue': jours = 60; break;
        }
        break;
      }
    }
    
    const date = new Date();
    date.setDate(date.getDate() + jours);
    return date.toISOString().split('T')[0];
  };

  // Nouvelle fonction pour obtenir la bonne icône depuis la base de données
  const obtenirIconeAlimentCorrect = (nomAliment) => {
    // D'abord chercher dans la base de données
    const foodFromDb = getFoodByName(nomAliment, currentLanguage);
    if (foodFromDb && foodFromDb.emoji) {
      return foodFromDb.emoji;
    }

    // Chercher par nom traduit dans toutes les langues
    const allFoods = getAllFoods();
    const matchedFood = allFoods.find(food => 
      Object.values(food.translations).some(translation => 
        translation.toLowerCase() === nomAliment.toLowerCase()
      )
    );
    
    if (matchedFood && matchedFood.emoji) {
      return matchedFood.emoji;
    }

    // Fallback vers l'ancienne méthode de l'inventory manager
    return inventoryManager.obtenirIconeAliment(nomAliment);
  };

  // Gestionnaires d'événements (conservés avec améliorations mineures)
  const ajouterAliment = () => {
    const quantite = parseInt(quantiteAliment) || 1;
    const expiration = expirationAliment || calculerDateExpirationIntelligente(nomAliment);
    
    // Créer l'objet aliment avec l'unité
    const alimentAvecUnite = {
        nom: nomAliment,
        quantite: quantite,
        unite: selectedUnit,
        expiration: expiration
    };

    const result = inventoryManager.ajouterAliment(nomAliment, quantite, expiration);
    
    if (result.success) {
      setNomAliment('');
      setQuantiteAliment('');
      setExpirationAliment('');
      setSearchQuery(''); // Nettoyer la recherche
      setSelectedUnit('pièce');
      setAvailableUnits(['pièce', 'g', 'kg', 'L', 'ml', 'sachet']);
      rafraichirInventaire();
      inventoryManager.sauvegarderInventaire();
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  const ajouterAlimentRapide = (nom) => {
    const dateExpiration = calculerDateExpirationIntelligente(nom);
    const standard = getStandardQuantity(nom, currentLanguage);

    const result = inventoryManager.ajouterAliment(
        nom,
        standard.quantity,
        dateExpiration,
        standard.unit
    );
    
    if (result.success) {
      rafraichirInventaire();
      inventoryManager.sauvegarderInventaire();
      
      // Feedback visuel rapide
      const originalTitle = document.title;
      document.title = `✅ ${nom} ${t('inventory.added') || 'ajouté'}`;
      setTimeout(() => {
        document.title = originalTitle;
      }, 2000);
    } else {
        alert(result.message)
    }
  };

  // Toutes les autres fonctions conservées identiques
  const supprimerAliment = (nom) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer '${nom}' ?`)) {
      inventoryManager.supprimerAliment(nom);
      rafraichirInventaire();
      inventoryManager.sauvegarderInventaire();
    }
  };

  const modifierQuantite = (nom, changement) => {
    const inventaireActuel = inventoryManager.obtenirInventaire();
    if (inventaireActuel[nom]) {
      const nouvelleQuantite = inventaireActuel[nom].quantite + changement;
      if (nouvelleQuantite <= 0) {
        supprimerAliment(nom);
      } else {
        inventoryManager.inventaire[nom].quantite = nouvelleQuantite;
        rafraichirInventaire();
        inventoryManager.sauvegarderInventaire();
      }
    }
  };

  const afficherInventaire = () => {
    const inv = inventoryManager.obtenirInventaire();
    if (Object.keys(inv).length === 0) {
      alert(t('inventory.emptyMessage') || "📦 Votre inventaire est vide.");
      return;
    }
    
    let contenu = (t('inventory.currentInventory') || "📦 VOTRE INVENTAIRE") + "\n" + "=".repeat(30) + "\n\n";
    Object.entries(inv).sort().forEach(([nom, details]) => {
      const icone = obtenirIconeAlimentCorrect(nom);
      const statut = inventoryManager.obtenirStatutExpiration(nom);
      contenu += `${icone} ${nom}\n`;
      contenu += `   📊 ${t('common.quantity') || 'Quantité'}: ${details.quantite}\n`;
      contenu += `   ${statut}\n\n`;
    });
    
    alert(contenu);
  };

  const afficherStatistiques = () => {
    const stats = inventoryManager.obtenirStatistiques();
    let contenu = "📊 STATISTIQUES DE L'INVENTAIRE\n" + "=".repeat(35) + "\n\n";
    contenu += `📦 Nombre d'aliments différents: ${stats.totalAliments}\n`;
    contenu += `📊 Quantité totale: ${stats.totalQuantite}\n`;
    contenu += `🔴 Aliments expirés: ${stats.expires}\n`;
    contenu += `🟡 Expirent bientôt: ${stats.bientotExpires}\n`;
    alert(contenu);
  };

  const afficherExpires = () => {
    const expires = inventoryManager.obtenirAlimentsExpires();
    const bientotExpires = inventoryManager.obtenirAlimentsBientotExpires();
    
    let contenu = "⚠️ ALIMENTS À SURVEILLER\n" + "=".repeat(30) + "\n\n";
    
    if (expires.length > 0) {
      contenu += "🔴 EXPIRÉS:\n";
      expires.forEach(aliment => {
        const icone = obtenirIconeAlimentCorrect(aliment);
        contenu += `   ${icone} ${aliment}\n`;
      });
      contenu += "\n";
    }
    
    if (bientotExpires.length > 0) {
      contenu += "🟡 EXPIRENT BIENTÔT:\n";
      bientotExpires.forEach(([aliment, jours]) => {
        const icone = obtenirIconeAlimentCorrect(aliment);
        contenu += `   ${icone} ${aliment} (dans ${jours} jour(s))\n`;
      });
      contenu += "\n";
    }
    
    if (expires.length === 0 && bientotExpires.length === 0) {
      contenu += "✅ Tous vos aliments sont encore bons !";
    }
    
    alert(contenu);
  };

  const toggleRegime = (regime) => {
    const nouveauxRegimes = new Set(regimesActifs);
    if (nouveauxRegimes.has(regime)) {
      nouveauxRegimes.delete(regime);
      dietManager.retirerRegime(regime);
    } else {
      const added = dietManager.ajouterRegime(regime);
      if (added) {
        nouveauxRegimes.add(regime);
      } else {
        alert(`Le régime ${regime.nom} est incompatible avec vos régimes actuels.`);
        return;
      }
    }
    setRegimesActifs(nouveauxRegimes);
    dietManager.sauvegarderPreferences();
  };

  const toggleAllergie = (allergie) => {
    const nouvellesAllergies = new Set(allergiesActives);
    if (nouvellesAllergies.has(allergie)) {
      nouvellesAllergies.delete(allergie);
      dietManager.retirerAllergie(allergie);
    } else {
      nouvellesAllergies.add(allergie);
      dietManager.ajouterAllergie(allergie);
    }
    setAllergiesActives(nouvellesAllergies);
    dietManager.sauvegarderPreferences();
  };

  const afficherResumePreferences = () => {
    const resume = dietManager.obtenirResumePreferences();
    alert(resume);
  };

  const resetPreferences = () => {
    if (window.confirm(t('diets.resetConfirm') || "Êtes-vous sûr de vouloir réinitialiser toutes vos préférences ?")) {
      dietManager.resetPreferences();
      setRegimesActifs(new Set());
      setAllergiesActives(new Set());
      dietManager.sauvegarderPreferences();
      alert(t('diets.resetSuccess') || "Préférences réinitialisées !");
    }
  };

  const rechercherRecettesOptimisee = async () => {
    const inv = inventoryManager.obtenirInventaire();
    if (Object.keys(inv).length === 0) {
        alert(t('recipes.emptyInventory') || "Ajoutez d'abord des aliments à votre inventaire !");
        return;
    }
    
    setLoading(true);
    
    try {
        // NOUVEAU: Filtrer l'inventaire selon les régimes et allergies
        const inventaireFiltré = filtrerInventaireSelonRegimes(inv);
        const ingredientsCompatibles = Object.keys(inventaireFiltré);
        
        // Afficher les restrictions actives
        const restrictions = afficherRestrictionsActives();
        
        // Vérifier s'il reste des ingrédients après filtrage
        if (ingredientsCompatibles.length === 0) {
        const message = restrictions.length > 0 
            ? `❌ Aucun aliment de votre inventaire n'est compatible avec vos restrictions:\n${restrictions.join('\n')}\n\nVeuillez ajuster vos préférences ou ajouter des aliments compatibles.`
            : "❌ Votre inventaire est vide !";
        alert(message);
        return;
        }
        
        // Informer l'utilisateur du filtrage
        const nombreFiltrés = Object.keys(inv).length - ingredientsCompatibles.length;
        if (nombreFiltrés > 0) {
        console.log(`🎯 ${nombreFiltrés} aliment(s) exclu(s) selon vos préférences alimentaires`);
        console.log(`✅ Recherche avec ${ingredientsCompatibles.length} ingrédients compatibles:`, ingredientsCompatibles);
        }
        
        // Configurer les régimes dans le RecipeManager
        regimesActifs.forEach(regime => {
        recipeManager.ajouterRegime(regime);
        });
        
        // Ajouter les allergies au RecipeManager si cette méthode existe
        if (recipeManager.ajouterAllergie) {
        allergiesActives.forEach(allergie => {
            recipeManager.ajouterAllergie(allergie);
        });
        }
        
        console.log(`🚀 Recherche adaptée avec ${ingredientsCompatibles.length} ingrédients compatibles`);
        
        // Recherche dans l'API Spoonacular avec ingrédients filtrés
        const apiResult = await recipeManager.rechercherRecettesParIngredients(ingredientsCompatibles, 15);
        
        // Recherche dans les recettes bonus avec ingrédients filtrés
        const bonusResults = bonusRecipeManager.searchByIngredients(ingredientsCompatibles);

        // Combiner les résultats
        let allRecipes = [];
        if (apiResult.success && apiResult.recettes.length > 0) {
            allRecipes = [...apiResult.recettes];
        }
        allRecipes = [...bonusResults, ...allRecipes];
        
        console.log(`📊 Total avant filtrage final: ${allRecipes.length} recettes`);
        
        if (allRecipes.length > 0) {
            // Optimisation avec l'inventaire filtré
            const recettesOptimisees = recipeManager.optimiserUtilisationAliments(inventaireFiltré, allRecipes);
            
            // NOUVEAU: Filtrage final des recettes selon les restrictions
            const recettesCompatibles = filtrerRecettesCompatibles(recettesOptimisees);
            
            // Prendre les meilleures recettes
            const recettesFinales = recettesCompatibles.slice(0, 10);
            
            setRecettes(recettesFinales);
            setShowRecipes(true);
            
            // Message de succès avec info sur le filtrage
            let message = `✅ ${recettesFinales.length} recettes trouvées`;
            if (restrictions.length > 0) {
            message += ` (adaptées à vos restrictions)`;
            }
            if (nombreFiltrés > 0) {
            message += `\n🎯 ${nombreFiltrés} aliment(s) exclu(s) de la recherche`;
            }
            
            console.log(message);
            afficherStatistiquesOptimisation(recettesFinales);
            
        } else {
            const message = restrictions.length > 0 
            ? `❌ Aucune recette trouvée compatible avec vos restrictions:\n${restrictions.join('\n')}\n\nEssayez d'ajuster vos préférences ou d'ajouter plus d'aliments compatibles.`
            : "❌ Aucune recette trouvée";
            alert(message);
        }
    } catch (error) {
        console.error('Erreur lors de la recherche adaptée:', error);
        alert(`Erreur lors de la recherche: ${error.message}`);
    } finally {
        setLoading(false);
    }
  };

  //Filtre les recettes selon les régimes et allergies
  const filtrerRecettesCompatibles = (recettes) => {
  if (regimesActifs.size === 0 && allergiesActives.size === 0) {
    return recettes; // Pas de restrictions
  }
  
  const recettesCompatibles = recettes.filter(recette => {
    // Vérifier la compatibilité de la recette avec les régimes
    const compatibleRegimes = verifierCompatibiliteRecetteRegimes(recette);
    
    // Vérifier l'absence d'allergènes dans la recette
    const sansAllergenes = verifierRecetteSansAllergenes(recette);
    
    const compatible = compatibleRegimes && sansAllergenes;
    
    if (!compatible) {
      console.log(`🚫 Recette filtrée: "${recette.title}" (régimes: ${compatibleRegimes}, allergies: ${sansAllergenes})`);
    }
    
    return compatible;
  });
  
  const nombreFiltrees = recettes.length - recettesCompatibles.length;
  if (nombreFiltrees > 0) {
    console.log(`🎯 ${nombreFiltrees} recette(s) filtrée(s) selon vos préférences alimentaires`);
  }
  
  return recettesCompatibles;
  };

  //Vérifie si une recette est compatible avec les régimes actifs
  const verifierCompatibiliteRecetteRegimes = (recette) => {
  if (regimesActifs.size === 0) return true;
  
  // Extraire les ingrédients de la recette
  const ingredients = extraireIngredientsRecette(recette);
  
  // Vérifier chaque ingrédient contre chaque régime
  for (const ingredient of ingredients) {
    if (!dietManager.alimentCompatibleRegimes(ingredient, regimesActifs)) {
      return false;
    }
  }
  
  return true;
  };

  //Vérifie si une recette ne contient pas d'allergènes
  const verifierRecetteSansAllergenes = (recette) => {
  if (allergiesActives.size === 0) return true;
  
  // Extraire les ingrédients de la recette
  const ingredients = extraireIngredientsRecette(recette);
  
  // Vérifier chaque ingrédient contre chaque allergie
  for (const ingredient of ingredients) {
    if (!dietManager.alimentSansAllergenes(ingredient, allergiesActives)) {
      return false;
    }
  }
  
  return true;
  };

  //Extrait les ingrédients d'une recette
  const extraireIngredientsRecette = (recette) => {
  let ingredients = [];
  
  // Différents formats possibles selon la source
  if (recette.usedIngredients) {
    ingredients = [...ingredients, ...recette.usedIngredients.map(ing => ing.name || ing.original || ing)];
  }
  if (recette.missedIngredients) {
    ingredients = [...ingredients, ...recette.missedIngredients.map(ing => ing.name || ing.original || ing)];
  }
  if (recette.extendedIngredients) {
    ingredients = [...ingredients, ...recette.extendedIngredients.map(ing => ing.name || ing.original || ing)];
  }
  if (recette.ingredients) {
    ingredients = [...ingredients, ...recette.ingredients];
  }
  
  // Nettoyer et normaliser
  return ingredients
    .filter(ing => ing && typeof ing === 'string')
    .map(ing => ing.toLowerCase().trim())
    .filter((ing, index, arr) => arr.indexOf(ing) === index); // Supprimer doublons
  };

//  Filtrage adaptatif selon le nombre d'ingrédients et de recettes disponibles
  const appliquerFiltrageAdaptatif = (recettes, nombreIngredients) => {
    if (!recettes || recettes.length === 0) return [];
    
    console.log(`🎯 Filtrage adaptatif: ${recettes.length} recettes à filtrer`);
    
    // Analyse des scores disponibles
    const scores = recettes.map(r => r.utilisationScore || r.usedIngredientCount || 0);
    const scoreMax = Math.max(...scores);
    const scoreMoyen = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    console.log(`📊 Scores - Max: ${scoreMax}, Moyen: ${Math.round(scoreMoyen * 10) / 10}`);
    
    let seuil = 1; // Seuil par défaut très permissif
    
    // Ajuster le seuil selon la situation
    if (nombreIngredients >= 8 && scoreMax >= 4) {
        seuil = 2; // Plus strict si beaucoup d'ingrédients
    } else if (nombreIngredients >= 5 && scoreMax >= 3) {
        seuil = 2;
    } else if (scoreMax >= 2) {
        seuil = 1; // Garder même les recettes avec 1 ingrédient si c'est tout ce qu'on a
    }
    
    // Appliquer le filtrage
    let recettesFiltrees = recettes.filter(recette => {
        const score = recette.utilisationScore || recette.usedIngredientCount || 0;
        return score >= seuil || recette.missedIngredientCount === 0; // Bonus pour les recettes parfaites
    });
    
    console.log(`✂️ Après filtrage (seuil ${seuil}): ${recettesFiltrees.length} recettes`);
    
    // Si toujours trop peu de recettes, être encore plus permissif
    if (recettesFiltrees.length < 5) {
        console.log("🔓 Filtrage très permissif activé...");
        recettesFiltrees = recettes.slice(0, Math.min(8, recettes.length)); // Prendre les 8 meilleures
    }
    
    // Garantir un minimum de recettes
    if (recettesFiltrees.length < 3 && recettes.length > 0) {
        console.log("🚨 Garantie minimum: prendre au moins 3 recettes");
        recettesFiltrees = recettes.slice(0, Math.min(6, recettes.length));
    }
    
    console.log(`🎯 FINAL: ${recettesFiltrees.length} recettes sélectionnées`);
    return recettesFiltrees;
  };

  // Filtre les recettes pour ne garder que celles de bonne qualité
  const filtrerRecettesQualite = (recettes, nombreIngredients) => {
    if (!recettes || recettes.length === 0) return [];
    
    // Définir les critères de qualité selon le nombre d'ingrédients disponibles
    let seuilMinimum = 1;
    if (nombreIngredients >= 8) seuilMinimum = 3;
    else if (nombreIngredients >= 5) seuilMinimum = 2;
    else if (nombreIngredients >= 3) seuilMinimum = 2;
    
    // Filtrer les recettes qui utilisent au moins le seuil minimum d'ingrédients
    const recettesQualite = recettes.filter(recette => {
        const utilisation = recette.utilisationScore || recette.usedIngredientCount || 0;
        return utilisation >= seuilMinimum;
    });
    
    console.log(`📊 Filtrage qualité: ${recettesQualite.length}/${recettes.length} recettes gardées (seuil: ${seuilMinimum} ingrédients)`);
    
    // Si trop peu de recettes de qualité, assouplir les critères
    if (recettesQualite.length < 3 && seuilMinimum > 1) {
        const recettesAssouplies = recettes.filter(recette => {
        const utilisation = recette.utilisationScore || recette.usedIngredientCount || 0;
        return utilisation >= seuilMinimum - 1;
        });
        console.log(`📊 Critères assouplis: ${recettesAssouplies.length} recettes avec seuil ${seuilMinimum - 1}`);
        return recettesAssouplies;
    }
    
    return recettesQualite;
  };

    // Affiche les statistiques d'optimisation
  const afficherStatistiquesOptimisation = (recettes, stats) => {
    if (recettes.length === 0) return;
    
    const utilisationMoyenne = recettes.reduce((sum, r) => sum + (r.utilisationScore || 0), 0) / recettes.length;
    const meilleureUtilisation = Math.max(...recettes.map(r => r.utilisationScore || 0));
    const recettesParfaites = recettes.filter(r => (r.missedIngredientCount || 0) === 0).length;
    
    console.log(`
    📊 STATISTIQUES D'OPTIMISATION
    ================================
    🎯 Recettes sélectionnées: ${recettes.length}
    ⭐ Utilisation moyenne: ${Math.round(utilisationMoyenne * 10) / 10} ingrédients
    🔥 Meilleure utilisation: ${meilleureUtilisation} ingrédients
    ✅ Recettes parfaites (0 manquant): ${recettesParfaites}
    ${stats ? `📈 Stats API: ${stats.totalRecettes} trouvées, moyenne ${stats.moyenneIngredientsUtilises}` : ''}
    `);
    
    // Affichage discret pour l'utilisateur
    setTimeout(() => {
        const notification = document.createElement('div');
        notification.style.cssText = `
        position: fixed; bottom: 20px; right: 20px; 
        background: ${palette.success}; color: white;
        padding: 12px 20px; border-radius: 12px;
        font-size: 14px; font-weight: 600;
        box-shadow: ${palette.shadows.modal}; z-index: 1001;
        animation: slideInRight 0.3s ease;
        `;
        notification.innerHTML = `
        🎯 ${recettes.length} recettes optimisées<br>
        <small>Moyenne: ${Math.round(utilisationMoyenne * 10) / 10} ingrédients utilisés</small>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => document.body.removeChild(notification), 300);
        }, 4000);
    }, 500);
  };

  const rechercherRecettesParNom = async () => {
    if (!nomRecette.trim()) {
        alert(t('recipes.enterRecipeName') || "Veuillez saisir le nom d'une recette.");
        return;
    }
    
    setLoading(true);
    
    regimesActifs.forEach(regime => {
        recipeManager.ajouterRegime(regime);
    });
    
    // Recherche dans l'API
    const apiResult = await recipeManager.rechercherRecettesParNom(nomRecette, 6);
    
    // Recherche dans les recettes bonus
    const bonusResults = bonusRecipeManager.searchByName(nomRecette);
    
    // Combiner les résultats
    let allRecipes = [];
    if (apiResult.success && apiResult.recettes.length > 0) {
        allRecipes = [...apiResult.recettes];
    }
    allRecipes = [...bonusResults, ...allRecipes];
    
    if (allRecipes.length > 0) {
        setRecettes(allRecipes);
        setShowRecipes(true);
    } else {
        alert("Aucune recette trouvée");
    }
    setLoading(false);
  };

  const afficherAlimentsPrioritaires = () => {
    const expires = inventoryManager.obtenirAlimentsExpires();
    const bientotExpires = inventoryManager.obtenirAlimentsBientotExpires(3);
    
    let contenu = "⏰ ALIMENTS À UTILISER EN PRIORITÉ\n" + "=".repeat(40) + "\n\n";
    
    if (expires.length > 0) {
      contenu += "🔴 URGENCE MAXIMALE (expirés):\n";
      expires.forEach(aliment => {
        const icone = obtenirIconeAlimentCorrect(aliment);
        contenu += `   ${icone} ${aliment}\n`;
      });
      contenu += "\n";
    }
    
    if (bientotExpires.length > 0) {
      contenu += "🟡 À UTILISER RAPIDEMENT:\n";
      bientotExpires.forEach(([aliment, jours]) => {
        const icone = obtenirIconeAlimentCorrect(aliment);
        contenu += `   ${icone} ${aliment} (dans ${jours} jour(s))\n`;
      });
      contenu += "\n";
    }
    
    if (expires.length === 0 && bientotExpires.length === 0) {
      contenu += "✅ Aucun aliment urgent à utiliser !";
    } else {
      contenu += "💡 Conseil: Utilisez la recherche optimisée de recettes\n";
      contenu += "pour des suggestions qui priorisent ces aliments !";
    }
    
    alert(contenu);
  };

  const suggestionsAchats = () => {
    if (regimesActifs.size === 0) {
      alert("Configurez d'abord vos préférences alimentaires pour obtenir des suggestions personnalisées !");
      return;
    }
    
    let contenu = "💡 SUGGESTIONS D'ACHATS\n" + "=".repeat(30) + "\n\n";
    
    regimesActifs.forEach(regime => {
      const suggestions = dietManager.obtenirSuggestionsAliments(regime);
      contenu += `${regime.emoji} ${regime.nom}:\n`;
      suggestions.slice(0, 5).forEach(suggestion => {
        contenu += `   • ${suggestion}\n`;
      });
      contenu += "\n";
    });
    
    alert(contenu);
  };

  const viderInventaire = () => {
    const inventaireActuel = inventoryManager.obtenirInventaire();
    const nombreAliments = Object.keys(inventaireActuel).length;
    
    if (nombreAliments === 0) {
        alert(t('inventory.alreadyEmpty') || "📦 L'inventaire est déjà vide !");
        return;
    }
    
    // Message de confirmation personnalisé selon la langue
    const confirmMessage = 
        t('inventory.clearConfirm', { count: nombreAliments }) || 
        `⚠️ Êtes-vous sûr de vouloir supprimer TOUS les ${nombreAliments} aliment(s) de votre inventaire ? Cette action est irréversible !`;
    
    if (window.confirm(confirmMessage)) {
        const result = inventoryManager.viderInventaire();
        
        if (result.success) {
            rafraichirInventaire();
            // Feedback visuel rapide
            const originalTitle = document.title;
            document.title = `🗑️ ${result.nombreAliments} aliments supprimés`;
            setTimeout(() => {
                document.title = originalTitle;
            }, 3000);
            
            alert(result.message);
        } else {
            alert(result.message);
        }
    }
  };

  // Filtre l'inventaire selon les régimes et allergies actifs
  const filtrerInventaireSelonRegimes = (inventaire) => {
  if (regimesActifs.size === 0 && allergiesActives.size === 0) {
    return inventaire; // Pas de restrictions
  }
  
  const inventaireFiltré = {};
  
  Object.entries(inventaire).forEach(([nomAliment, details]) => {
    // Vérifier si l'aliment est compatible avec les régimes
    const compatibleRegimes = dietManager.alimentCompatibleRegimes(nomAliment, regimesActifs);
    
    // Vérifier si l'aliment ne contient pas d'allergènes
    const sansAllergenes = dietManager.alimentSansAllergenes(nomAliment, allergiesActives);
    
    if (compatibleRegimes && sansAllergenes) {
      inventaireFiltré[nomAliment] = details;
    } else {
      console.log(`🚫 Aliment filtré: ${nomAliment} (régimes: ${compatibleRegimes}, allergies: ${sansAllergenes})`);
    }
  });
  
  const nombreFiltres = Object.keys(inventaire).length - Object.keys(inventaireFiltré).length;
  if (nombreFiltres > 0) {
    console.log(`🎯 Inventaire filtré: ${nombreFiltres} aliment(s) exclus selon vos préférences`);
  }
  
  return inventaireFiltré;
  };

// Obtient la liste des ingrédients compatibles pour la recherche
  const obtenirIngredientsCompatibles = () => {
  const inventaire = inventoryManager.obtenirInventaire();
  const inventaireFiltré = filtrerInventaireSelonRegimes(inventaire);
  return Object.keys(inventaireFiltré);
  };

// Affiche un résumé des restrictions actives
  const afficherRestrictionsActives = () => {
  const restrictions = [];
  
  if (regimesActifs.size > 0) {
    const regimesList = Array.from(regimesActifs).map(r => r.nom).join(', ');
    restrictions.push(`🥗 Régimes: ${regimesList}`);
  }
  
  if (allergiesActives.size > 0) {
    const allergiesList = Array.from(allergiesActives).map(a => a.nom).join(', ');
    restrictions.push(`⚠️ Allergies: ${allergiesList}`);
  }
  
  if (restrictions.length > 0) {
    console.log(`🎯 Restrictions actives:\n${restrictions.join('\n')}`);
    return restrictions;
  }
  
  return [];
  };

  // Nouveaux composants pour les fonctionnalités ajoutées
  const renderLanguageSelector = () => (
    <div style={styles.languageSelector}>
      <button
        style={styles.languageButton}
        onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
      >
        🌐 {languageManager.getAvailableLanguages().find(lang => lang.code === currentLanguage)?.flag || '🇫🇷'}
      </button>
      
      {showLanguageDropdown && (
        <div style={styles.languageDropdown}>
          {languageManager.getAvailableLanguages().map(lang => (
            <div
              key={lang.code}
              style={styles.languageOption}
              onClick={() => {
                languageManager.setLanguage(lang.code);
                setShowLanguageDropdown(false);
              }}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderFoodSearch = () => {
    // Obtenir les résultats de recherche si il y a une requête
    const searchResults = searchQuery && searchQuery.length > 1 
        ? searchFoods(searchQuery, currentLanguage) 
        : [];

    return (
        <div className="search-container" style={{ position: 'relative', marginBottom: '15px' }}>
        <input
            style={styles.input}
            type="text"
            placeholder={t('inventory.searchFood') || "🔍 Rechercher un aliment..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        {/* Afficher les résultats de recherche */}
        {searchQuery && searchQuery.length > 1 && (
            <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: palette.bgCard,
            border: `1px solid ${palette.borders.light}`,
            borderRadius: '12px',
            boxShadow: palette.shadows.modal,
            zIndex: 1000,
            maxHeight: '200px',
            overflowY: 'auto',
            }}>
            {searchResults.length > 0 ? (
                searchResults.map((food, index) => {
                const foodName = getFoodName(food, currentLanguage);
                const standard = getStandardQuantity(foodName, currentLanguage);
                
                return (
                    <div
                    key={index}
                    style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: palette.textPrimary,
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        borderBottom: index < searchResults.length - 1 ? `1px solid ${palette.borders.light}` : 'none',
                    }}
                    onClick={() => {
                        ajouterAlimentRapide(foodName);
                        setSearchQuery(''); // Vider la recherche après ajout
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = palette.bgSecondary;
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                    }}
                    >
                    <span style={{ fontSize: '18px' }}>{food.emoji}</span>
                    <span style={{ flex: 1 }}>{foodName}</span>
                    <span style={{ 
                        fontSize: '11px', 
                        color: palette.primary,
                        backgroundColor: palette.bgSecondary,
                        padding: '2px 6px',
                        borderRadius: '6px',
                        fontWeight: '600'
                    }}>
                        +{standard.quantity} {standard.unit}
                    </span>
                    </div>
                );
                })
            ) : (
                <div style={{
                padding: '16px',
                textAlign: 'center',
                color: palette.textSecondary,
                fontSize: '14px'
                }}>
                {t('inventory.noResults') || `Aucun résultat pour "${searchQuery}"`}
                </div>
            )}
            </div>
        )}
        </div>
    );
    };

  const renderCategoryFilter = () => (
    <div style={styles.categoryTabs}>
      <button
        style={{
          ...styles.categoryTab,
          ...(selectedCategory === '' ? styles.activeCategoryTab : {})
        }}
        onClick={() => setSelectedCategory('')}
      >
        🍽️ Toutes
      </button>
      {Object.values(FOOD_CATEGORIES).map(category => (
        <button
          key={category.id}
          style={{
            ...styles.categoryTab,
            ...(selectedCategory === category.id ? styles.activeCategoryTab : {})
          }}
          onClick={() => setSelectedCategory(category.id)}
        >
          {category.icon} {category.translations[currentLanguage]}
        </button>
      ))}
    </div>
  );

  // Rendu des composants d'onglets (structure conservée avec améliorations)
  const renderInventaireTab = () => (
    <div style={styles.tabContent}>
      {/* Header avec sélecteur de langue */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>📦 {t('inventory.title') || 'Gestion Inventaire'}</h1>
        <p style={styles.headerSubtitle}>{t('inventory.subtitle') || 'Optimisez votre stock alimentaire'}</p>
        {renderLanguageSelector()}
      </div>

      {/* Recherche et filtres */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>🔍 Recherche</h2>
        {renderFoodSearch()}
      </div>

      {/* Grille d'aliments prédéfinis avec filtres */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>🍎 {t('inventory.popularFoods') || 'Aliments populaires'}</h2>
        {renderCategoryFilter()}
        <div style={styles.grid}>
            {Object.entries(alimentsPredefinis).map(([icone, nom]) => {
                // Obtenir la quantité standard pour cet aliment
                const standard = getStandardQuantity(nom, currentLanguage);
                const tooltipText = `Ajouter ${standard.quantity} ${standard.unit}`;
                
                return (
                <button
                    key={nom}
                    style={styles.gridItem}
                    onClick={() => ajouterAlimentRapide(nom)}
                    onMouseEnter={(e) => Object.assign(e.target.style, styles.gridItemHover)}
                    onMouseLeave={(e) => {
                    e.target.style.transform = 'none';
                    e.target.style.boxShadow = palette.shadows.sm;
                    e.target.style.borderColor = palette.borders.light;
                    }}
                    title={tooltipText}
                >
                    <span style={styles.gridIcon}>{icone}</span>
                    <span style={styles.gridText}>{nom}</span>
                    {/* Affichage clair de ce qui sera ajouté */}
                    <span style={{
                    fontSize: '10px',
                    color: palette.primary,
                    marginTop: '4px',
                    fontWeight: '600',
                    backgroundColor: palette.bgSecondary,
                    padding: '2px 6px',
                    borderRadius: '8px'
                    }}>
                    +{standard.quantity} {standard.unit}
                    </span>
                </button>
                );
            })}
            </div>
      </div>

      {/* Ajout d'aliment */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>➕ {t('inventory.addFood') || 'Ajouter un aliment'}</h2>
        <input
          style={styles.input}
          type="text"
          placeholder={t('inventory.foodName') || "🍎 Nom de l'aliment"}
          value={nomAliment}
          onChange={(e) => {
            const newValue = e.target.value;
            setNomAliment(newValue);
            
            if (!newValue.trim()) {
                setSelectedUnit('pièce');
                setAvailableUnits(['pièce', 'g', 'kg', 'L', 'ml', 'sachet']);
            } else {
                updateAvailableUnits(newValue);
            }
          }}
        />
        <div style={styles.inputRow}>
          <input
            style={styles.input}
            type="number"
            placeholder={t('inventory.quantity') || "📊 Quantité"}
            value={quantiteAliment}
            onChange={(e) => {
                setQuantiteAliment(e.target.value);
                if (nomAliment) {
                    updateAvailableUnits(nomAliment);
                }
            }}
            min="0.1"
            step="0.1"
          />

          {/* Sélecteur d'unité */}
          <select
              style={{
              ...styles.input,
              cursor: 'pointer'
              }}
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
          >
              {availableUnits.map(unit => (
              <option key={unit} value={unit}>
                  {unit}
              </option>
              ))}
          </select>
          
          <input
            style={styles.input}
            type="date"
            placeholder={t('inventory.expiration') || "📅 Expiration"}
            value={expirationAliment}
            onChange={(e) => setExpirationAliment(e.target.value)}
          />
        </div>
        <button 
          style={{...styles.button, ...styles.successButton}} 
          onClick={ajouterAliment}
        >
          ✅ {t('inventory.addToInventory') || 'Ajouter à l\'inventaire'}
        </button>
      </div>

      {/* Inventaire actuel */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>📦 {t('inventory.currentInventory') || 'Inventaire actuel'}</h2>
        {Object.keys(inventaire).length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📦</div>
            <div style={styles.emptyTitle}>{t('inventory.empty') || 'Inventaire vide'}</div>
            <div style={styles.emptyText}>Ajoutez des aliments pour commencer !</div>
          </div>
        ) : (
          <div style={styles.inventoryGrid}>
            {Object.entries(inventaire).map(([nom, details]) => {
              // Obtenir la quantité standard pour cet aliment
              const standard = getStandardQuantity(nom, currentLanguage);
                
              return (
              <div key={nom} style={styles.inventoryItem}>
                <div style={styles.inventoryInfo}>
                  <div style={styles.inventoryName}>
                    <span style={styles.inventoryIcon}>{obtenirIconeAlimentCorrect(nom)}</span>
                    {nom}
                  </div>
                  <div style={styles.quantityControls}>
                    <button 
                      style={styles.quantityButton}
                      onClick={() => modifierQuantite(nom, -standard.quantity)}
                    >
                      ➖
                    </button>
                    <span style={styles.inventoryQuantity}>
                      {t('common.quantity') || 'Quantité'}: {details.quantite}{standard.unit}
                    </span>
                    <button 
                      style={styles.quantityButton}
                      onClick={() => modifierQuantite(nom, standard.quantity)}
                    >
                      ➕
                    </button>
                  </div>
                  <div style={styles.inventoryExpiry}>
                    {inventoryManager.obtenirStatutExpiration(nom)}
                  </div>
                </div>
                <button 
                  style={styles.deleteButton}
                  onClick={() => supprimerAliment(nom)}
                >
                  🗑️
                </button>
              </div>
            );
          })}
          </div>
        )}
      </div>
      {/* Actions rapides */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>🎯 Actions rapides</h2>
        <div style={styles.buttonRow}>
            <button 
            style={{...styles.button, ...styles.infoButton}} 
            onClick={afficherInventaire}
            >
            📋 Voir inventaire
            </button>
            <button 
            style={{...styles.button, ...styles.dangerButton}} 
            onClick={afficherExpires}
            >
            ⚠️ Aliments expirés
            </button>
            <button 
            style={{...styles.button, ...styles.warningButton}} 
            onClick={afficherStatistiques}
            >
            📊 Statistiques
            </button>
        </div>
        
        {/* Bouton pour vider l'inventaire - séparé pour plus de visibilité */}
        <div style={{ marginTop: '16px' }}>
            <button 
            style={{
                ...styles.button, 
                ...styles.dangerButton,
                backgroundColor: '#dc2626', // Rouge plus intense
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
            }} 
            onClick={viderInventaire}
            >
            🗑️ {t('inventory.clearAll') || 'Vider tout l\'inventaire'}
            </button>
        </div>
      </div>
    </div>
  );

  const renderRegimesTab = () => (
    <div style={styles.tabContent}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>🥗 {t('diets.title') || 'Préférences Alimentaires'}</h1>
        <p style={styles.headerSubtitle}>{t('diets.subtitle') || 'Configurez vos régimes et allergies'}</p>
        {renderLanguageSelector()}
      </div>

      {/* Affichage des catégories d'aliments */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>🍽️ {t('diets.foodCategories') || 'Catégories d\'aliments'}</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '15px',
          marginTop: '15px',
        }}>
          {Object.values(FOOD_CATEGORIES).map(category => (
            <div key={category.id} style={{
              backgroundColor: palette.bgSecondary,
              borderRadius: '12px',
              padding: '15px',
              border: `1px solid ${palette.borders.light}`,
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '10px',
              }}>
                <span style={{ fontSize: '20px' }}>{category.icon}</span>
                <span style={{ fontWeight: '600', color: palette.textPrimary }}>
                  {category.translations[currentLanguage]}
                </span>
              </div>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '5px',
              }}>
                {(PREDEFINED_FOODS[category.id] || []).slice(0, 4).map((food, index) => (
                  <span key={index} style={{
                    fontSize: '11px',
                    backgroundColor: palette.bgCard,
                    padding: '4px 8px',
                    borderRadius: '8px',
                    border: `1px solid ${palette.borders.light}`,
                    color: palette.textSecondary,
                  }}>
                    {food.emoji} {getFoodName(food, currentLanguage)}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.buttonRow}>
      {/* Régimes alimentaires */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>🍽️ {t('diets.dietTypes') || 'Régimes alimentaires'}</h2>
        <div style={styles.checkboxContainer}>
          {Object.values(RegimeAlimentaire).map(regime => (
            <div
              key={regime.value}
              style={styles.checkboxRow}
              onClick={() => toggleRegime(regime)}
              onMouseEnter={(e) => Object.assign(e.target.style, styles.checkboxRowHover)}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = 'transparent';
              }}
            >
              <div style={{
                ...styles.checkbox,
                ...(regimesActifs.has(regime) ? styles.checkboxActive : {})
              }}>
                {regimesActifs.has(regime) && <span style={styles.checkmark}>✓</span>}
              </div>
              <div style={styles.checkboxContent}>
                <div style={styles.checkboxTitle}>
                  {regime.emoji} {regime.nom}
                </div>
                <div style={styles.checkboxDescription}>
                  {regime.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Allergies */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>⚠️ {t('diets.allergies') || 'Allergies et intolérances'}</h2>
        <div style={styles.checkboxContainer}>
          {Object.values(Allergie).map(allergie => (
            <div
              key={allergie.value}
              style={styles.checkboxRow}
              onClick={() => toggleAllergie(allergie)}
              onMouseEnter={(e) => Object.assign(e.target.style, styles.checkboxRowHover)}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = 'transparent';
              }}
            >
              <div style={{
                ...styles.checkbox,
                ...(allergiesActives.has(allergie) ? styles.checkboxActive : {})
              }}>
                {allergiesActives.has(allergie) && <span style={styles.checkmark}>✓</span>}
              </div>
              <div style={styles.checkboxContent}>
                <div style={styles.checkboxTitle}>
                  {allergie.emoji} {allergie.nom}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
          </div>
      {/* Actions */}
      <div style={styles.buttonRow}>
        <button 
          style={{...styles.button, ...styles.successButton}} 
          onClick={afficherResumePreferences}
        >
          📄 {t('diets.summary') || 'Voir résumé'}
        </button>
        <button 
          style={{...styles.button, ...styles.dangerButton}} 
          onClick={resetPreferences}
        >
          🔄 {t('diets.reset') || 'Réinitialiser'}
        </button>
      </div>
    </div>
  );

  const renderRecettesTab = () => (
    <div style={styles.tabContent}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>🍽️ {t('recipes.title') || 'Suggestions de Recettes'}</h1>
        <p style={styles.headerSubtitle}>{t('recipes.subtitle') || 'Trouvez des recettes avec vos ingrédients'}</p>
        {renderLanguageSelector()}
      </div>

      {/* Indicateur des restrictions */}
      {renderRestrictionsIndicator()}

      {/* Recherche optimisée */}
      <div style={styles.infoCard}>
        <div style={styles.infoCardIcon}>🎯</div>
        <h2 style={styles.infoCardTitle}>
            {t('recipes.optimizedSearch') || 'Recherche optimisée'}
            {(regimesActifs.size > 0 || allergiesActives.size > 0) && (
            <span style={{
                fontSize: '12px',
                backgroundColor: palette.success,
                color: palette.textWhite,
                padding: '4px 8px',
                borderRadius: '8px',
                marginLeft: '10px'
            }}>
                Adaptée
            </span>
            )}
        </h2>
        <p style={styles.infoCardDescription}>
            {(regimesActifs.size > 0 || allergiesActives.size > 0) 
            ? (t('recipes.optimizedDescAdapted') || 'Trouve les meilleures recettes compatibles avec vos préférences alimentaires et vos ingrédients disponibles.')
            : (t('recipes.optimizedDesc') || 'Trouve les meilleures recettes avec vos ingrédients disponibles. Priorise les aliments qui expirent bientôt !')
            }
        </p>
        <button 
            style={{...styles.button, ...styles.successButton}} 
            onClick={rechercherRecettesOptimisee}
            disabled={loading}
        >
            {loading ? 
            (t('recipes.searching') || "🔄 Recherche...") : 
            (t('recipes.searchOptimized') || "🚀 Recherche adaptée")
            }
        </button>
      </div>

      {/* Recherche par nom */}
      <div style={styles.infoCard}>
        <div style={styles.infoCardIcon}>🔍</div>
        <h2 style={styles.infoCardTitle}>{t('recipes.searchByName') || 'Recherche par nom'}</h2>
        <input
          style={styles.input}
          type="text"
          placeholder={t('recipes.searchByNameDesc') || "🍝 Nom de la recette (ex: pasta, pizza, soup...)"}
          value={nomRecette}
          onChange={(e) => setNomRecette(e.target.value)}
        />
        <button 
          style={{...styles.button, ...styles.warningButton}} 
          onClick={rechercherRecettesParNom}
          disabled={loading}
        >
          {loading ? 
            (t('recipes.searching') || "🔄 Recherche...") : 
            (t('recipes.search') || "🔍 Rechercher")
          }
        </button>
      </div>

      {/* Actions utiles */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>💡 {t('recipes.usefulActions') || 'Actions utiles'}</h2>
        <div style={styles.buttonRow}>
          <button 
            style={{...styles.button, ...styles.dangerButton}} 
            onClick={afficherAlimentsPrioritaires}
          >
            ⏰ {t('recipes.priorityFoods') || 'Aliments à utiliser'}
          </button>
          <button 
            style={{...styles.button, ...styles.infoButton}} 
            onClick={suggestionsAchats}
          >
            💡 {t('recipes.shoppingSuggestions') || 'Suggestions d\'achats'}
          </button>
        </div>
      </div>

      {/* Suggestions d'aliments de saison */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>🌟 {t('recipes.trending') || 'Aliments suggérés'}</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
          gap: '10px',
          marginTop: '15px',
        }}>
          {getAllFoods().slice(0, 12).map((food, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '10px',
                backgroundColor: palette.bgSecondary,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: `1px solid ${palette.borders.light}`,
              }}
              onClick={() => ajouterAlimentRapide(getFoodName(food, currentLanguage))}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.backgroundColor = palette.bgCard;
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.backgroundColor = palette.bgSecondary;
              }}
            >
              <span style={{ fontSize: '18px', marginBottom: '4px' }}>{food.emoji}</span>
              <span style={{ 
                fontSize: '10px', 
                textAlign: 'center', 
                color: palette.textSecondary,
                lineHeight: '1.2',
              }}>
                {getFoodName(food, currentLanguage)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRestrictionsIndicator = () => {
  const totalRestrictions = regimesActifs.size + allergiesActives.size;
  
  if (totalRestrictions === 0) return null;
  
  return (
    <div style={{
      backgroundColor: palette.info,
      color: palette.textWhite,
      padding: '12px 16px',
      borderRadius: '12px',
      marginBottom: '16px',
      fontSize: '14px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }}>
      <span style={{ fontSize: '16px' }}>🎯</span>
      <div>
        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
          Restrictions actives ({totalRestrictions})
        </div>
        <div style={{ fontSize: '12px', opacity: '0.9' }}>
          {regimesActifs.size > 0 && (
            <span>
              🥗 {Array.from(regimesActifs).map(r => r.nom).join(', ')}
            </span>
          )}
          {regimesActifs.size > 0 && allergiesActives.size > 0 && ' • '}
          {allergiesActives.size > 0 && (
            <span>
              ⚠️ {Array.from(allergiesActives).map(a => a.nom).join(', ')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
  };

  // Fonction pour mettre à jour les unités disponibles quand l'aliment change
  const updateAvailableUnits = (foodName) => {
    if (!foodName) return;
  
    const suggestion = getSuggestedUnit(foodName, parseInt(quantiteAliment) || 1, currentLanguage);
    setSelectedUnit(suggestion.unit);
    const uniqueUnits = [...new Set(suggestion.availableUnits || ['pièce'])];
    setAvailableUnits(uniqueUnits);
  
    // Suggérer aussi une quantité réaliste
    if (!quantiteAliment) {
      setQuantiteAliment(suggestion.quantity.toString());
    }
  };

  return (
    <div style={styles.container}>
      {/* Navigation avec traductions */}
      <div style={styles.navigation}>
        <button
          style={{
            ...styles.navButton, 
            ...(currentTab === 'inventaire' ? styles.activeNavButton : {})
          }}
          onClick={() => setCurrentTab('inventaire')}
        >
          📦 {t('nav.inventory') || 'Inventaire'}
        </button>
        <button
          style={{
            ...styles.navButton, 
            ...(currentTab === 'regimes' ? styles.activeNavButton : {})
          }}
          onClick={() => setCurrentTab('regimes')}
        >
          🥗 {t('nav.diets') || 'Régimes'}
        </button>
        <button
          style={{
            ...styles.navButton, 
            ...(currentTab === 'recettes' ? styles.activeNavButton : {})
          }}
          onClick={() => setCurrentTab('recettes')}
        >
          🍽️ {t('nav.recipes') || 'Recettes'}
        </button>
      </div>

      {/* Contenu des onglets */}
      <div style={styles.content}>
        {currentTab === 'inventaire' && renderInventaireTab()}
        {currentTab === 'regimes' && renderRegimesTab()}
        {currentTab === 'recettes' && renderRecettesTab()}
      </div>

      {/* Affichage des recettes (comportement original conservé) */}
      {showRecipes && (
        <RecipeDisplayComponent
          recipes={recettes}
          inventaire={inventaire}
          recipeManager={recipeManager}
          onClose={() => setShowRecipes(false)}
        />
      )}
    </div>
  );
};

export default InventaireApp;
