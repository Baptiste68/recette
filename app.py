"""
Application principale de gestion d'inventaire alimentaire et de suggestions de recettes
avec optimisation et gestion des régimes alimentaires
"""

import toga
from toga.style import Pack
from toga.style.pack import COLUMN, ROW, CENTER

# Import des modules personnalisés
from diet_manager import DietManager
from inventory import InventoryManager
from recipe_manager import RecipeManager
from inventory_widgets import InventoryWidgetManager
from ui_tabs import TabManager
from app_handlers import EventHandlers
from palette import Palette

# Configuration
API_KEY = "ded78740b47643a18aecd38bc430db1a"

class InventaireApp(toga.App):
    def startup(self):
        # Initialisation des gestionnaires
        self.diet_manager = DietManager()
        self.inventory_manager = InventoryManager()
        self.recipe_manager = RecipeManager(API_KEY)

        self._inventory_cache = {}
        self._stats_cache = None
        self._last_cache_time = None
        
        # Délégation aux modules spécialisés
        self.widget_manager = InventoryWidgetManager(self)
        self.tab_manager = TabManager(self)
        self.palette = Palette()
        self.event_handlers = EventHandlers(self, self.palette)
        
        # État de l'application
        self.current_tab = "inventaire"
        
        self.main_window = toga.MainWindow(title=self.formal_name)

        # Interface minimale
        self.create_interface(self.palette)
        
        # Configuration de la fenêtre principale
        self.main_window.content = self.main_container
        self.main_window.show()

    def create_interface(self, palette):
        """Création de l'interface utilisateur avec onglets"""
        # Container principal
        #self.main_container = toga.Box(style=Pack(direction=COLUMN, padding=5))
        self.main_container = toga.Box(
                style=Pack(
                    direction=COLUMN,
                    padding=0,
                    background_color=palette.MODERN_COLORS['bg_primary']
                )
            )
        # Partie gauche - Interface principale
        left_container = toga.Box(style=Pack(direction=COLUMN, flex=2, padding=5))

        # Partie gauche - Interface principale
        self.inventory_panel = self.widget_manager.create_inventory_panel(self.inventory_manager)
        
        # Barre de navigation avec boutons stylisés
        self.tab_manager.create_inventaire_tab(self.widget_manager, self.inventory_manager, self.event_handlers, self.diet_manager, self._last_cache_time, self._stats_cache, self.main_window, self.palette)
        self.tab_manager.create_recettes_tab(self.inventory_manager, self.event_handlers, self.diet_manager,self.recipe_manager, self.main_window)
        self.tab_manager.create_regimes_tab(self.diet_manager, self.event_handlers, self.main_window)

        # Barre de navigation avec boutons stylisés
        nav_box = toga.Box(
            style=Pack(
                direction=ROW,
                padding=15,
                background_color=palette.MODERN_COLORS['bg_card'],
            )
        )
        
        # Container pour le contenu des onglets
        self.content_container = toga.ScrollContainer(
            style=Pack(
                flex=1,
                padding=0,
                background_color=palette.MODERN_COLORS['bg_primary']
            )
        )

        self.btn_inventaire = toga.Button(
            "📦 Inventaire",
            on_press=lambda widget: self.combine_inv(),
            style=self.tab_manager.create_modern_nav_style(palette, True)  # Actif par défaut
        )
        
        self.btn_regimes = toga.Button(
            "🥗 Régimes",
            on_press=lambda widget: self.combine_regimes(),
            style=self.tab_manager.create_modern_nav_style(palette, False)
        )
        
        self.btn_recettes = toga.Button(
            "🍽️ Recettes",
            on_press=lambda widget: self.combine_recettes(),
            style=self.tab_manager.create_modern_nav_style(palette, False)
        )

        nav_box.add(self.btn_inventaire)
        nav_box.add(self.btn_regimes)
        nav_box.add(self.btn_recettes)

        # Ajout à la partie gauche
        left_container.add(nav_box)
        left_container.add(self.content_container)

        # Ajout au container principal
        self.main_container.add(left_container)
        self.main_container.add(self.inventory_panel)
        # Affichage de l'onglet inventaire par défaut
        self.tab_manager.show_inventaire_tab(self.content_container)

    def update_nav_buttons(self):
        """Met à jour l'apparence moderne des boutons de navigation"""
        # Reset tous les boutons
        self.btn_inventaire.style = self.tab_manager.create_modern_nav_style(self.palette,False)
        self.btn_regimes.style = self.tab_manager.create_modern_nav_style(self.palette,False)
        self.btn_recettes.style = self.tab_manager.create_modern_nav_style(self.palette,False)
        
        # Highlight le bouton actif
        if self.tab_manager.current_tab == "inventaire":
            self.btn_inventaire.style = self.tab_manager.create_modern_nav_style(self.palette,True)
        elif self.tab_manager.current_tab == "regimes":
            self.btn_regimes.style = self.tab_manager.create_modern_nav_style(self.palette,True)
        elif self.tab_manager.current_tab == "recettes":
            self.btn_recettes.style = self.tab_manager.create_modern_nav_style(self.palette,True)

    def combine_inv(self):
        self.tab_manager.show_inventaire_tab(self.content_container)
        self.update_nav_buttons()
    def combine_recettes(self):
        self.tab_manager.show_recettes_tab(self.content_container)
        self.update_nav_buttons()
    def combine_regimes(self):
        self.tab_manager.show_regimes_tab(self.content_container)
        self.update_nav_buttons()


def main():
    """Point d'entrée de l'application"""
    return InventaireApp(
        "Gestion Inventaire & Recettes",
        "org.beeware.inventaire.optimise"
    )


if __name__ == "__main__":
    app = main()
    app.main_loop()