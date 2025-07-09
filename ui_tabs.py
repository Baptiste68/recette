"""
Module de gestion des onglets
"""

import toga
from toga.style import Pack
from toga.style.pack import COLUMN, ROW, CENTER

# Import des modules personnalisés
from diet_manager import RegimeAlimentaire, Allergie

class TabManager:
    def __init__(self, app_instance):
        self.app = app_instance
    
    def create_inventaire_tab(self, widget_manager, inventory, event_handlers, diet_manager, _last_cache_time, _stats_cache, window, palette):
        """Création de l'onglet inventaire"""
        self.inventaire_box = toga.Box(
            style=Pack(
                direction=COLUMN, 
                flex=1, 
                padding=0, 
                background_color=palette.MODERN_COLORS['bg_primary']
            )
        )
        # Header moderne avec gradient simulé
        header_box = toga.Box(
            style=Pack(
                direction=COLUMN,
                padding=25,
                background_color=palette.MODERN_COLORS['primary'],
                text_align=CENTER
            )
        )
        
        title_label = toga.Label(
            "📦 Gestion Inventaire",
            style=Pack(
                text_align=CENTER, 
                font_size=24, 
                font_weight="bold", 
                color=palette.MODERN_COLORS['text_white'],
                padding=5
            )
        )
        
        subtitle_label = toga.Label(
            "Optimisez votre stock alimentaire",
            style=Pack(
                text_align=CENTER,
                font_size=14,
                color=palette.MODERN_COLORS['text_white'],
                padding=5
            )
        )
        
        header_box.add(title_label)
        header_box.add(subtitle_label)
        # Titre avec icône
        #title_label = toga.Label(
        #    "📦 GESTION DE L'INVENTAIRE",
        #    style=Pack(text_align=CENTER, font_size=18, font_weight="bold", padding=10)
        #)
        
        # Container principal avec cards
        main_container = toga.Box(
            style=Pack(
                direction=COLUMN,
                padding=20,
                background_color=palette.MODERN_COLORS['bg_primary']
            )
        )

         # Card pour la grille d'aliments
        grid_card = toga.Box(style=self.create_modern_card_style(palette))
        grid_title = toga.Label(
            "🍎 Aliments populaires",
            style=Pack(font_size=18, font_weight="normal", padding=10, color=palette.MODERN_COLORS['text_primary'])
        )
        # Grille d'aliments prédéfinis
        grille_aliments = widget_manager.create_predefined_food_grid(event_handlers, diet_manager, widget_manager, inventory, _last_cache_time, _stats_cache, window)

        grid_card.add(grid_title)
        grid_card.add(grille_aliments)

        # Section ajout d'aliment
        ajout_box = toga.Box(style=self.create_modern_card_style(palette))
        ajout_title = toga.Label("➕ Ajouter un aliment", style=Pack(font_weight="bold", padding=10, color=palette.MODERN_COLORS['text_primary']))
        
        # Champs de saisie
        self.nom_aliment = toga.TextInput(
            placeholder="🍎 Nom de l'aliment",
            style=self.create_modern_input_style(palette)
        )
        
        input_row = toga.Box(style=Pack(direction=ROW, padding=5))
        self.quantite_aliment = toga.TextInput(
            placeholder="📊 Quantité",
            style=Pack(
                **self.create_modern_input_style(palette),
                flex=1,  # Occupe la moitié de l'espace disponible
                padding_right=5  # Petit espacement entre les deux inputs
            )
        )
        self.expiration_aliment = toga.TextInput(
            placeholder="📅 Expiration (YYYY-MM-DD)",
            style=Pack(
                **self.create_modern_input_style(palette),
                flex=1,  # Occupe la moitié de l'espace disponible
                padding_right=5  # Petit espacement entre les deux inputs
            )
        )
        
        input_row.add(self.quantite_aliment)
        input_row.add(self.expiration_aliment)
        
        btn_ajouter = toga.Button(
            "✅ Ajouter à l'inventaire",
            on_press=lambda widget: event_handlers.on_ajouter_aliment(None, inventory, widget_manager, self.nom_aliment, self.quantite_aliment, self.expiration_aliment, window, _last_cache_time, _stats_cache),
            style=self.create_glass_button_style(palette,'success')
        )

        ajout_box.add(ajout_title)
        ajout_box.add(self.nom_aliment)
        ajout_box.add(input_row)
        ajout_box.add(btn_ajouter)
        
        # Section actions
        actions_card = toga.Box(style=self.create_modern_card_style(palette))
        actions_title = toga.Label(
            "🎯 Actions rapides",
            style=Pack(font_size=18, font_weight="bold", padding=10, color=palette.MODERN_COLORS['text_primary'])
        )
    
        actions_box = toga.Box(style=Pack(direction=ROW, padding=10))
        
        btn_afficher = toga.Button(
            "📋 Voir inventaire",
            on_press=lambda widget: event_handlers.afficher_inventaire(None, inventory, window),
            style=Pack(
                **self.create_glass_button_style(palette, 'info'),
                flex=1,  # Occupe la moitié de l'espace disponible
                padding_right=5  # Petit espacement entre les deux inputs
            )
        )
        
        btn_expires = toga.Button(
            "⚠️ Aliments expirés",
            on_press=lambda widget: event_handlers.afficher_expires(None, inventory, window),
            style=Pack(
                **self.create_glass_button_style(palette, 'danger'),
                flex=1,  # Occupe la moitié de l'espace disponible
                padding_right=5  # Petit espacement entre les deux inputs
            )
        )
        
        btn_stats = toga.Button(
            "📊 Statistiques",
            on_press=lambda widget: event_handlers.afficher_statistiques(None, inventory, window),
            style=Pack(
                **self.create_glass_button_style(palette, 'warning'),
                flex=1,  # Occupe la moitié de l'espace disponible
                padding_right=5  # Petit espacement entre les deux inputs
            )
        )
        
        actions_box.add(btn_afficher)
        actions_box.add(btn_expires)
        actions_box.add(btn_stats)

        actions_card.add(actions_title)
        actions_card.add(actions_box)

        # Assemblage de l'onglet inventaire
        # Assemblage final
        main_container.add(grid_card)
        main_container.add(ajout_box)
        main_container.add(actions_card)
        
        self.inventaire_box.add(header_box)
        self.inventaire_box.add(main_container)
        
        return self.inventaire_box

    def create_regimes_tab(self, diet_manager, event_handlers, window):
        """Création de l'onglet régimes alimentaires"""
        self.regimes_box = toga.Box(
            style=Pack(
                direction=COLUMN, 
                flex=1, 
                padding=10, 
                background_color="#f8f9fa"
            )
        )
        
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
                on_change=lambda widget, regime=regime: event_handlers.toggle_regime(regime, widget.value, diet_manager, self.regime_checkboxes, window),
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
                on_change=lambda widget, allergie=allergie: event_handlers.toggle_allergie(allergie, widget.value, diet_manager, self.regime_checkboxes),
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
            on_press=lambda widget: diet_manager.afficher_resume_preferences(window),
            style=Pack(flex=1, padding=5, background_color="#4CAF50", color="white")
        )
        
        btn_reset = toga.Button(
            "🔄 Réinitialiser",
            on_press=lambda widget: diet_manager.reset_preferences(),
            style=Pack(flex=1, padding=5, background_color="#f44336", color="white")
        )
        
        actions_box.add(btn_resume)
        actions_box.add(btn_reset)
        
        # Assemblage de l'onglet régimes
        self.regimes_box.add(title_label)
        self.regimes_box.add(regimes_section)
        self.regimes_box.add(allergies_section)
        self.regimes_box.add(actions_box)

        return self.regimes_box

    def create_recettes_tab(self, inventory_manager, event_handlers, diet_manager, recipe_manager, window):
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
            on_press=lambda widget: (
                event_handlers.recherche_recettes_optimisee(None,inventory_manager, diet_manager, recipe_manager, window),
            ),
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
            on_press=lambda widget, nom_recette=self.nom_recette: event_handlers.recherche_recettes_par_nom(None, nom_recette, diet_manager, recipe_manager, window),
            style=Pack(padding=5, background_color="#FF9800", color="white")
        )
        
        nom_box.add(nom_title)
        nom_box.add(self.nom_recette)
        nom_box.add(btn_recherche_nom)
        
        # Section statistiques
        stats_box = toga.Box(style=Pack(direction=ROW, padding=10))
        
        btn_aliments_expires = toga.Button(
            "⏰ Aliments à utiliser",
            on_press=lambda widget: inventory_manager.afficher_aliments_prioritaires(None, window),
            style=Pack(flex=1, padding=5, background_color="#f44336", color="white")
        )
        
        btn_suggestions = toga.Button(
            "💡 Suggestions d'achats",
            on_press=lambda widget: inventory_manager.suggestions_achats(None, diet_manager, window),
            style=Pack(flex=1, padding=5, background_color="#2196F3", color="white")
        )
        
        stats_box.add(btn_aliments_expires)
        stats_box.add(btn_suggestions)
        
        # Assemblage de l'onglet recettes
        self.recettes_box.add(title_label)
        self.recettes_box.add(recherche_box)
        self.recettes_box.add(nom_box)
        self.recettes_box.add(stats_box)

        return self.recettes_box

    # Méthodes de navigation

    def show_inventaire_tab(self, content_container):
        """Affiche l'onglet inventaire"""
        self.current_tab = "inventaire"
        content_container.content = self.inventaire_box

    def show_regimes_tab(self, content_container):
        """Affiche l'onglet régimes"""
        self.current_tab = "regimes"
        content_container.content = self.regimes_box

    def show_recettes_tab(self, content_container):
        """Affiche l'onglet recettes"""
        self.current_tab = "recettes"
        content_container.content = self.recettes_box

    # 2. STYLES DE CARTES MODERNES AVEC OMBRES
    def create_modern_card_style(self, palette):
        return Pack(
            direction=COLUMN,
            padding=20,
            background_color=palette.MODERN_COLORS['bg_card'],
            # Simulation d'ombre avec border et background
            margin=10
        )

    # 3. BOUTONS AVEC EFFET GLASSMORPHISM
    def create_glass_button_style(self, palette, color_key='success'):
        return Pack(
            padding=15,
            background_color=palette.MODERN_COLORS[color_key],
            color=palette.MODERN_COLORS['text_white'],
            margin=5,
            text_align=CENTER,
            font_weight="bold"
        )

    # 4. NAVIGATION MODERNE AVEC INDICATEURS VISUELS
    def create_modern_nav_style(self, palette, is_active=False):
        if is_active:
            return Pack(
                flex=1,
                padding=15,
                background_color=palette.MODERN_COLORS['primary'],
                color=palette.MODERN_COLORS['text_white'],
                margin=3,
                text_align=CENTER,
                font_weight="bold"
            )
        else:
            return Pack(
                flex=1,
                padding=15,
                background_color=palette.MODERN_COLORS['bg_secondary'],
                color=palette.MODERN_COLORS['text_primary'],
                margin=3,
                text_align=CENTER,
                font_weight="bold"
            )

    # 5. INPUTS MODERNES AVEC MEILLEUR SPACING
    def create_modern_input_style(self, palette):
        return Pack(
            padding=12,
            margin=5,
            background_color=palette.MODERN_COLORS['bg_card'],
            font_size=14
        )

