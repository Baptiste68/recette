"""
Module de gestion des régimes alimentaires et préférences nutritionnelles
"""

from typing import Set, List, Dict
from enum import Enum
from typing import Tuple

class RegimeAlimentaire(Enum):
    VEGETARIEN = ("vegetarian", "🥬", "Végétarien", "Pas de viande ni poisson")
    VEGAN = ("vegan", "🌱", "Végan", "Aucun produit animal")
    SANS_GLUTEN = ("gluten-free", "🌾", "Sans gluten", "Sans blé, orge, seigle")
    CETOGENE = ("ketogenic", "🥑", "Cétogène", "Très faible en glucides")
    PALEO = ("paleo", "🦴", "Paléo", "Aliments non transformés")
    SANS_LACTOSE = ("dairy-free", "🥛", "Sans lactose", "Sans produits laitiers")
    SANS_NOIX = ("tree-nut-free", "🥜", "Sans noix", "Sans fruits à coque")
    PESCETARIEN = ("pescetarian", "🐟", "Pescétarien", "Végétarien + poisson")
    MEDITERANNEEN = ("mediterranean", "🫒", "Méditerranéen", "Riche en légumes et huile d'olive")
    SANS_SUC_AJOUTE = ("low-sugar", "🍯", "Sans sucre ajouté", "Faible en sucres ajoutés")

    def __init__(self, api_value, emoji, nom_affichage, description):
        self.api_value = api_value
        self.emoji = emoji
        self.nom_affichage = nom_affichage
        self.description = description

class Allergie(Enum):
    GLUTEN = ("gluten", "🌾", "Gluten")
    LACTOSE = ("dairy", "🥛", "Lactose/Produits laitiers")
    OEUFS = ("egg", "🥚", "Œufs")
    NOIX = ("tree nut", "🥜", "Noix et fruits à coque")
    ARACHIDES = ("peanut", "🥜", "Arachides")
    POISSON = ("seafood", "🐟", "Poisson et fruits de mer")
    SOJA = ("soy", "🫘", "Soja")
    SESAME = ("sesame", "🫘", "Sésame")

    def __init__(self, api_value, emoji, nom_affichage):
        self.api_value = api_value
        self.emoji = emoji
        self.nom_affichage = nom_affichage

class DietManager:
    def __init__(self):
        self.regimes_actifs: Set[RegimeAlimentaire] = set()
        self.allergies_actives: Set[Allergie] = set()
        self.preferences = {
            'calories_max': None,
            'calories_min': None,
            'proteines_min': None,
            'lipides_max': None,
            'glucides_max': None,
            'niveau_difficulte': None  # easy, medium, hard
        }
    
    def ajouter_regime(self, regime: RegimeAlimentaire) -> bool:
        """Ajoute un régime alimentaire"""
        # Vérification de compatibilité
        if not self._verifier_compatibilite_regime(regime):
            return False
        
        self.regimes_actifs.add(regime)
        return True
    
    def retirer_regime(self, regime: RegimeAlimentaire):
        """Retire un régime alimentaire"""
        self.regimes_actifs.discard(regime)
    
    def ajouter_allergie(self, allergie: Allergie):
        """Ajoute une allergie"""
        self.allergies_actives.add(allergie)
        # Auto-ajout des régimes correspondants
        self._auto_ajouter_regimes_allergie(allergie)
    
    def retirer_allergie(self, allergie: Allergie):
        """Retire une allergie"""
        self.allergies_actives.discard(allergie)
    
    def _verifier_compatibilite_regime(self, nouveau_regime: RegimeAlimentaire) -> bool:
        """Vérifie si un régime est compatible avec les régimes existants"""
        incompatibilites = {
            RegimeAlimentaire.VEGETARIEN: [RegimeAlimentaire.PESCETARIEN],
            RegimeAlimentaire.VEGAN: [RegimeAlimentaire.VEGETARIEN, RegimeAlimentaire.PESCETARIEN],
            RegimeAlimentaire.CETOGENE: [RegimeAlimentaire.MEDITERANNEEN],
        }
        
        if nouveau_regime in incompatibilites:
            for regime_existant in self.regimes_actifs:
                if regime_existant in incompatibilites[nouveau_regime]:
                    return False
        
        return True
    
    def _auto_ajouter_regimes_allergie(self, allergie: Allergie):
        """Ajoute automatiquement les régimes correspondant aux allergies"""
        correspondances = {
            Allergie.LACTOSE: RegimeAlimentaire.SANS_LACTOSE,
            Allergie.GLUTEN: RegimeAlimentaire.SANS_GLUTEN,
            Allergie.NOIX: RegimeAlimentaire.SANS_NOIX,
            Allergie.ARACHIDES: RegimeAlimentaire.SANS_NOIX,
        }
        
        if allergie in correspondances:
            self.regimes_actifs.add(correspondances[allergie])
    
    def definir_preferences_nutritionnelles(self, **kwargs):
        """Définit les préférences nutritionnelles"""
        for key, value in kwargs.items():
            if key in self.preferences:
                self.preferences[key] = value
    
    def obtenir_regimes_api(self) -> List[str]:
        """Retourne les valeurs API des régimes actifs"""
        return [regime.api_value for regime in self.regimes_actifs]
    
    def obtenir_allergies_api(self) -> List[str]:
        """Retourne les valeurs API des allergies actives"""
        return [allergie.api_value for allergie in self.allergies_actives]
    
    def obtenir_resume_preferences(self) -> str:
        """Retourne un résumé des préférences alimentaires"""
        resume = "🍽️ VOS PRÉFÉRENCES ALIMENTAIRES\n"
        resume += "=" * 40 + "\n\n"
        
        if self.regimes_actifs:
            resume += "📋 RÉGIMES ALIMENTAIRES:\n"
            for regime in sorted(self.regimes_actifs, key=lambda x: x.nom_affichage):
                resume += f"   {regime.emoji} {regime.nom_affichage} - {regime.description}\n"
            resume += "\n"
        
        if self.allergies_actives:
            resume += "⚠️ ALLERGIES ET INTOLÉRANCES:\n"
            for allergie in sorted(self.allergies_actives, key=lambda x: x.nom_affichage):
                resume += f"   {allergie.emoji} {allergie.nom_affichage}\n"
            resume += "\n"
        
        # Préférences nutritionnelles
        prefs_definies = {k: v for k, v in self.preferences.items() if v is not None}
        if prefs_definies:
            resume += "📊 PRÉFÉRENCES NUTRITIONNELLES:\n"
            if prefs_definies.get('calories_min') or prefs_definies.get('calories_max'):
                cal_min = prefs_definies.get('calories_min', 'Non défini')
                cal_max = prefs_definies.get('calories_max', 'Non défini')
                resume += f"   🔥 Calories: {cal_min} - {cal_max} kcal\n"
            if prefs_definies.get('proteines_min'):
                resume += f"   💪 Protéines min: {prefs_definies['proteines_min']}g\n"
            if prefs_definies.get('lipides_max'):
                resume += f"   🥑 Lipides max: {prefs_definies['lipides_max']}g\n"
            if prefs_definies.get('glucides_max'):
                resume += f"   🍞 Glucides max: {prefs_definies['glucides_max']}g\n"
            if prefs_definies.get('niveau_difficulte'):
                resume += f"   👨‍🍳 Difficulté: {prefs_definies['niveau_difficulte']}\n"
            resume += "\n"
        
        if not self.regimes_actifs and not self.allergies_actives and not prefs_definies:
            resume += "Aucune préférence définie.\n"
            resume += "Configurez vos préférences pour des suggestions personnalisées !\n"
        
        return resume
    
    def obtenir_parametres_recherche_api(self) -> Dict:
        """Retourne les paramètres pour les requêtes API"""
        params = {}
        
        # Régimes alimentaires
        if self.regimes_actifs:
            params['diet'] = ','.join(self.obtenir_regimes_api())
        
        # Allergies (intolerances dans l'API Spoonacular)
        if self.allergies_actives:
            params['intolerances'] = ','.join(self.obtenir_allergies_api())
        
        # Préférences nutritionnelles
        if self.preferences['calories_min']:
            params['minCalories'] = self.preferences['calories_min']
        if self.preferences['calories_max']:
            params['maxCalories'] = self.preferences['calories_max']
        if self.preferences['proteines_min']:
            params['minProtein'] = self.preferences['proteines_min']
        if self.preferences['lipides_max']:
            params['maxFat'] = self.preferences['lipides_max']
        if self.preferences['glucides_max']:
            params['maxCarbs'] = self.preferences['glucides_max']
        
        return params
    
    def valider_aliment_compatible(self, nom_aliment: str) -> Tuple[bool, str]:
        """
        Vérifie si un aliment est compatible avec les régimes et allergies
        
        Returns:
            Tuple[bool, str]: (compatible, raison_si_incompatible)
        """
        nom_lower = nom_aliment.lower()
        
        # Vérification des allergies
        for allergie in self.allergies_actives:
            if self._aliment_contient_allergene(nom_lower, allergie):
                return False, f"Contient {allergie.nom_affichage} (allergie déclarée)"
        
        # Vérification des régimes
        for regime in self.regimes_actifs:
            if not self._aliment_compatible_regime(nom_lower, regime):
                return False, f"Non compatible avec le régime {regime.nom_affichage}"
        
        return True, ""
    
    def _aliment_contient_allergene(self, nom_aliment: str, allergie: Allergie) -> bool:
        """Vérifie si un aliment contient un allergène"""
        allergenes_mots_cles = {
            Allergie.GLUTEN: ['blé', 'farine', 'pain', 'pâtes', 'orge', 'seigle'],
            Allergie.LACTOSE: ['lait', 'fromage', 'yaourt', 'beurre', 'crème'],
            Allergie.OEUFS: ['œuf', 'oeuf'],
            Allergie.NOIX: ['noix', 'amande', 'noisette', 'pistache', 'cajou'],
            Allergie.ARACHIDES: ['arachide', 'cacahuète'],
            Allergie.POISSON: ['poisson', 'saumon', 'thon', 'crevette', 'homard'],
            Allergie.SOJA: ['soja', 'tofu'],
            Allergie.SESAME: ['sésame', 'tahini']
        }
        
        if allergie in allergenes_mots_cles:
            return any(mot in nom_aliment for mot in allergenes_mots_cles[allergie])
        
        return False
    
    def _aliment_compatible_regime(self, nom_aliment: str, regime: RegimeAlimentaire) -> bool:
        """Vérifie si un aliment est compatible avec un régime"""
        
        # Aliments incompatibles par régime
        incompatibles = {
            RegimeAlimentaire.VEGETARIEN: ['viande', 'porc', 'bœuf', 'agneau', 'poisson', 'thon', 'saumon'],
            RegimeAlimentaire.VEGAN: ['viande', 'porc', 'bœuf', 'agneau', 'poisson', 'lait', 'fromage', 'œuf', 'miel'],
            RegimeAlimentaire.PESCETARIEN: ['viande', 'porc', 'bœuf', 'agneau', 'poulet'],
            RegimeAlimentaire.SANS_GLUTEN: ['blé', 'farine', 'pain', 'pâtes', 'orge', 'seigle'],
            RegimeAlimentaire.SANS_LACTOSE: ['lait', 'fromage', 'yaourt', 'beurre', 'crème'],
        }
        
        if regime in incompatibles:
            return not any(mot in nom_aliment for mot in incompatibles[regime])
        
        return True
    
    def obtenir_suggestions_aliments(self, regime: RegimeAlimentaire = None) -> List[str]:
        """Retourne des suggestions d'aliments selon les préférences"""
        suggestions = {
            RegimeAlimentaire.VEGETARIEN: [
                'Tofu', 'Lentilles', 'Quinoa', 'Épinards', 'Avocat', 'Noix', 'Fromage'
            ],
            RegimeAlimentaire.VEGAN: [
                'Tofu', 'Lentilles', 'Quinoa', 'Épinards', 'Avocat', 'Amandes', 'Chou-fleur'
            ],
            RegimeAlimentaire.CETOGENE: [
                'Avocat', 'Saumon', 'Œufs', 'Brocoli', 'Fromage', 'Huile d\'olive', 'Noix'
            ],
            RegimeAlimentaire.MEDITERANNEEN: [
                'Tomates', 'Huile d\'olive', 'Poisson', 'Légumes verts', 'Herbes fraîches'
            ],
            RegimeAlimentaire.PALEO: [
                'Viande', 'Poisson', 'Légumes', 'Fruits', 'Noix', 'Graines', 'Huile de coco'
            ]
        }
        
        if regime and regime in suggestions:
            return suggestions[regime]
        elif self.regimes_actifs:
            # Retourne les suggestions du premier régime actif
            premier_regime = next(iter(self.regimes_actifs))
            return suggestions.get(premier_regime, [])
        else:
            return ['Légumes variés', 'Fruits de saison', 'Protéines', 'Céréales complètes']
    
    def reset_preferences(self):
        """Remet à zéro toutes les préférences"""
        self.regimes_actifs.clear()
        self.allergies_actives.clear()
        for key in self.preferences:
            self.preferences[key] = None

    def afficher_resume_preferences(self, window):
        """Affiche le résumé des préférences alimentaires"""
        resume = self.obtenir_resume_preferences()
        return window.info_dialog("Vos préférences", resume)