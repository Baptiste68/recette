"""
Application principale de gestion d'inventaire alimentaire et de suggestions de recettes
avec optimisation et gestion des régimes alimentaires
"""

import toga
from toga.style import Pack
from toga.style.pack import COLUMN, ROW, CENTER
import asyncio
from datetime import datetime, timedelta

# Import des modules personnalisés
from diet_manager import DietManager, RegimeAlimentaire, Allergie
from inventory import InventoryManager
from recipe_manager import RecipeManager

# Configuration
API_KEY = "ded78740b47643a18aecd38bc430db1a"

class InventaireApp(toga.App):
    def startup(self):
        """Initialisation de l'application"""
        # Initialisation des gestionnaires
        self.diet_manager = DietManager()
        self.inventory_manager = InventoryManager()
        self.recipe_manager = RecipeManager(API_KEY)

        self._inventory_cache = {}
        self._stats_cache = None
        self._last_cache_time = None
        
        # État de l'application
        self.current_tab = "inventaire"
        
        # Création de l'interface
        self.create_interface()
        
        # Configuration de la fenêtre principale
        self.main_window = toga.MainWindow(title=self.formal_name)
        self.main_window.content = self.main_container
        self.main_window.show()

    def create_interface(self):
        """Création de l'interface utilisateur avec onglets"""
        # Container principal
        self.main_container = toga.Box(style=Pack(direction=COLUMN, padding=5))

        # Partie gauche - Interface principale
        left_container = toga.Box(style=Pack(direction=COLUMN, flex=2, padding=5))
        
        # Barre de navigation avec boutons stylisés
        nav_box = toga.Box(style=Pack(direction=ROW, padding=5, background_color="#f0f0f0"))
        
        self.btn_inventaire = toga.Button(
            "📦 Inventaire",
            on_press=self.show_inventaire_tab,
            style=Pack(flex=1, padding=5, background_color="#4CAF50", color="white")
        )
        
        self.btn_regimes = toga.Button(
            "🥗 Régimes",
            on_press=self.show_regimes_tab,
            style=Pack(flex=1, padding=5, background_color="#2196F3", color="white")
        )
        
        self.btn_recettes = toga.Button(
            "🍽️ Recettes",
            on_press=self.show_recettes_tab,
            style=Pack(flex=1, padding=5, background_color="#FF9800", color="white")
        )
        
        nav_box.add(self.btn_inventaire)
        nav_box.add(self.btn_regimes)
        nav_box.add(self.btn_recettes)
        
        # Container pour le contenu des onglets
        self.content_container = toga.ScrollContainer(style=Pack(flex=1, padding=10))

        # Ajout à la partie gauche
        left_container.add(nav_box)
        left_container.add(self.content_container)

        # Partie droite - Inventaire en temps réel
        self.inventory_panel = self.create_inventory_panel()
        
        # Création des différents onglets
        self.create_inventaire_tab()
        self.create_regimes_tab()
        self.create_recettes_tab()
        
        # Ajout au container principal
        self.main_container.add(left_container)
        self.main_container.add(self.inventory_panel)
        
        # Affichage de l'onglet inventaire par défaut
        self.show_inventaire_tab(None)

    def create_inventory_panel(self):
        """Création du panneau d'inventaire intégré à droite"""
        # Container principal de l'inventaire
        inventory_container = toga.Box(
            style=Pack(
                direction=COLUMN, 
                flex=1, 
                padding=10, 
                background_color="#f8f9fa"
            )
        )
        
        # Titre du panneau inventaire
        inventory_title = toga.Label(
            "📦 INVENTAIRE ACTUEL",
            style=Pack(
                text_align=CENTER, 
                font_size=16, 
                font_weight="bold", 
                padding=10,
                background_color="#e9ecef",
                color="#495057"
            )
        )
        
        # Statistiques rapides
        self.stats_label = toga.Label(
            "📊 0 aliments | 🔴 0 expirés",
            style=Pack(text_align=CENTER, padding=5, font_size=12)
        )
        
        # Container scrollable pour la liste des aliments
        self.inventory_scroll = toga.ScrollContainer(
            style=Pack(flex=1, padding=5)
        )
        
        # Box qui contiendra dynamiquement les aliments
        self.inventory_list_box = toga.Box(style=Pack(direction=COLUMN, padding=5))
        self.inventory_scroll.content = self.inventory_list_box
        
        # Bouton pour rafraîchir l'inventaire
        refresh_btn = toga.Button(
            "🔄 Actualiser",
            on_press=self.refresh_inventory_display,
            style=Pack(padding=5, background_color="#6c757d", color="white")
        )
        
        # Assemblage du panneau
        inventory_container.add(inventory_title)
        inventory_container.add(self.stats_label)
        inventory_container.add(self.inventory_scroll)
        inventory_container.add(refresh_btn)
        
        return inventory_container

    def create_inventory_item_widget(self, nom, details):
        """Crée un widget pour un item d'inventaire avec bouton de suppression"""
        # Container pour un aliment
        item_box = toga.Box(
            style=Pack(
                direction=ROW, 
                padding=8, 
                background_color="white"
            )
        )
        
        # Informations de l'aliment
        info_box = toga.Box(style=Pack(direction=COLUMN, flex=1, padding=5))
        
        # Nom avec icône
        icone = self.inventory_manager.obtenir_icone_aliment(nom)
        nom_label = toga.Label(
            f"{icone} {nom}",
            style=Pack(font_weight="bold", font_size=14)
        )

        # Container pour quantité avec boutons +/-
        quantite_box = toga.Box(style=Pack(direction=ROW, padding=2))
    
        # Bouton moins
        btn_moins = toga.Button(
            "➖",
            on_press=lambda widget, aliment=nom: self.modifier_quantite(aliment, -1),
            style=Pack(
                width=35,
                height=30,
                background_color="#ff6b6b",
                color="white",
                font_size=12
            )
        )
        
        # Quantité
        quantite_label = toga.Label(
            f"📊 Quantité: {details['quantite']}",
            style=Pack(font_size=12, color="#6c757d")
        )

        # Bouton plus
        btn_plus = toga.Button(
            "➕",
            on_press=lambda widget, aliment=nom: self.modifier_quantite(aliment, 1),
            style=Pack(
                width=35,
                height=30,
                background_color="#51cf66",
                color="white",
                font_size=12
            )
        )
        
        quantite_box.add(btn_moins)
        quantite_box.add(quantite_label)
        quantite_box.add(btn_plus)

        # Statut d'expiration
        statut = self.inventory_manager.obtenir_statut_expiration(nom)
        # Déterminer la couleur selon le statut
        if "expiré" in statut.lower():
            statut_color = "#dc3545"  # Rouge
        elif "expire" in statut.lower():
            statut_color = "#ffc107"  # Jaune
        else:
            statut_color = "#28a745"  # Vert
        
        statut_label = toga.Label(
            statut,
            style=Pack(font_size=11, color=statut_color)
        )
        
        info_box.add(nom_label)
        info_box.add(quantite_box)
        info_box.add(statut_label)
        
        # Bouton de suppression
        delete_btn = toga.Button(
            "🗑️",
            on_press=lambda widget, aliment=nom: asyncio.create_task(self.supprimer_aliment(aliment)),
            style=Pack(
                width=40,
                height=40,
                background_color="#dc3545",
                color="white",
                font_size=16
            )
        )
        
        item_box.add(info_box)
        item_box.add(delete_btn)
        
        return item_box

    async def supprimer_aliment(self, nom_aliment):
        """Supprime un aliment de l'inventaire après confirmation"""
        result = await self.main_window.question_dialog(
            "Confirmation de suppression",
            f"Êtes-vous sûr de vouloir supprimer '{nom_aliment}' de votre inventaire ?"
        )
        
        if result:
            succes = self.inventory_manager.supprimer_aliment(nom_aliment)
            if succes:
                await self.main_window.info_dialog("Succès", f"'{nom_aliment}' a été supprimé de l'inventaire.")
                self.refresh_inventory_display(None)
            else:
                await self.main_window.error_dialog("Erreur", f"Impossible de supprimer '{nom_aliment}'.")

    # Nouvelles fonctions d'optimisation
    def modifier_quantite(self, nom_aliment, changement):
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
                self.update_inventory_stats()

    def refresh_inventory_display(self, widget):
        """Met à jour l'affichage de l'inventaire"""
        # Vider la liste actuelle
        self.inventory_list_box.clear()
        
        # Obtenir l'inventaire actuel
        inventaire = self.inventory_manager.obtenir_inventaire()
        
        if not inventaire:
            # Affichage si inventaire vide
            empty_label = toga.Label(
                "📦 Inventaire vide\n\nAjoutez des aliments via l'onglet Inventaire !",
                style=Pack(
                    text_align=CENTER, 
                    padding=20, 
                    color="#6c757d",
                    font_style="italic"
                )
            )
            self.inventory_list_box.add(empty_label)
            self.stats_label.text = "📊 0 aliments | 🔴 0 expirés"
        else:
            # Ajouter chaque aliment
            for nom, details in sorted(inventaire.items()):
                item_widget = self.create_inventory_item_widget(nom, details)
                self.inventory_list_box.add(item_widget)
                
                # Séparateur
                separator = toga.Box(
                    style=Pack(height=1, background_color="#dee2e6", padding_top=2, padding_bottom=2)
                )
                self.inventory_list_box.add(separator)
            
            # Mettre à jour les statistiques
            stats = self.inventory_manager.obtenir_statistiques()
            self.stats_label.text = f"📊 {stats['total_aliments']} aliments | 🔴 {stats['expires']} expirés"

    def create_inventaire_tab(self):
        """Création de l'onglet inventaire"""
        self.inventaire_box = toga.Box(style=Pack(direction=COLUMN, padding=10))
        
        # Titre avec icône
        title_label = toga.Label(
            "📦 GESTION DE L'INVENTAIRE",
            style=Pack(text_align=CENTER, font_size=18, font_weight="bold", padding=10)
        )
        
        # Grille d'aliments prédéfinis
        grille_aliments = self.create_predefined_food_grid()

        # Section ajout d'aliment
        ajout_box = toga.Box(style=Pack(direction=COLUMN, padding=10, background_color="#f9f9f9"))
        ajout_title = toga.Label("➕ Ajouter un aliment", style=Pack(font_weight="bold", padding=5))
        
        # Champs de saisie
        self.nom_aliment = toga.TextInput(
            placeholder="🍎 Nom de l'aliment",
            style=Pack(padding=5)
        )
        
        input_row = toga.Box(style=Pack(direction=ROW, padding=5))
        self.quantite_aliment = toga.TextInput(
            placeholder="📊 Quantité",
            style=Pack(flex=1, padding=3)
        )
        self.expiration_aliment = toga.TextInput(
            placeholder="📅 Expiration (YYYY-MM-DD)",
            style=Pack(flex=2, padding=3)
        )
        
        input_row.add(self.quantite_aliment)
        input_row.add(self.expiration_aliment)
        
        btn_ajouter = toga.Button(
            "✅ Ajouter à l'inventaire",
            on_press=self.ajouter_aliment,
            style=Pack(padding=10, background_color="#4CAF50", color="white")
        )
        
        ajout_box.add(ajout_title)
        ajout_box.add(self.nom_aliment)
        ajout_box.add(input_row)
        ajout_box.add(btn_ajouter)
        
        # Section actions
        actions_box = toga.Box(style=Pack(direction=ROW, padding=10))
        
        btn_afficher = toga.Button(
            "📋 Voir inventaire",
            on_press=self.afficher_inventaire,
            style=Pack(flex=1, padding=5, background_color="#2196F3", color="white")
        )
        
        btn_expires = toga.Button(
            "⚠️ Aliments expirés",
            on_press=self.afficher_expires,
            style=Pack(flex=1, padding=5, background_color="#f44336", color="white")
        )
        
        btn_stats = toga.Button(
            "📊 Statistiques",
            on_press=self.afficher_statistiques,
            style=Pack(flex=1, padding=5, background_color="#9C27B0", color="white")
        )
        
        actions_box.add(btn_afficher)
        actions_box.add(btn_expires)
        actions_box.add(btn_stats)
        
        # Assemblage de l'onglet inventaire
        self.inventaire_box.add(title_label)
        self.inventaire_box.add(grille_aliments)
        self.inventaire_box.add(ajout_box)
        self.inventaire_box.add(actions_box)

    def create_regimes_tab(self):
        """Création de l'onglet régimes alimentaires"""
        self.regimes_box = toga.Box(style=Pack(direction=COLUMN, padding=10))
        
        # Titre
        title_label = toga.Label(
            "🥗 PRÉFÉRENCES ALIMENTAIRES",
            style=Pack(text_align=CENTER, font_size=18, font_weight="bold", padding=10)
        )
        
        # Section régimes alimentaires
        regimes_section = toga.Box(style=Pack(direction=COLUMN, padding=10, background_color="#f9f9f9"))
        regimes_title = toga.Label("🍽️ Régimes alimentaires", style=Pack(font_weight="bold", padding=5))
        
        # Checkboxes pour les régimes
        self.regime_checkboxes = {}
        regimes_grid = toga.Box(style=Pack(direction=COLUMN, padding=5))
        
        for regime in RegimeAlimentaire:
            checkbox = toga.Switch(
                text=f"{regime.emoji} {regime.nom_affichage} - {regime.description}",
                on_change=lambda widget, regime=regime: self.toggle_regime(regime, widget.value),
                style=Pack(padding=3)
            )
            self.regime_checkboxes[regime] = checkbox
            regimes_grid.add(checkbox)
        
        regimes_section.add(regimes_title)
        regimes_section.add(regimes_grid)
        
        # Section allergies
        allergies_section = toga.Box(style=Pack(direction=COLUMN, padding=10, background_color="#fff3cd"))
        allergies_title = toga.Label("⚠️ Allergies et intolérances", style=Pack(font_weight="bold", padding=5))
        
        self.allergie_checkboxes = {}
        allergies_grid = toga.Box(style=Pack(direction=COLUMN, padding=5))
        
        for allergie in Allergie:
            checkbox = toga.Switch(
                text=f"{allergie.emoji} {allergie.nom_affichage}",
                on_change=lambda widget, allergie=allergie: self.toggle_allergie(allergie, widget.value),
                style=Pack(padding=3)
            )
            self.allergie_checkboxes[allergie] = checkbox
            allergies_grid.add(checkbox)
        
        allergies_section.add(allergies_title)
        allergies_section.add(allergies_grid)
        
        # Boutons d'action
        actions_box = toga.Box(style=Pack(direction=ROW, padding=10))
        
        btn_resume = toga.Button(
            "📄 Voir résumé",
            on_press=self.afficher_resume_preferences,
            style=Pack(flex=1, padding=5, background_color="#4CAF50", color="white")
        )
        
        btn_reset = toga.Button(
            "🔄 Réinitialiser",
            on_press=self.reset_preferences,
            style=Pack(flex=1, padding=5, background_color="#f44336", color="white")
        )
        
        actions_box.add(btn_resume)
        actions_box.add(btn_reset)
        
        # Assemblage de l'onglet régimes
        self.regimes_box.add(title_label)
        self.regimes_box.add(regimes_section)
        self.regimes_box.add(allergies_section)
        self.regimes_box.add(actions_box)

    def create_recettes_tab(self):
        """Création de l'onglet recettes"""
        self.recettes_box = toga.Box(style=Pack(direction=COLUMN, padding=10))
        
        # Titre
        title_label = toga.Label(
            "🍽️ SUGGESTIONS DE RECETTES",
            style=Pack(text_align=CENTER, font_size=18, font_weight="bold", padding=10)
        )
        
        # Section recherche optimisée
        recherche_box = toga.Box(style=Pack(direction=COLUMN, padding=10, background_color="#e8f5e8"))
        recherche_title = toga.Label("🎯 Recherche optimisée", style=Pack(font_weight="bold", padding=5))
        
        description_label = toga.Label(
            "Trouve les meilleures recettes avec vos ingrédients disponibles.\n"
            "Priorise les aliments qui expirent bientôt !",
            style=Pack(padding=5, text_align=CENTER)
        )
        
        btn_recherche_optimisee = toga.Button(
            "🚀 Recherche optimisée",
            on_press=self.recherche_recettes_optimisee,
            style=Pack(padding=10, background_color="#4CAF50", color="white")
        )
        
        recherche_box.add(recherche_title)
        recherche_box.add(description_label)
        recherche_box.add(btn_recherche_optimisee)
        
        # Section recherche par nom
        nom_box = toga.Box(style=Pack(direction=COLUMN, padding=10, background_color="#fff3e0"))
        nom_title = toga.Label("🔍 Recherche par nom", style=Pack(font_weight="bold", padding=5))
        
        self.nom_recette = toga.TextInput(
            placeholder="🍝 Nom de la recette (ex: pasta, pizza, soup...)",
            style=Pack(padding=5)
        )
        
        btn_recherche_nom = toga.Button(
            "🔍 Rechercher",
            on_press=self.recherche_recettes_par_nom,
            style=Pack(padding=5, background_color="#FF9800", color="white")
        )
        
        nom_box.add(nom_title)
        nom_box.add(self.nom_recette)
        nom_box.add(btn_recherche_nom)
        
        # Section statistiques
        stats_box = toga.Box(style=Pack(direction=ROW, padding=10))
        
        btn_aliments_expires = toga.Button(
            "⏰ Aliments à utiliser",
            on_press=self.afficher_aliments_prioritaires,
            style=Pack(flex=1, padding=5, background_color="#f44336", color="white")
        )
        
        btn_suggestions = toga.Button(
            "💡 Suggestions d'achats",
            on_press=self.suggestions_achats,
            style=Pack(flex=1, padding=5, background_color="#2196F3", color="white")
        )
        
        stats_box.add(btn_aliments_expires)
        stats_box.add(btn_suggestions)
        
        # Assemblage de l'onglet recettes
        self.recettes_box.add(title_label)
        self.recettes_box.add(recherche_box)
        self.recettes_box.add(nom_box)
        self.recettes_box.add(stats_box)

    # Méthodes de navigation
    def show_inventaire_tab(self, widget):
        """Affiche l'onglet inventaire"""
        self.current_tab = "inventaire"
        self.content_container.content = self.inventaire_box
        self.update_nav_buttons()

    def show_regimes_tab(self, widget):
        """Affiche l'onglet régimes"""
        self.current_tab = "regimes"
        self.content_container.content = self.regimes_box
        self.update_nav_buttons()

    def show_recettes_tab(self, widget):
        """Affiche l'onglet recettes"""
        self.current_tab = "recettes"
        self.content_container.content = self.recettes_box
        self.update_nav_buttons()

    def update_nav_buttons(self):
        """Met à jour l'apparence des boutons de navigation"""
        # Reset tous les boutons
        self.btn_inventaire.style.background_color = "#4CAF50"
        self.btn_regimes.style.background_color = "#2196F3"
        self.btn_recettes.style.background_color = "#FF9800"
        
        # Highlight le bouton actif
        if self.current_tab == "inventaire":
            self.btn_inventaire.style.background_color = "#2E7D32"
        elif self.current_tab == "regimes":
            self.btn_regimes.style.background_color = "#1565C0"
        elif self.current_tab == "recettes":
            self.btn_recettes.style.background_color = "#E65100"

    # Méthodes de l'inventaire
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

    async def afficher_inventaire(self, widget):
        """Affiche l'inventaire complet"""
        inventaire = self.inventory_manager.obtenir_inventaire()
        
        if not inventaire:
            await self.main_window.info_dialog("Inventaire", "📦 Votre inventaire est vide.")
            return
        
        contenu = "📦 VOTRE INVENTAIRE\n" + "=" * 30 + "\n\n"
        
        for nom, details in sorted(inventaire.items()):
            icone = self.inventory_manager.obtenir_icone_aliment(nom)
            statut = self.inventory_manager.obtenir_statut_expiration(nom)
            
            contenu += f"{icone} {nom}\n"
            contenu += f"   📊 Quantité: {details['quantite']}\n"
            contenu += f"   {statut}\n\n"
        
        await self.main_window.info_dialog("Inventaire", contenu)

    async def afficher_expires(self, widget):
        """Affiche les aliments expirés ou bientôt expirés"""
        expires = self.inventory_manager.obtenir_aliments_expires()
        bientot_expires = self.inventory_manager.obtenir_aliments_bientot_expires()
        
        contenu = "⚠️ ALIMENTS À SURVEILLER\n" + "=" * 30 + "\n\n"
        
        if expires:
            contenu += "🔴 EXPIRÉS:\n"
            for aliment in expires:
                icone = self.inventory_manager.obtenir_icone_aliment(aliment)
                contenu += f"   {icone} {aliment}\n"
            contenu += "\n"
        
        if bientot_expires:
            contenu += "🟡 EXPIRENT BIENTÔT:\n"
            for aliment, jours in bientot_expires:
                icone = self.inventory_manager.obtenir_icone_aliment(aliment)
                contenu += f"   {icone} {aliment} (dans {jours} jour(s))\n"
            contenu += "\n"
        
        if not expires and not bientot_expires:
            contenu += "✅ Tous vos aliments sont encore bons !"
        
        await self.main_window.info_dialog("Aliments expirés", contenu)

    async def afficher_statistiques(self, widget):
        """Affiche les statistiques de l'inventaire"""
        stats = self.inventory_manager.obtenir_statistiques()
        
        contenu = "📊 STATISTIQUES DE L'INVENTAIRE\n" + "=" * 35 + "\n\n"
        contenu += f"📦 Nombre d'aliments différents: {stats['total_aliments']}\n"
        contenu += f"📊 Quantité totale: {stats['total_quantite']}\n"
        contenu += f"🔴 Aliments expirés: {stats['expires']}\n"
        contenu += f"🟡 Expirent bientôt: {stats['bientot_expires']}\n"
        
        await self.main_window.info_dialog("Statistiques", contenu)

    # Méthodes des régimes alimentaires
    def toggle_regime(self, regime, is_checked):
        """Active/désactive un régime alimentaire"""
        if is_checked:
            if not self.diet_manager.ajouter_regime(regime):
                # Régime incompatible, désactiver la checkbox
                self.regime_checkboxes[regime].value = False
                asyncio.create_task(self.main_window.error_dialog(
                    "Incompatibilité",
                    f"Le régime {regime.nom_affichage} est incompatible avec vos régimes actuels."
                ))
        else:
            self.diet_manager.retirer_regime(regime)

    def toggle_allergie(self, allergie, is_checked):
        """Active/désactive une allergie"""
        if is_checked:
            self.diet_manager.ajouter_allergie(allergie)
            # Auto-activation des régimes correspondants
            for regime, checkbox in self.regime_checkboxes.items():
                if regime in self.diet_manager.regimes_actifs:
                    checkbox.value = True
        else:
            self.diet_manager.retirer_allergie(allergie)

    async def afficher_resume_preferences(self, widget):
        """Affiche le résumé des préférences alimentaires"""
        resume = self.diet_manager.obtenir_resume_preferences()
        await self.main_window.info_dialog("Vos préférences", resume)

    async def reset_preferences(self, widget):
        """Remet à zéro les préférences"""
        result = await self.main_window.question_dialog(
            "Confirmation",
            "Êtes-vous sûr de vouloir réinitialiser toutes vos préférences alimentaires ?"
        )
        
        if result:
            self.diet_manager.reset_preferences()
            # Désactiver toutes les checkboxes
            for checkbox in self.regime_checkboxes.values():
                checkbox.value = False
            for checkbox in self.allergie_checkboxes.values():
                checkbox.value = False
            
            await self.main_window.info_dialog("Succès", "Préférences réinitialisées !")

    # Méthodes des recettes
    async def recherche_recettes_optimisee(self, widget):
        """Recherche optimisée de recettes"""
        inventaire = self.inventory_manager.obtenir_inventaire()
        
        if not inventaire:
            await self.main_window.info_dialog(
                "Inventaire vide",
                "Ajoutez d'abord des aliments à votre inventaire pour obtenir des suggestions de recettes !"
            )
            return
        
        # Mise à jour des régimes du recipe manager
        for regime in self.diet_manager.regimes_actifs:
            # Conversion vers l'enum du recipe_manager si nécessaire
            self.recipe_manager.ajouter_regime(regime)
        
        ingredients = list(inventaire.keys())
        
        try:
            succes, message, recettes = self.recipe_manager.rechercher_recettes_par_ingredients(ingredients, 10)
            
            if succes and recettes:
                contenu_formate = self.recipe_manager.formater_recettes(recettes, inventaire)
                await self.main_window.info_dialog("Recettes suggérées", contenu_formate)
            else:
                await self.main_window.info_dialog("Aucune recette", message)
                
        except Exception as e:
            await self.main_window.error_dialog("Erreur", f"Erreur lors de la recherche: {str(e)}")

    async def recherche_recettes_par_nom(self, widget):
        """Recherche de recettes par nom"""
        nom = self.nom_recette.value.strip()
        
        if not nom:
            await self.main_window.error_dialog("Erreur", "Veuillez saisir le nom d'une recette.")
            return
        
        # Mise à jour des régimes
        for regime in self.diet_manager.regimes_actifs:
            self.recipe_manager.ajouter_regime(regime)
        
        try:
            succes, message, recettes = self.recipe_manager.rechercher_recettes_par_nom(nom, 8)
            
            if succes and recettes:
                contenu = f"🔍 RECETTES POUR '{nom.upper()}'\n" + "=" * 40 + "\n\n"
                
                for i, recette in enumerate(recettes, 1):
                    titre = recette.get('title', 'Titre non disponible')
                    temps = recette.get('readyInMinutes', 'Non spécifié')
                    
                    contenu += f"{i}. 🍽️ {titre}\n"
                    contenu += f"   ⏱️ Temps: {temps} minutes\n\n"
                
                await self.main_window.info_dialog("Recettes trouvées", contenu)
            else:
                await self.main_window.info_dialog("Aucune recette", message)
                
        except Exception as e:
            await self.main_window.error_dialog("Erreur", f"Erreur lors de la recherche: {str(e)}")

    async def afficher_aliments_prioritaires(self, widget):
        """Affiche les aliments à utiliser en priorité"""
        expires = self.inventory_manager.obtenir_aliments_expires()
        bientot_expires = self.inventory_manager.obtenir_aliments_bientot_expires(3)
        
        contenu = "⏰ ALIMENTS À UTILISER EN PRIORITÉ\n" + "=" * 40 + "\n\n"
        
        if expires:
            contenu += "🔴 URGENCE MAXIMALE (expirés):\n"
            for aliment in expires:
                icone = self.inventory_manager.obtenir_icone_aliment(aliment)
                contenu += f"   {icone} {aliment}\n"
            contenu += "\n"
        
        if bientot_expires:
            contenu += "🟡 À UTILISER RAPIDEMENT:\n"
            for aliment, jours in bientot_expires:
                icone = self.inventory_manager.obtenir_icone_aliment(aliment)
                contenu += f"   {icone} {aliment} (dans {jours} jour(s))\n"
            contenu += "\n"
        
        if not expires and not bientot_expires:
            contenu += "✅ Aucun aliment urgent à utiliser !"
        else:
            contenu += "💡 Conseil: Utilisez la recherche optimisée de recettes\n"
            contenu += "pour des suggestions qui priorisent ces aliments !"
        
        await self.main_window.info_dialog("Aliments prioritaires", contenu)

    async def suggestions_achats(self, widget):
        """Suggestions d'achats basées sur les régimes"""
        if not self.diet_manager.regimes_actifs:
            await self.main_window.info_dialog(
                "Aucun régime",
                "Configurez d'abord vos préférences alimentaires pour obtenir des suggestions personnalisées !"
            )
            return
        
        contenu = "💡 SUGGESTIONS D'ACHATS\n" + "=" * 30 + "\n\n"
        
        for regime in self.diet_manager.regimes_actifs:
            suggestions = self.diet_manager.obtenir_suggestions_aliments(regime)
            contenu += f"{regime.emoji} {regime.nom_affichage}:\n"
            for suggestion in suggestions[:5]:  # Limite à 5 suggestions par régime
                contenu += f"   • {suggestion}\n"
            contenu += "\n"
        
        await self.main_window.info_dialog("Suggestions d'achats", contenu)


    def create_predefined_food_grid(self):
        """Création de la grille d'aliments prédéfinis"""
        # Dictionnaire des aliments prédéfinis avec leurs icônes
        self.aliments_predefinis = {
            # Fruits
            "🍎": "Pomme",
            "🍌": "Banane", 
            "🍊": "Orange",
            "🍇": "Raisin",
            "🍓": "Fraise",
            "🥝": "Kiwi",
            "🍑": "Cerise",
            "🍒": "Griotte",
            
            # Légumes
            "🥕": "Carotte",
            "🥒": "Concombre",
            "🍅": "Tomate",
            "🥬": "Salade",
            "🥔": "Pomme de terre",
            "🧅": "Oignon",
            "🫒": "Olive",
            "🌶️": "Piment",
            
            # Protéines
            "🥩": "Bœuf",
            "🍗": "Poulet",
            "🐟": "Poisson",
            "🥚": "Œuf",
            "🧀": "Fromage",
            "🥛": "Lait",
            
            # Féculents
            "🍞": "Pain",
            "🍝": "Pâtes",
            "🍚": "Riz",
            "🥖": "Baguette",
            
            # Autres
            "🫖": "Thé",
            "☕": "Café",
            "🍯": "Miel",
            "🧈": "Beurre"
        }
        
        # Container principal de la grille
        grid_container = toga.Box(
            style=Pack(
                direction=COLUMN,
                padding=10,
                background_color="#f0f8ff"
            )
        )
        
        # Titre de la section
        grid_title = toga.Label(
            "🛒 AJOUT RAPIDE D'ALIMENTS",
            style=Pack(
                text_align=CENTER,
                font_size=16,
                font_weight="bold",
                padding=8,
                background_color="#e6f3ff",
                color="#2c5282"
            )
        )
        
        # Instructions
        instructions = toga.Label(
            "Cliquez sur un aliment pour l'ajouter à votre inventaire (quantité +1 à chaque clic)",
            style=Pack(
                text_align=CENTER,
                font_size=11,
                padding=5,
                color="#666"
            )
        )
        
        # Création de la grille (4 colonnes)
        grid_rows = []
        aliments_items = list(self.aliments_predefinis.items())
        
        # Organiser les aliments par rangées de 4
        for i in range(0, len(aliments_items), 4):
            row = toga.Box(style=Pack(direction=ROW, padding=2))
            
            # Ajouter jusqu'à 4 aliments par rangée
            for j in range(4):
                if i + j < len(aliments_items):
                    icone, nom = aliments_items[i + j]
                    
                    # Bouton pour chaque aliment
                    btn_aliment = toga.Button(
                        f"{icone}\n{nom}",
                        on_press=lambda widget, nom_aliment=nom: self.ajouter_aliment_rapide(nom_aliment),
                        style=Pack(
                            flex=1,
                            padding=3,
                            height=60,
                            background_color="#ffffff",
                            color="#333",
                            font_size=10
                        )
                    )
                    row.add(btn_aliment)
                else:
                    # Espace vide pour maintenir l'alignement
                    spacer = toga.Box(style=Pack(flex=1))
                    row.add(spacer)
            
            grid_rows.append(row)
        
        # Assemblage du container
        grid_container.add(grid_title)
        grid_container.add(instructions)
        
        # Ajouter toutes les rangées
        for row in grid_rows:
            grid_container.add(row)
        
        return grid_container

    def ajouter_aliment_rapide(self, nom_aliment):
        """🟢 Version optimisée sans dialogues bloquants"""
        # Vérification rapide de compatibilité
        compatible, raison = self.diet_manager.valider_aliment_compatible(nom_aliment)
        
        if not compatible:
            # Log silencieux au lieu de dialogue bloquant
            print(f"⚠️ {nom_aliment} incompatible: {raison}")
        
        # Calcul intelligent de la date d'expiration
        date_expiration = self.calculer_date_expiration_intelligente(nom_aliment)
        
        # Ajout rapide
        succes, message = self.inventory_manager.ajouter_aliment(nom_aliment, 1, date_expiration)
        
        if succes:
            # 🟢 OPTIMISATION: Éviter le refresh complet
            self.add_or_update_inventory_item(nom_aliment)
            self.update_inventory_stats()
            
            # Feedback visuel léger
            self.show_quick_feedback(f"✅ {nom_aliment} ajouté")
        else:
            print(f"❌ {message}")

    def update_inventory_item(self, nom_aliment):
        """🟢 Met à jour un seul élément de l'inventaire (OPTIMISATION)"""
        # Pour l'instant, on garde le rafraîchissement complet mais optimisé
        # Dans une version future, on pourrait mettre à jour seulement l'élément modifié
        inventaire = self.inventory_manager.obtenir_inventaire()
        
        if inventaire:
            # 🟢 Rafraîchissement plus efficace avec mise en cache
            if not hasattr(self, '_last_inventory_size'):
                self._last_inventory_size = 0
            
            # Seulement si la taille a changé
            if len(inventaire) != self._last_inventory_size:
                self.refresh_inventory_display(None)
                self._last_inventory_size = len(inventaire)
            else:
                # Mise à jour légère des stats seulement
                self.update_inventory_stats()

    def update_inventory_stats(self):
         """Version cachée des statistiques"""
         current_time = datetime.now()
        
         # Cache valide pendant 5 secondes
         if (self._last_cache_time and 
             (current_time - self._last_cache_time).seconds < 5 and
             self._stats_cache):
             stats = self._stats_cache
         else:
             stats = self.inventory_manager.obtenir_statistiques()
             self._stats_cache = stats
             self._last_cache_time = current_time
        
         self.stats_label.text = f"📊 {stats['total_aliments']} aliments | 🔴 {stats['expires']} expirés"

    def update_single_inventory_item(self, nom_aliment):
        """🟢 Met à jour UN SEUL élément sans recréer toute la liste"""
        inventaire = self.inventory_manager.obtenir_inventaire()
        
        if nom_aliment not in inventaire:
            # L'aliment a été supprimé, faire un refresh complet
            self.refresh_inventory_display(None)
            return
        
        # Trouver et mettre à jour seulement cet élément
        for i, child in enumerate(self.inventory_list_box.children):
            if hasattr(child, 'children') and len(child.children) > 0:
                # Chercher le label avec le nom de l'aliment
                info_box = child.children[0] if hasattr(child.children[0], 'children') else None
                if info_box and hasattr(info_box, 'children'):
                    for label_widget in info_box.children:
                        if hasattr(label_widget, 'text') and nom_aliment in label_widget.text:
                            # Trouvé! Mettre à jour juste ce widget
                            details = inventaire[nom_aliment]
                            # Remplacer par le nouveau widget
                            new_widget = self.create_inventory_item_widget(nom_aliment, details)
                            self.inventory_list_box.insert(i, new_widget)
                            self.inventory_list_box.remove(child)
                            return
        
        # Si pas trouvé, c'est un nouvel élément
        details = inventaire[nom_aliment]
        new_widget = self.create_inventory_item_widget(nom_aliment, details)
        self.inventory_list_box.add(new_widget)
        # Séparateur
        separator = toga.Box(
            style=Pack(height=1, background_color="#dee2e6", padding_top=2, padding_bottom=2)
        )
        self.inventory_list_box.add(separator)

    # Calcul intelligent des dates
    def calculer_date_expiration_intelligente(self, nom_aliment):
        """🟢 Calcule une date d'expiration intelligente selon le type d'aliment"""
        
        # Catégories d'aliments avec durées de conservation
        durees_conservation = {
            # Très périssables (3-5 jours)
            'tres_frais': ['Salade', 'Fraise', 'Cerise', 'Griotte', 'Lait', 'Poisson'],
            
            # Frais (7 jours) 
            'frais': ['Pomme', 'Banane', 'Orange', 'Carotte', 'Concombre', 'Tomate', 'Pain', 'Baguette'],
            
            # Moyennement périssables (14 jours)
            'moyen': ['Fromage', 'Œuf', 'Pomme de terre', 'Oignon'],
            
            # Longue conservation (30+ jours)
            'longue': ['Riz', 'Pâtes', 'Miel', 'Thé', 'Café', 'Beurre']
        }
        
        jours = 30  # Par défaut
        
        for categorie, aliments in durees_conservation.items():
            if nom_aliment in aliments:
                if categorie == 'tres_frais':
                    jours = 4
                elif categorie == 'frais':
                    jours = 7
                elif categorie == 'moyen':
                    jours = 14
                elif categorie == 'longue':
                    jours = 60
                break
        
        return (datetime.now() + timedelta(days=jours)).strftime("%Y-%m-%d")

    # 5. 🚀 NOUVELLE MÉTHODE: Feedback visuel léger
    def show_quick_feedback(self, message):
        """🟢 Affiche un feedback rapide sans bloquer l'interface"""
        # Temporairement changer le titre de la fenêtre
        original_title = self.main_window.title
        self.main_window.title = message
        
        # Remettre le titre original après 2 secondes
        def restore_title():
            self.main_window.title = original_title
        
        # Timer non-bloquant
        asyncio.create_task(self.delayed_restore_title(restore_title, 2))

    async def delayed_restore_title(self, callback, delay):
        """🟢 Restore le titre après un délai"""
        await asyncio.sleep(delay)
        callback()

    # 6. 🚀 OPTIMISATION: Éviter les refresh inutiles
    def add_or_update_inventory_item(self, nom_aliment):
        """🟢 Ajoute ou met à jour sans refresh complet"""
        # Vérifier si l'aliment existe déjà
        inventaire = self.inventory_manager.obtenir_inventaire()
        
        if nom_aliment in inventaire:
            # Mise à jour d'un existant
            self.update_single_inventory_item(nom_aliment)
        else:
            # Nouvel aliment - l'ajouter à la fin
            details = inventaire.get(nom_aliment, {'quantite': 1})
            new_widget = self.create_inventory_item_widget(nom_aliment, details)
            self.inventory_list_box.add(new_widget)
            
            # Séparateur
            separator = toga.Box(
                style=Pack(height=1, background_color="#dee2e6", padding_top=2, padding_bottom=2)
            )
            self.inventory_list_box.add(separator)

def main():
    """Point d'entrée de l'application"""
    return InventaireApp(
        "Gestion Inventaire & Recettes",
        "org.beeware.inventaire.optimise"
    )


if __name__ == "__main__":
    app = main()
    app.main_loop()
