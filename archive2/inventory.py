"""
Module de gestion de l'inventaire alimentaire
"""

from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import json
import os
from datetime import datetime

class InventoryManager:
    def __init__(self):
        self.inventaire = {}
    
    def ajouter_aliment(self, nom: str, quantite: int = 1, expiration: str = "Non specifiee") -> Tuple[bool, str]:
        """
        Ajoute un aliment à l'inventaire
        
        Returns:
            Tuple[bool, str]: (succès, message)
        """
        nom = nom.strip().title()
        
        if not nom:
            return False, "Veuillez saisir le nom de l'aliment."
        
        # Validation de la quantité
        if quantite <= 0:
            return False, "La quantité doit être positive."
        
        # Validation de la date si fournie
        if expiration != "Non specifiee":
            try:
                datetime.strptime(expiration, "%Y-%m-%d")
            except ValueError:
                return False, "Format de date incorrect. Utilisez YYYY-MM-DD"
        
        # Ajout ou mise à jour
        if nom in self.inventaire:
            self.inventaire[nom]['quantite'] += quantite
            message = f"{nom} mis à jour ! Quantité totale : {self.inventaire[nom]['quantite']}"
        else:
            self.inventaire[nom] = {
                'quantite': quantite,
                'expiration': expiration
            }
            message = f"{nom} ajouté avec succès ! Quantité : {quantite}"
        
        return True, message
    
    def supprimer_aliment(self, nom: str) -> Tuple[bool, str]:
        """
        Supprime un aliment de l'inventaire
        
        Returns:
            Tuple[bool, str]: (succès, message)
        """
        if nom in self.inventaire:
            del self.inventaire[nom]
            return True, f"{nom} a été supprimé de votre inventaire."
        else:
            return False, f"{nom} n'existe pas dans l'inventaire."
    
    def modifier_quantite(self, nom: str, nouvelle_quantite: int) -> Tuple[bool, str]:
        """
        Modifie la quantité d'un aliment
        
        Returns:
            Tuple[bool, str]: (succès, message)
        """
        if nom not in self.inventaire:
            return False, f"{nom} n'existe pas dans l'inventaire."
        
        if nouvelle_quantite <= 0:
            return self.supprimer_aliment(nom)
        
        self.inventaire[nom]['quantite'] = nouvelle_quantite
        return True, f"Quantité de {nom} mise à jour : {nouvelle_quantite}"
    
    def obtenir_inventaire(self) -> Dict:
        """Retourne l'inventaire complet"""
        return self.inventaire.copy()
    
    def obtenir_aliments_expires(self) -> List[str]:
        """Retourne la liste des aliments expirés"""
        expires = []
        for nom, details in self.inventaire.items():
            if details['expiration'] != "Non specifiee":
                try:
                    date_exp = datetime.strptime(details['expiration'], "%Y-%m-%d")
                    if date_exp < datetime.now():
                        expires.append(nom)
                except:
                    continue
        return expires
    
    def obtenir_aliments_bientot_expires(self, jours: int = 7) -> List[Tuple[str, int]]:
        """
        Retourne les aliments qui expirent dans les prochains jours
        
        Returns:
            List[Tuple[str, int]]: Liste de (nom_aliment, jours_restants)
        """
        bientot_expires = []
        for nom, details in self.inventaire.items():
            if details['expiration'] != "Non specifiee":
                try:
                    date_exp = datetime.strptime(details['expiration'], "%Y-%m-%d")
                    jours_restants = (date_exp - datetime.now()).days
                    if 0 <= jours_restants <= jours:
                        bientot_expires.append((nom, jours_restants))
                except:
                    continue
        return sorted(bientot_expires, key=lambda x: x[1])
    
    def obtenir_statut_expiration(self, nom: str) -> str:
        """Retourne le statut d'expiration d'un aliment"""
        if nom not in self.inventaire:
            return "Aliment non trouvé"
        
        expiration = self.inventaire[nom]['expiration']
        if expiration == "Non specifiee":
            return "🔸 Date non spécifiée"
        
        try:
            date_exp = datetime.strptime(expiration, "%Y-%m-%d")
            jours_restants = (date_exp - datetime.now()).days
            
            if jours_restants < 0:
                return "🔴 EXPIRÉ"
            elif jours_restants == 0:
                return "🟠 Expire aujourd'hui"
            elif jours_restants <= 3:
                return f"🟡 Expire dans {jours_restants} jour(s)"
            elif jours_restants <= 7:
                return f"🟢 Expire dans {jours_restants} jours"
            else:
                return f"✅ Expire le {expiration}"
        except:
            return f"⚠️ Date invalide: {expiration}"
    
    def obtenir_icone_aliment(self, nom: str) -> str:
        """Retourne une icône selon le type d'aliment"""
        nom_lower = nom.lower()
        
        # Fruits
        if any(fruit in nom_lower for fruit in ['pomme', 'poire', 'banane', 'orange', 'fraise', 'raisin', 'kiwi', 'ananas']):
            return "🍎"
        # Légumes
        elif any(legume in nom_lower for legume in ['tomate', 'carotte', 'salade', 'épinard', 'courgette', 'brocoli', 'poivron']):
            return "🥕"
        # Produits laitiers
        elif any(produit in nom_lower for produit in ['lait', 'yaourt', 'fromage', 'crème', 'beurre']):
            return "🥛"
        # Viandes et poissons
        elif any(viande in nom_lower for viande in ['poulet', 'bœuf', 'porc', 'poisson', 'saumon', 'thon']):
            return "🍖"
        # Céréales et féculents
        elif any(cereale in nom_lower for cereale in ['riz', 'pâtes', 'pain', 'farine', 'blé', 'pomme de terre']):
            return "🌾"
        # Épices et herbes
        elif any(epice in nom_lower for epice in ['sel', 'poivre', 'basilic', 'thym', 'persil']):
            return "🌿"
        else:
            return "🥘"
    
    def vider_inventaire(self):
        """Vide complètement l'inventaire"""
        self.inventaire.clear()
    
    def obtenir_statistiques(self) -> Dict:
        """Retourne des statistiques sur l'inventaire"""
        total_aliments = len(self.inventaire)
        total_quantite = sum(details['quantite'] for details in self.inventaire.values())
        expires = len(self.obtenir_aliments_expires())
        bientot_expires = len(self.obtenir_aliments_bientot_expires())
        
        return {
            'total_aliments': total_aliments,
            'total_quantite': total_quantite,
            'expires': expires,
            'bientot_expires': bientot_expires
        }
    
    def sauvegarder_inventaire(self, fichier: str = "inventaire.json") -> Tuple[bool, str]:
        """
        Sauvegarde l'inventaire dans un fichier JSON
        
        Args:
            fichier (str): Nom du fichier de sauvegarde
            
        Returns:
            Tuple[bool, str]: (succès, message)
        """
        try:
            # Préparer les données avec timestamp
            donnees_sauvegarde = {
                'inventaire': self.inventaire,
                'date_sauvegarde': datetime.now().isoformat(),
                'version': '1.0'
            }
            
            # Créer le dossier de sauvegarde s'il n'existe pas
            dossier_sauvegarde = os.path.join(os.path.expanduser("~"), "Documents", "InventaireApp")
            os.makedirs(dossier_sauvegarde, exist_ok=True)
            
            # Chemin complet du fichier
            chemin_fichier = os.path.join(dossier_sauvegarde, fichier)
            
            # Écriture du fichier JSON
            with open(chemin_fichier, 'w', encoding='utf-8') as f:
                json.dump(donnees_sauvegarde, f, ensure_ascii=False, indent=2)
            
            return True, f"Inventaire sauvegardé avec succès dans {chemin_fichier}"
        
        except Exception as e:
            return False, f"Erreur lors de la sauvegarde : {str(e)}"

    def charger_inventaire(self, fichier: str = "inventaire.json") -> Tuple[bool, str]:
        """
        Charge l'inventaire depuis un fichier JSON
        
        Args:
            fichier (str): Nom du fichier à charger
            
        Returns:
            Tuple[bool, str]: (succès, message)
        """
        try:
            # Chemin complet du fichier
            dossier_sauvegarde = os.path.join(os.path.expanduser("~"), "Documents", "InventaireApp")
            chemin_fichier = os.path.join(dossier_sauvegarde, fichier)
            
            # Vérifier que le fichier existe
            if not os.path.exists(chemin_fichier):
                return False, f"Le fichier {chemin_fichier} n'existe pas"
            
            # Lecture du fichier JSON
            with open(chemin_fichier, 'r', encoding='utf-8') as f:
                donnees = json.load(f)
            
            # Validation des données
            if 'inventaire' not in donnees:
                return False, "Format de fichier invalide : clé 'inventaire' manquante"
            
            # Charger l'inventaire
            self.inventaire = donnees['inventaire']
            
            # Information sur la date de sauvegarde si disponible
            message = f"Inventaire chargé avec succès depuis {chemin_fichier}"
            if 'date_sauvegarde' in donnees:
                date_sauvegarde = donnees['date_sauvegarde']
                message += f"\nDate de sauvegarde : {date_sauvegarde}"
            
            return True, message
        
        except json.JSONDecodeError:
            return False, f"Erreur : Le fichier {fichier} n'est pas un JSON valide"
        except Exception as e:
            return False, f"Erreur lors du chargement : {str(e)}"

    def sauvegarder_automatique(self) -> bool:
        """
        Sauvegarde automatique silencieuse
        
        Returns:
            bool: True si la sauvegarde a réussi
        """
        try:
            succes, _ = self.sauvegarder_inventaire("inventaire_auto.json")
            return succes
        except:
            return False

    def obtenir_fichiers_sauvegarde(self) -> List[str]:
        """
        Retourne la liste des fichiers de sauvegarde disponibles
        
        Returns:
            List[str]: Liste des noms de fichiers de sauvegarde
        """
        try:
            dossier_sauvegarde = os.path.join(os.path.expanduser("~"), "Documents", "InventaireApp")
            
            if not os.path.exists(dossier_sauvegarde):
                return []
            
            fichiers = []
            for fichier in os.listdir(dossier_sauvegarde):
                if fichier.endswith('.json'):
                    fichiers.append(fichier)
            
            return sorted(fichiers, reverse=True)  # Plus récents en premier
        
        except:
            return []
