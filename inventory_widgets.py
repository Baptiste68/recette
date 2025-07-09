"""
Module de gestion des widgets d'inventaire
"""

import toga
from toga.style import Pack
from toga.style.pack import COLUMN, ROW, CENTER
import asyncio
from datetime import datetime, timedelta

class InventoryWidgetManager:
    def __init__(self, app_instance):
        self.app = app_instance
        self.inventory_widgets = {}
    
    def create_inventory_panel(self, inventory_manager):
        """ Code du panneau inventaire"""
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
            on_press=lambda widget: self.refresh_inventory_display(None, inventory_manager),
            style=Pack(padding=5, background_color="#6c757d", color="white")
        )
        
        # Assemblage du panneau
        inventory_container.add(inventory_title)
        inventory_container.add(self.stats_label)
        inventory_container.add(self.inventory_scroll)
        inventory_container.add(refresh_btn)
        
        return inventory_container

    def create_inventory_item_widget(self, nom, details, inventory_manager):
        """ Création des widgets d'items"""
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
        icone = inventory_manager.obtenir_icone_aliment(nom)
        nom_label = toga.Label(
            f"{icone} {nom}",
            style=Pack(font_weight="bold", font_size=14)
        )

        # Container pour quantité avec boutons +/-
        quantite_box = toga.Box(style=Pack(direction=ROW, padding=2))
    
        # Bouton moins
        btn_moins = toga.Button(
            "➖",
            on_press=lambda widget, aliment=nom: (
                inventory_manager.modifier_quantite(aliment, -1),
                # 🟢 Mise à jour ciblée
                self.update_inventory_stats,
                self.update_single_inventory_item(aliment, inventory_manager),
            ),
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
            on_press=lambda widget, aliment=nom: (
                inventory_manager.modifier_quantite(aliment, 1),
                # 🟢 Mise à jour ciblée
                self.update_inventory_stats,
                self.update_single_inventory_item(aliment, inventory_manager),
            ),
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
        statut = inventory_manager.obtenir_statut_expiration(nom)
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
            on_press=lambda widget, aliment=nom: (
                inventory_manager.supprimer_aliment(aliment),
                self.refresh_inventory_display(None, inventory_manager),
            ),
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
    
    def create_predefined_food_grid(self, event_handlers, diet_manager, widget_manager, inventory_manager, _last_cache_time, _stats_cache, window):
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
                        on_press=lambda widget, nom_aliment=nom: event_handlers.ajouter_aliment_rapide(nom_aliment, diet_manager, widget_manager, inventory_manager, _last_cache_time, _stats_cache, window),
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
 
    def update_single_inventory_item(self, nom_aliment, inventory_manager):
        """🟢 Met à jour UN SEUL élément sans recréer toute la liste"""
        inventaire = inventory_manager.obtenir_inventaire()

        if nom_aliment not in inventaire:
            # L'aliment a été supprimé, faire un refresh complet
            self.refresh_inventory_display(None, inventory_manager)
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
                            new_widget = self.create_inventory_item_widget(nom_aliment, details, inventory_manager)
                            self.inventory_list_box.insert(i, new_widget)
                            self.inventory_list_box.remove(child)
                            return
        
        # Si pas trouvé, c'est un nouvel élément
        details = inventaire[nom_aliment]
        new_widget = self.create_inventory_item_widget(nom_aliment, details, inventory_manager)
        self.inventory_list_box.add(new_widget)
        # Séparateur
        separator = toga.Box(
            style=Pack(height=1, background_color="#dee2e6", padding_top=2, padding_bottom=2)
        )
        self.inventory_list_box.add(separator)
    
    def refresh_inventory_display(self, widget, inventory_manager):
         """Met à jour l'affichage de l'inventaire"""
         print("lwqwe")
        # Vider la liste actuelle
         self.inventory_list_box.clear()
        
        # Obtenir l'inventaire actuel
         inventaire = inventory_manager.obtenir_inventaire()
        
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
                item_widget = self.create_inventory_item_widget(nom, details, inventory_manager)
                self.inventory_list_box.add(item_widget)
                
                # Séparateur
                separator = toga.Box(
                    style=Pack(height=1, background_color="#dee2e6", padding_top=2, padding_bottom=2)
                )
                self.inventory_list_box.add(separator)
            
            # Mettre à jour les statistiques
            stats = inventory_manager.obtenir_statistiques()
            self.stats_label.text = f"📊 {stats['total_aliments']} aliments | 🔴 {stats['expires']} expirés"
    
    def update_inventory_stats(self, _last_cache_time, _stats_cache, inventory_manager):
        """Version cachée des statistiques"""
        current_time = datetime.now()

         # Cache valide pendant 5 secondes
        if (_last_cache_time and 
             (current_time - _last_cache_time).seconds < 5 and
             _stats_cache):
             stats = _stats_cache
        else:
             stats = inventory_manager.obtenir_statistiques()
             _stats_cache = stats
             _last_cache_time = current_time
        
        self.stats_label.text = f"📊 {stats['total_aliments']} aliments | 🔴 {stats['expires']} expirés"

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
    
    def add_or_update_inventory_item(self, nom_aliment, inventory_manager):
        """🟢 Ajoute ou met à jour sans refresh complet"""
        # Vérifier si l'aliment existe déjà
        inventaire = inventory_manager.obtenir_inventaire()
        
        if nom_aliment in inventaire:
            # Mise à jour d'un existant
            self.update_single_inventory_item(nom_aliment, inventory_manager)
        else:
            # Nouvel aliment - l'ajouter à la fin
            details = inventaire.get(nom_aliment, {'quantite': 1})
            new_widget = self.create_inventory_item_widget(nom_aliment, details, inventory_manager)
            self.inventory_list_box.add(new_widget)
            
            # Séparateur
            separator = toga.Box(
                style=Pack(height=1, background_color="#dee2e6", padding_top=2, padding_bottom=2)
            )
            self.inventory_list_box.add(separator)