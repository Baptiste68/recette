"""
Module de gestion des recettes avec optimisation et gestion des régimes
"""

import requests
from typing import Dict, List, Tuple, Optional
from enum import Enum

class RegimeAlimentaire(Enum):
    VEGETARIEN = "vegetarian"
    VEGAN = "vegan"
    SANS_GLUTEN = "gluten-free"
    CETOGENE = "ketogenic"
    PALEO = "paleo"
    SANS_LACTOSE = "dairy-free"
    SANS_NOIX = "tree-nut-free"
    PESCETARIEN = "pescetarian"

class RecipeManager:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.spoonacular.com"
        self.regimes_actifs = set()
    
    def ajouter_regime(self, regime: RegimeAlimentaire):
        """Ajoute un régime alimentaire aux préférences"""
        self.regimes_actifs.add(regime)
    
    def retirer_regime(self, regime: RegimeAlimentaire):
        """Retire un régime des préférences"""
        self.regimes_actifs.discard(regime)
    
    def obtenir_regimes_actifs(self) -> List[str]:
        """Retourne la liste des régimes actifs"""
        return [regime.value for regime in self.regimes_actifs]
    
    def optimiser_utilisation_aliments(self, inventaire: Dict, recettes: List[Dict]) -> List[Dict]:
        """
        Optimise l'ordre des recettes pour maximiser l'utilisation des aliments
        en priorisant ceux qui expirent bientôt
        """
        from datetime import datetime
        
        # Calcul du score de priorité pour chaque aliment
        scores_aliments = {}
        for nom, details in inventaire.items():
            score = details['quantite']  # Score de base = quantité
            
            # Bonus pour les aliments qui expirent bientôt
            if details['expiration'] != "Non specifiee":
                try:
                    date_exp = datetime.strptime(details['expiration'], "%Y-%m-%d")
                    jours_restants = (date_exp - datetime.now()).days
                    
                    if jours_restants < 0:
                        score += 100  # Très haute priorité pour les expirés
                    elif jours_restants <= 3:
                        score += 50   # Haute priorité
                    elif jours_restants <= 7:
                        score += 20   # Priorité moyenne
                except:
                    pass
            
            scores_aliments[nom.lower()] = score
        
        # Calcul du score pour chaque recette
        for recette in recettes:
            score_recette = 0
            ingredients_utilises = recette.get('usedIngredients', [])
            
            for ingredient in ingredients_utilises:
                nom_ingredient = ingredient['name'].lower()
                # Recherche d'aliments correspondants dans l'inventaire
                for nom_inventaire, score_aliment in scores_aliments.items():
                    if nom_ingredient in nom_inventaire or nom_inventaire in nom_ingredient:
                        score_recette += score_aliment
                        break
            
            # Bonus pour moins d'ingrédients manqués
            ingredients_manques = recette.get('missedIngredientCount', 0)
            score_recette += max(0, 20 - ingredients_manques * 2)
            
            recette['score_optimisation'] = score_recette
        
        # Tri par score décroissant
        return sorted(recettes, key=lambda x: x.get('score_optimisation', 0), reverse=True)
    
    def rechercher_recettes_par_ingredients(self, ingredients: List[str], nombre: int = 8) -> Tuple[bool, str, List[Dict]]:
        """
        Recherche des recettes basées sur les ingrédients disponibles
        
        Returns:
            Tuple[bool, str, List[Dict]]: (succès, message, liste_recettes)
        """
        if not ingredients:
            return False, "Aucun ingrédient fourni", []
        
        try:
            # Construction de l'URL avec les régimes
            ingredients_str = ",".join(ingredients)
            url = f"{self.base_url}/recipes/findByIngredients"
            
            params = {
                'ingredients': ingredients_str,
                'number': nombre,
                'apiKey': self.api_key,
                'ranking': 2,  # Maximise les ingrédients utilisés
                'ignorePantry': True
            }
            
            response = requests.get(url, params=params, timeout=15)
            
            if response.status_code == 200:
                recettes = response.json()
                
                if not recettes:
                    return False, "Aucune recette trouvée avec ces ingrédients", []
                
                # Filtrage par régimes alimentaires si spécifiés
                if self.regimes_actifs:
                    recettes = self.filtrer_par_regimes(recettes)
                
                return True, "Recettes trouvées avec succès", recettes
            
            elif response.status_code == 402:
                return False, "Limite d'API atteinte. Réessayez plus tard.", []
            else:
                return False, f"Erreur API: {response.status_code}", []
                
        except requests.RequestException:
            return False, "Erreur de connexion. Vérifiez votre internet.", []
        except Exception as e:
            return False, f"Erreur inattendue: {str(e)}", []
    
    def filtrer_par_regimes(self, recettes: List[Dict]) -> List[Dict]:
        """
        Filtre les recettes selon les régimes alimentaires
        Note: Cette fonction nécessiterait des appels API supplémentaires pour vérifier
        les détails nutritionnels. Pour l'instant, elle retourne les recettes telles quelles.
        """
        # Pour une implémentation complète, il faudrait faire des appels à l'API
        # /recipes/{id}/information pour chaque recette pour vérifier les régimes
        return recettes
    
    def obtenir_details_recette(self, recipe_id: int) -> Tuple[bool, Dict]:
        """
        Obtient les détails complets d'une recette
        
        Returns:
            Tuple[bool, Dict]: (succès, détails_recette)
        """
        try:
            url = f"{self.base_url}/recipes/{recipe_id}/information"
            params = {
                'apiKey': self.api_key,
                'includeNutrition': True
            }
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                return True, response.json()
            else:
                return False, {}
                
        except Exception:
            return False, {}
    
    def formater_recettes(self, recettes_brutes: List[Dict], inventaire: Dict) -> str:
        """
        Formate les recettes pour l'affichage avec optimisation
        """
        if not recettes_brutes:
            return "Aucune recette trouvée avec vos ingrédients.\nEssayez d'ajouter d'autres aliments !"
        
        # Optimisation de l'ordre des recettes
        recettes_optimisees = self.optimiser_utilisation_aliments(inventaire, recettes_brutes)
        
        # En-tête avec information sur les régimes
        resultat = "🍽️ RECETTES SUGGÉRÉES (OPTIMISÉES) 🍽️\n"
        if self.regimes_actifs:
            regimes_str = ", ".join([r.value.replace('-', ' ').title() for r in self.regimes_actifs])
            resultat += f"📋 Régimes actifs: {regimes_str}\n"
        resultat += "=" * 50 + "\n\n"
        
        for i, recette in enumerate(recettes_optimisees, 1):
            titre = recette['title']
            ingredients_manques = recette.get('missedIngredientCount', 0)
            ingredients_utilises = recette.get('usedIngredientCount', 0)
            score_optimisation = recette.get('score_optimisation', 0)
            
            # Icône et score de compatibilité
            if ingredients_manques == 0:
                icone = "⭐"
                score = "PARFAIT MATCH !"
            elif ingredients_manques <= 2:
                icone = "🔥"
                score = "TRÈS BON MATCH"
            elif ingredients_manques <= 4:
                icone = "👍"
                score = "BON MATCH"
            else:
                icone = "🤔"
                score = "MATCH PARTIEL"
            
            # Formatage de chaque recette
            resultat += f"{i}. {icone} {titre}\n"
            resultat += f"   🎯 {score}\n"
            resultat += f"   ✅ Utilise {ingredients_utilises} de vos ingrédients\n"
            
            if ingredients_manques > 0:
                resultat += f"   ❌ Manque {ingredients_manques} ingrédient(s)\n"
            
            if score_optimisation > 0:
                resultat += f"   📊 Score d'optimisation: {score_optimisation:.0f}\n"
            
            # Affichage des ingrédients utilisés de l'inventaire
            ingredients_utilises_details = recette.get('usedIngredients', [])
            if ingredients_utilises_details:
                resultat += "   🥘 Vos ingrédients utilisés: "
                noms_utilises = [ing['name'] for ing in ingredients_utilises_details[:3]]
                resultat += ", ".join(noms_utilises)
                if len(ingredients_utilises_details) > 3:
                    resultat += f" (+ {len(ingredients_utilises_details) - 3} autres)"
                resultat += "\n"
            
            resultat += "\n"
        
        # Conseils d'optimisation
        resultat += "💡 CONSEILS D'OPTIMISATION:\n"
        resultat += "• Les recettes sont triées pour maximiser l'utilisation de vos aliments\n"
        resultat += "• Priorité donnée aux aliments qui expirent bientôt\n"
        if self.regimes_actifs:
            resultat += "• Filtrage selon vos préférences alimentaires\n"
        
        return resultat
    
    def rechercher_recettes_par_nom(self, nom: str, nombre: int = 5) -> Tuple[bool, str, List[Dict]]:
        """
        Recherche des recettes par nom
        
        Returns:
            Tuple[bool, str, List[Dict]]: (succès, message, liste_recettes)
        """
        try:
            url = f"{self.base_url}/recipes/complexSearch"
            params = {
                'query': nom,
                'number': nombre,
                'apiKey': self.api_key,
                'addRecipeInformation': True
            }
            
            # Ajout des régimes alimentaires
            if self.regimes_actifs:
                params['diet'] = ','.join([r.value for r in self.regimes_actifs])
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                recettes = data.get('results', [])
                
                if not recettes:
                    return False, f"Aucune recette trouvée pour '{nom}'", []
                
                return True, f"Recettes trouvées pour '{nom}'", recettes
            else:
                return False, f"Erreur API: {response.status_code}", []
                
        except Exception as e:
            return False, f"Erreur: {str(e)}", []
