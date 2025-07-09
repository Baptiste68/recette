"""
Module de gestion des evenements
"""

import asyncio
from recipe_display_manager import RecipeDisplayManager

class EventHandlers:
    def __init__(self, app_instance, palette):
        self.app = app_instance
        self.palette = palette
    
    # Méthodes inventaire
    async def ajouter_aliment(self, widget):
        """Ajoute un aliment à l'inventaire"""
        nom = self.nom_aliment.value.strip()
        quantite_str = self.quantite_aliment.value.strip()
        expiration = self.expiration_aliment.value.strip()
        
        if not nom:
            await self.main_window.error_dialog("Erreur", "Veuillez saisir le nom de l'aliment.")
            return
        
        try:
            quantite = int(quantite_str) if quantite_str else 1
        except ValueError:
            await self.main_window.error_dialog("Erreur", "La quantité doit être un nombre entier.")
            return
        
        if not expiration:
            expiration = "Non specifiee"
        
        # Vérification de compatibilité avec les régimes
        compatible, raison = self.diet_manager.valider_aliment_compatible(nom)
        if not compatible:
            result = await self.main_window.question_dialog(
                "Attention",
                f"L'aliment '{nom}' n'est pas compatible avec vos préférences:\n{raison}\n\nVoulez-vous l'ajouter quand même ?"
            )
            if not result:
                return
        
        # Ajout à l'inventaire
        succes, message = self.inventory_manager.ajouter_aliment(nom, quantite, expiration)
        
        if succes:
            # Vider les champs
            self.nom_aliment.value = ""
            self.quantite_aliment.value = ""
            self.expiration_aliment.value = ""
            
            self.refresh_inventory_display(None)

            await self.main_window.info_dialog("Succès", message)
        else:
            await self.main_window.error_dialog("Erreur", message)
    def afficher_inventaire(self, widget, inventory_manager, main_window):
        """Affiche l'inventaire complet"""
        inventaire = inventory_manager.obtenir_inventaire()
        
        if not inventaire:
            return main_window.info_dialog("Inventaire", "📦 Votre inventaire est vide.")
            return
        
        contenu = "📦 VOTRE INVENTAIRE\n" + "=" * 30 + "\n\n"
        
        for nom, details in sorted(inventaire.items()):
            icone = inventory_manager.obtenir_icone_aliment(nom)
            statut = inventory_manager.obtenir_statut_expiration(nom)
            
            contenu += f"{icone} {nom}\n"
            contenu += f"   📊 Quantité: {details['quantite']}\n"
            contenu += f"   {statut}\n\n"
        
        return main_window.info_dialog("Inventaire", contenu)

    def afficher_statistiques(self, widget, inventory_manager, main_window):
        """Affiche les statistiques de l'inventaire"""
        stats = inventory_manager.obtenir_statistiques()
        
        contenu = "📊 STATISTIQUES DE L'INVENTAIRE\n" + "=" * 35 + "\n\n"
        contenu += f"📦 Nombre d'aliments différents: {stats['total_aliments']}\n"
        contenu += f"📊 Quantité totale: {stats['total_quantite']}\n"
        contenu += f"🔴 Aliments expirés: {stats['expires']}\n"
        contenu += f"🟡 Expirent bientôt: {stats['bientot_expires']}\n"
        
        return main_window.info_dialog("Statistiques", contenu)

    def afficher_expires(self, widget, inventory_manager, main_window):
        """Affiche les aliments expirés ou bientôt expirés"""
        expires = inventory_manager.obtenir_aliments_expires()
        bientot_expires = inventory_manager.obtenir_aliments_bientot_expires()
        
        contenu = "⚠️ ALIMENTS À SURVEILLER\n" + "=" * 30 + "\n\n"
        
        if expires:
            contenu += "🔴 EXPIRÉS:\n"
            for aliment in expires:
                icone = inventory_manager.obtenir_icone_aliment(aliment)
                contenu += f"   {icone} {aliment}\n"
            contenu += "\n"
        
        if bientot_expires:
            contenu += "🟡 EXPIRENT BIENTÔT:\n"
            for aliment, jours in bientot_expires:
                icone = inventory_manager.obtenir_icone_aliment(aliment)
                contenu += f"   {icone} {aliment} (dans {jours} jour(s))\n"
            contenu += "\n"
        
        if not expires and not bientot_expires:
            contenu += "✅ Tous vos aliments sont encore bons !"
        
        return main_window.info_dialog("Aliments expirés", contenu)
    def ajouter_aliment_rapide(self, nom_aliment, diet_manager, widget_manager, inventory_manager, _last_cache_time, _stats_cache, window):
        """🟢 Version optimisée sans dialogues bloquants"""
        # Vérification rapide de compatibilité
        compatible, raison = diet_manager.valider_aliment_compatible(nom_aliment)
        
        if not compatible:
            # Log silencieux au lieu de dialogue bloquant
            print(f"⚠️ {nom_aliment} incompatible: {raison}")
        
        # Calcul intelligent de la date d'expiration
        date_expiration = widget_manager.calculer_date_expiration_intelligente(nom_aliment)
        
        # Ajout rapide
        succes, message = inventory_manager.ajouter_aliment(nom_aliment, 1, date_expiration)
        
        if succes:
            # 🟢 OPTIMISATION: Éviter le refresh complet
            inventaire = inventory_manager.obtenir_inventaire()
            if len(inventaire) == 1:
                widget_manager.refresh_inventory_display(None,inventory_manager)
            widget_manager.add_or_update_inventory_item(nom_aliment, inventory_manager)
            widget_manager.update_inventory_stats(_last_cache_time, _stats_cache, inventory_manager)
            
            # Feedback visuel léger
            self.show_quick_feedback(f"✅ {nom_aliment} ajouté", window)
        else:
            print(f"❌ {message}")
    def modifier_quantite(self, nom_aliment, changement,  _last_cache_time, _stats_cache, inventory_manager):
        """🟢 Modifie la quantité d'un aliment (+1 ou -1)"""
        inventaire = self.inventory_manager.obtenir_inventaire()
        
        if nom_aliment in inventaire:
            ancienne_quantite = inventaire[nom_aliment]['quantite']
            nouvelle_quantite = ancienne_quantite + changement
            
            if nouvelle_quantite <= 0:
                # Si quantité devient 0 ou moins, supprimer l'aliment
                asyncio.create_task(self.supprimer_aliment(nom_aliment))
            else:
                # Modifier la quantité
                inventaire[nom_aliment]['quantite'] = nouvelle_quantite
                self.inventory_manager.sauvegarder_inventaire()
                
                # 🟢 Mise à jour ciblée
                self.update_single_inventory_item(nom_aliment)
                self.update_inventory_stats(_last_cache_time, _stats_cache, inventory_manager)
    
    # Méthodes régimes
    def toggle_regime(self, regime, is_checked, diet_manager, regime_checkboxes, window):
        """Active/désactive un régime alimentaire"""
        if is_checked:
            if not diet_manager.ajouter_regime(regime):
                # Régime incompatible, désactiver la checkbox
                regime_checkboxes[regime].value = False
                asyncio.create_task(window.error_dialog(
                    "Incompatibilité",
                    f"Le régime {regime.nom_affichage} est incompatible avec vos régimes actuels."
                ))
        else:
            diet_manager.retirer_regime(regime)

    def toggle_allergie(self, allergie, is_checked, diet_manager, regime_checkboxes):
        """Active/désactive une allergie"""
        if is_checked:
            diet_manager.ajouter_allergie(allergie)
            # Auto-activation des régimes correspondants
            for regime, checkbox in regime_checkboxes.items():
                if regime in diet_manager.regimes_actifs:
                    checkbox.value = True
        else:
            diet_manager.retirer_allergie(allergie)
    
    # Méthodes recettes
    def recherche_recettes_optimisee(self, widget, inventory_manager, diet_manager, recipe_manager, window):
        """Recherche optimisée de recettes"""
        inventaire = inventory_manager.obtenir_inventaire()
        
        if not inventaire:
            return window.info_dialog(
                "Inventaire vide",
                "Ajoutez d'abord des aliments à votre inventaire pour obtenir des suggestions de recettes !"
            )
        
        # Mise à jour des régimes du recipe manager
        for regime in diet_manager.regimes_actifs:
            # Conversion vers l'enum du recipe_manager si nécessaire
            recipe_manager.ajouter_regime(regime)
        
        ingredients = list(inventaire.keys())

        try:
            succes, message, recettes = recipe_manager.rechercher_recettes_par_ingredients(ingredients, 10)
            if succes and recettes:
                #contenu_formate = recipe_manager.formater_recettes(recettes, inventaire)
                #return window.info_dialog("Recettes suggérées", contenu_formate)
                if not hasattr(self, 'recipe_display_manager'):
                    self.recipe_display_manager = RecipeDisplayManager(self.palette)
                
                self.recipe_display_manager.show_recipes_paginated(
                    recettes, inventaire, window, recipe_manager
                )
            else:
                return window.info_dialog("Aucune recette", message)
                
        except Exception as e:
            return window.error_dialog("Erreur", f"Erreur lors de la recherche: {str(e)}")

    def recherche_recettes_par_nom(self, widget, nom_recette, diet_manager, recipe_manager, window):
        """Recherche de recettes par nom"""
        nom = nom_recette.value.strip()

        if not nom:
            return window.error_dialog("Erreur", "Veuillez saisir le nom d'une recette.")
        
        # Mise à jour des régimes
        for regime in diet_manager.regimes_actifs:
            recipe_manager.ajouter_regime(regime)
        try:
            succes, message, recettes = recipe_manager.rechercher_recettes_par_nom(nom, 8)
            
            if succes and recettes:
                contenu = f"🔍 RECETTES POUR '{nom.upper()}'\n" + "=" * 40 + "\n\n"
                
                for i, recette in enumerate(recettes, 1):
                    titre = recette.get('title', 'Titre non disponible')
                    temps = recette.get('readyInMinutes', 'Non spécifié')
                    
                    contenu += f"{i}. 🍽️ {titre}\n"
                    contenu += f"   ⏱️ Temps: {temps} minutes\n\n"
                
                return window.info_dialog("Recettes trouvées", contenu)
            else:
                return window.info_dialog("Aucune recette", message)
                
        except Exception as e:
            return window.error_dialog("Erreur", f"Erreur lors de la recherche: {str(e)}")

    # Autre
    def show_quick_feedback(self, message, window):
        """🟢 Affiche un feedback rapide sans bloquer l'interface"""
        # Temporairement changer le titre de la fenêtre
        original_title = window.title
        window.title = message
        
        # Remettre le titre original après 2 secondes
        def restore_title():
            window.title = original_title
        
        # Timer non-bloquant
        asyncio.create_task(self.delayed_restore_title(restore_title, 2))

    async def delayed_restore_title(self, callback, delay):
        """🟢 Restore le titre après un délai"""
        await asyncio.sleep(delay)
        callback()

    def on_ajouter_aliment(self, widget, inventory_manager, widget_manager, nom_aliment, quantite_aliment, expiration_aliment, window, _last_cache_time, _stats_cache):
        resultat = inventory_manager.ajouter_aliment(
            nom_aliment.value.strip(), 
            quantite_aliment.value.strip(), 
            expiration_aliment.value.strip()
        )
        
        # Décomposer le tuple directement
        success, message = resultat
        
        if success:
            inventaire = inventory_manager.obtenir_inventaire()
            if len(inventaire) == 1:
                widget_manager.refresh_inventory_display(None,inventory_manager)
            else:
                widget_manager.add_or_update_inventory_item(nom_aliment, inventory_manager)
            widget_manager.update_inventory_stats(_last_cache_time, _stats_cache, inventory_manager)
            window.info_dialog("Aliment ajouté",message)
            # Optionnel: vider les champs
            nom_aliment.value = ""
            quantite_aliment.value = ""
            # Refresh de l'interface si nécessaire
        else:
            window.error_dialog("Erreur lors de l'ajout:",message)