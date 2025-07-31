import toga
from toga.style import Pack
from toga.style.pack import COLUMN, ROW, CENTER
import math
import io
from PIL import Image
import requests

class RecipeDisplayManager:
    """Gestionnaire d'affichage des recettes avec pagination"""
    
    def __init__(self, palette):
        self.palette = palette
        self.current_page = 0
        self.recipes_per_page = 1
        self.current_recipes = []
        self.inventaire = {}
        self.recipe_window = None
        self.recipe_manager = None
        
    def show_recipes_paginated(self, recettes, inventaire, window, recipe_manager=None):
        """Affiche les recettes avec pagination dans une nouvelle fenêtre"""
        self.current_recipes = recettes
        self.inventaire = inventaire
        self.recipe_manager = recipe_manager
        self.current_page = 0
        
        # Création de la fenêtre de recettes
        self.recipe_window = toga.Window(
            title="🍽️ Recettes Suggérées",
            size=(500, 400),
            position=(100, 100),
            resizable= True
        )
        
        # Container principal avec scroll
        self.main_scroll = toga.ScrollContainer(
            style=Pack(
                flex=1,
                background_color=self.palette.MODERN_COLORS['bg_primary']
            )
        )

        # Container principal
        main_box = toga.Box(
            style=Pack(
                direction=COLUMN,
                flex=1,
                padding=0,
                background_color=self.palette.MODERN_COLORS['bg_primary']
            )
        )
        
        # Header
        header_box = self.create_header()
        main_box.add(header_box)
        
        # Container pour le contenu dynamique
        self.content_container = toga.Box(
            style=Pack(
                direction=COLUMN,
                flex=1,
                padding=20,
                background_color=self.palette.MODERN_COLORS['bg_primary']
            )
        )
        
        main_box.add(self.content_container)
        
        # Affichage initial
        self.update_content()
        
        # Affichage de la fenêtre
        # MODIFICATION: Utiliser le ScrollContainer
        self.main_scroll.content = main_box
        self.recipe_window.content = self.main_scroll
        self.recipe_window.show()
        #self.recipe_window.content = main_box
        #self.recipe_window.show()
        
    def create_header(self):
        """Crée le header avec titre et informations"""
        header_box = toga.Box(
            style=Pack(
                direction=COLUMN,
                padding=25,
                background_color=self.palette.MODERN_COLORS['primary'],
                text_align=CENTER
            )
        )
        
        title_label = toga.Label(
            "🍽️ Recettes Suggérées",
            style=Pack(
                text_align=CENTER,
                font_size=24,
                font_weight="bold",
                color=self.palette.MODERN_COLORS['text_white'],
                padding=5
            )
        )
        
        subtitle_label = toga.Label(
            f"📊 {len(self.current_recipes)} recettes trouvées • Optimisées pour votre inventaire",
            style=Pack(
                text_align=CENTER,
                font_size=14,
                color=self.palette.MODERN_COLORS['text_white'],
                padding=5
            )
        )
        
        header_box.add(title_label)
        header_box.add(subtitle_label)
        
        return header_box
        
    def update_content(self):
        """Met à jour le contenu avec la page actuelle"""
        # Vider le container
        self.content_container.clear()
        
        total_pages = math.ceil(len(self.current_recipes) / self.recipes_per_page)
        
        if self.current_page == 0:
            # Page d'accueil avec résumé
            self.show_overview_page(total_pages)
        else:
            # Page de recettes détaillées
            self.show_recipe_page()
            
        # Navigation
        nav_box = self.create_navigation(total_pages)
        self.content_container.add(nav_box)
        
    def show_overview_page(self, total_pages):
        """Affiche la page d'accueil avec résumé des recettes"""
        # Card de résumé
        overview_card = toga.Box(
            style=Pack(
                direction=COLUMN,
                padding=20,
                background_color=self.palette.MODERN_COLORS['bg_secondary'],
                text_align=CENTER
            )
        )
        
        overview_title = toga.Label(
            "📋 Résumé des Recettes",
            style=Pack(
                text_align=CENTER,
                font_size=20,
                font_weight="bold",
                color=self.palette.MODERN_COLORS['text_primary'],
                padding=10
            )
        )
        overview_card.add(overview_title)
        
        # Statistiques
        stats_box = toga.Box(style=Pack(direction=ROW, padding=10))
        
        # Répartition par match
        perfect_matches = sum(1 for r in self.current_recipes if r.get('missedIngredientCount', 0) == 0)
        good_matches = sum(1 for r in self.current_recipes if 0 < r.get('missedIngredientCount', 0) <= 2)
        partial_matches = len(self.current_recipes) - perfect_matches - good_matches
        
        stats_perfect = toga.Label(
            f"⭐ {perfect_matches}\nMatchs parfaits",
            style=Pack(
                text_align=CENTER,
                font_size=14,
                color=self.palette.MODERN_COLORS['success'],
                padding=5,
                flex=1
            )
        )
        
        stats_good = toga.Label(
            f"🔥 {good_matches}\nBons matchs",
            style=Pack(
                text_align=CENTER,
                font_size=14,
                color=self.palette.MODERN_COLORS['warning'],
                padding=5,
                flex=1
            )
        )
        
        stats_partial = toga.Label(
            f"👍 {partial_matches}\nMatchs partiels",
            style=Pack(
                text_align=CENTER,
                font_size=14,
                color=self.palette.MODERN_COLORS['info'],
                padding=5,
                flex=1
            )
        )
        
        stats_box.add(stats_perfect)
        stats_box.add(stats_good)
        stats_box.add(stats_partial)
        overview_card.add(stats_box)
        
        # Liste des pages avec liens
        pages_title = toga.Label(
            "📄 Pages de Recettes",
            style=Pack(
                text_align=CENTER,
                font_size=18,
                font_weight="bold",
                color=self.palette.MODERN_COLORS['text_primary'],
                padding=15
            )
        )
        overview_card.add(pages_title)
        
        # Boutons vers les pages
        pages_grid = toga.Box(style=Pack(direction=COLUMN, padding=10))
        
        for page_num in range(1, total_pages + 1):
            start_idx = (page_num - 1) * self.recipes_per_page
            end_idx = min(start_idx + self.recipes_per_page, len(self.current_recipes))
            
            page_recipes = self.current_recipes[start_idx:end_idx]
            page_titles = [r['title'][:30] + "..." if len(r['title']) > 30 else r['title'] 
                          for r in page_recipes]
            
            page_btn = toga.Button(
                f"📖 Page {page_num} • {', '.join(page_titles)}",
                on_press=lambda widget, page=page_num: self.go_to_page(page),
                style=Pack(
                    padding=8,
                    background_color=self.palette.MODERN_COLORS['accent'],
                    color=self.palette.MODERN_COLORS['text_white'],
                    font_size=12,
                    text_align=CENTER
                )
            )
            pages_grid.add(page_btn)
            
        overview_card.add(pages_grid)
        self.content_container.add(overview_card)
        
    def show_recipe_page(self):
        """Affiche une page de recettes détaillées"""
        start_idx = (self.current_page - 1) * self.recipes_per_page
        end_idx = min(start_idx + self.recipes_per_page, len(self.current_recipes))
        
        page_recipes = self.current_recipes[start_idx:end_idx]
        
        # Titre de la page
        page_title = toga.Label(
            f"📖 Page {self.current_page} • Recettes {start_idx + 1} à {end_idx}",
            style=Pack(
                text_align=CENTER,
                font_size=18,
                font_weight="bold",
                color=self.palette.MODERN_COLORS['text_primary'],
                padding=15
            )
        )
        self.content_container.add(page_title)
        
        # Affichage des recettes
        for i, recette in enumerate(page_recipes, start_idx + 1):
            recipe_card = self.create_recipe_card(recette, i)
            self.content_container.add(recipe_card)
            
    def create_recipe_card(self, recette, index):
        """Crée une card pour une recette"""
        print(recette)
        print(recette['image'])
        card = toga.Box(
            style=Pack(
                direction=COLUMN,
                padding=15,
                background_color=self.palette.MODERN_COLORS['bg_secondary'],
                margin=10
            )
        )
        
        # Container horizontal pour image et contenu
        main_content = toga.Box(style=Pack(direction=ROW, padding=5))
        
        # Image de la recette
        image_container = toga.Box(
            style=Pack(
                direction=COLUMN,
                width=150,
                height=150,
                padding=10,
                background_color=self.palette.MODERN_COLORS['bg_primary']
            )
        )

        # Tentative de chargement de l'image
        try:
            if 'image' in recette and recette['image']:
                print("jeirw")
                """
                recipe_image = toga.ImageView(
                    image=self.simple_image_from_url(recette['image'],130,130),
                    style=Pack(width=130, height=130)
                )
                image_container.add(recipe_image)
                """
                image_url = recette.get('image')
                if image_url:
                    toga_image = self.simple_image_from_url(image_url, 130, 130)
                    if toga_image:
                        recipe_image = toga.ImageView(
                            image=toga_image,
                            style=Pack(width=130, height=130)
                        )
                        image_container.add(recipe_image)
            else:
                # Image par défaut si pas d'image
                placeholder = toga.Label(
                    "🍽️",
                    style=Pack(
                        text_align=CENTER,
                        font_size=48,
                        color=self.palette.MODERN_COLORS['text_secondary'],
                        padding=40
                    )
                )
                image_container.add(placeholder)
        except:
            # Fallback en cas d'erreur
            placeholder = toga.Label(
                "🍽️",
                style=Pack(
                    text_align=CENTER,
                    font_size=48,
                    color=self.palette.MODERN_COLORS['text_secondary'],
                    padding=40
                )
            )
            image_container.add(placeholder)
        
        # Container pour le contenu textuel
        text_content = toga.Box(
            style=Pack(
                direction=COLUMN,
                flex=1,
                padding=10
            )
        )
        
        # En-tête de la recette
        header = toga.Box(style=Pack(direction=ROW, padding=5))
        
        titre = recette['title']
        ingredients_manques = recette.get('missedIngredientCount', 0)
        ingredients_utilises = recette.get('usedIngredientCount', 0)
        
        # Icône et score
        if ingredients_manques == 0:
            icone = "⭐"
            score = "PARFAIT MATCH !"
            score_color = self.palette.MODERN_COLORS['success']
        elif ingredients_manques <= 2:
            icone = "🔥"
            score = "TRÈS BON MATCH"
            score_color = self.palette.MODERN_COLORS['warning']
        else:
            icone = "👍"
            score = "BON MATCH"
            score_color = self.palette.MODERN_COLORS['info']
            
        title_label = toga.Label(
            f"{index}. {icone} {titre}",
            style=Pack(
                font_size=16,
                font_weight="bold",
                color=self.palette.MODERN_COLORS['text_primary'],
                flex=1
            )
        )
        
        score_label = toga.Label(
            score,
            style=Pack(
                font_size=12,
                font_weight="bold",
                color=score_color,
                text_align=CENTER
            )
        )
        
        header.add(title_label)
        header.add(score_label)
        card.add(header)
        
        # Informations détaillées
        info_box = toga.Box(style=Pack(direction=COLUMN, padding=10))
        
        utilise_label = toga.Label(
            f"✅ Utilise {ingredients_utilises} de vos ingrédients",
            style=Pack(
                font_size=12,
                color=self.palette.MODERN_COLORS['success'],
                padding=2
            )
        )
        info_box.add(utilise_label)
        
        if ingredients_manques > 0:
            manque_label = toga.Label(
                f"❌ Manque {ingredients_manques} ingrédient(s)",
                style=Pack(
                    font_size=12,
                    color=self.palette.MODERN_COLORS['danger'],
                    padding=2
                )
            )
            info_box.add(manque_label)
            
        # Ingrédients utilisés
        ingredients_utilises_details = recette.get('usedIngredients', [])
        if ingredients_utilises_details:
            noms_utilises = [ing['name'] for ing in ingredients_utilises_details[:3]]
            ingredients_text = ", ".join(noms_utilises)
            if len(ingredients_utilises_details) > 3:
                ingredients_text += f" (+ {len(ingredients_utilises_details) - 3} autres)"
                
            ingredients_label = toga.Label(
                f"🥘 Vos ingrédients: {ingredients_text}",
                style=Pack(
                    font_size=11,
                    color=self.palette.MODERN_COLORS['text_secondary'],
                    padding=2
                )
            )
            info_box.add(ingredients_label)
            
        card.add(info_box)
                
        # Boutons d'action
        actions_box = toga.Box(style=Pack(direction=ROW, padding=10))
        
        detail_btn = toga.Button(
            "📋 Voir détails",
            on_press=lambda widget, recipe=recette: self.show_recipe_details(recipe),
            style=Pack(
                padding=5,
                background_color=self.palette.MODERN_COLORS['accent'],
                color=self.palette.MODERN_COLORS['text_white'],
                font_size=12,
                flex=1,
                margin=2
            )
        )
        
        # Bouton pour ouvrir la recette complète
        if 'sourceUrl' in recette or 'spoonacularSourceUrl' in recette:
            url = recette.get('sourceUrl', recette.get('spoonacularSourceUrl'))
            web_btn = toga.Button(
                "🌐 Recette complète",
                on_press=lambda widget, url=url: self.open_recipe_url(url),
                style=Pack(
                    padding=5,
                    background_color=self.palette.MODERN_COLORS['primary'],
                    color=self.palette.MODERN_COLORS['text_white'],
                    font_size=12,
                    flex=1,
                    margin=2
                )
            )
            actions_box.add(web_btn)

        actions_box.add(detail_btn)
        text_content.add(actions_box)
        
        main_content.add(image_container)
        main_content.add(text_content)
        card.add(main_content)

        return card
        
    def create_navigation(self, total_pages):
        """Crée la barre de navigation"""
        nav_box = toga.Box(
            style=Pack(
                direction=ROW,
                padding=20,
                background_color=self.palette.MODERN_COLORS['bg_secondary']
            )
        )
        
        # Bouton Accueil
        home_btn = toga.Button(
            "🏠 Accueil",
            on_press=lambda widget: self.go_to_page(0),
            style=Pack(
                padding=10,
                background_color=self.palette.MODERN_COLORS['primary'] if self.current_page == 0 else self.palette.MODERN_COLORS['accent'],
                color=self.palette.MODERN_COLORS['text_white'],
                margin=5
            )
        )
        nav_box.add(home_btn)
        
        # Bouton Précédent
        if self.current_page > 0:
            prev_btn = toga.Button(
                "⬅️ Précédent",
                on_press=lambda widget: self.go_to_page(self.current_page - 1),
                style=Pack(
                    padding=10,
                    background_color=self.palette.MODERN_COLORS['accent'],
                    color=self.palette.MODERN_COLORS['text_white'],
                    margin=5
                )
            )
            nav_box.add(prev_btn)
            
        # Indicateur de page
        page_info = toga.Label(
            f"Page {self.current_page} sur {total_pages}",
            style=Pack(
                text_align=CENTER,
                font_size=14,
                color=self.palette.MODERN_COLORS['text_primary'],
                padding=10,
                flex=1
            )
        )
        nav_box.add(page_info)
        
        # Bouton Suivant
        if self.current_page < total_pages:
            next_btn = toga.Button(
                "➡️ Suivant",
                on_press=lambda widget: self.go_to_page(self.current_page + 1),
                style=Pack(
                    padding=10,
                    background_color=self.palette.MODERN_COLORS['accent'],
                    color=self.palette.MODERN_COLORS['text_white'],
                    margin=5
                )
            )
            nav_box.add(next_btn)
            
        return nav_box
        
    def go_to_page(self, page_num):
        """Navigue vers une page spécifique"""
        self.current_page = page_num
        self.update_content()

    # méthode pour ouvrir l'URL
    def open_recipe_url(self, url):
        """Ouvre l'URL de la recette dans le navigateur"""
        try:
            import webbrowser
            webbrowser.open(url)
        except Exception as e:
            if self.recipe_window:
                self.recipe_window.error_dialog(
                    "Erreur",
                    f"Impossible d'ouvrir le lien: {str(e)}"
                )

    # méthode pour afficher les détails
    def show_recipe_details(self, recipe):
        """Affiche les détails complets d'une recette"""
        if not self.recipe_manager:
            self.recipe_window.error_dialog(
                "Erreur",
                "Gestionnaire de recettes non disponible"
            )
            return
        
        # Récupérer les détails complets
        try:
            recipe_id = recipe.get('id')
            if not recipe_id:
                self.recipe_window.error_dialog(
                    "Erreur",
                    "ID de recette manquant"
                )
                return
            
            # Appeler l'API pour obtenir les détails
            success, message, details = self.recipe_manager.obtenir_details_recette(recipe_id)
            
            if success and details:
                self.show_recipe_details_window(details)
            else:
                self.recipe_window.error_dialog(
                    "Erreur",
                    f"Impossible de récupérer les détails: {message}"
                )
                
        except Exception as e:
            self.recipe_window.error_dialog(
                "Erreur",
                f"Erreur lors de la récupération des détails: {str(e)}"
            )

    # méthode pour la fenêtre de détails
    def show_recipe_details_window(self, recipe_details):
        """Affiche une fenêtre avec les détails complets de la recette"""
        details_window = toga.Window(
            title=f"🍽️ {recipe_details.get('title', 'Recette')}",
            size=(700, 800),
            position=(150, 50)
        )
        
        # Container principal avec scroll
        scroll_container = toga.ScrollContainer(
            style=Pack(
                flex=1,
                background_color=self.palette.MODERN_COLORS['bg_primary']
            )
        )
        
        main_box = toga.Box(
            style=Pack(
                direction=COLUMN,
                padding=20,
                background_color=self.palette.MODERN_COLORS['bg_primary']
            )
        )
        
        # Titre
        title_label = toga.Label(
            recipe_details.get('title', 'Recette'),
            style=Pack(
                text_align=CENTER,
                font_size=20,
                font_weight="bold",
                color=self.palette.MODERN_COLORS['text_primary'],
                padding=10
            )
        )
        main_box.add(title_label)
        
        # Temps de préparation et portions
        if 'readyInMinutes' in recipe_details or 'servings' in recipe_details:
            info_box = toga.Box(style=Pack(direction=ROW, padding=10))
            
            if 'readyInMinutes' in recipe_details:
                time_label = toga.Label(
                    f"⏱️ {recipe_details['readyInMinutes']} min",
                    style=Pack(
                        font_size=14,
                        color=self.palette.MODERN_COLORS['text_secondary'],
                        flex=1,
                        text_align=CENTER
                    )
                )
                info_box.add(time_label)
            
            if 'servings' in recipe_details:
                servings_label = toga.Label(
                    f"👥 {recipe_details['servings']} portions",
                    style=Pack(
                        font_size=14,
                        color=self.palette.MODERN_COLORS['text_secondary'],
                        flex=1,
                        text_align=CENTER
                    )
                )
                info_box.add(servings_label)
            
            main_box.add(info_box)
        
        # Ingrédients
        if 'extendedIngredients' in recipe_details:
            ingredients_title = toga.Label(
                "🥘 Ingrédients",
                style=Pack(
                    font_size=16,
                    font_weight="bold",
                    color=self.palette.MODERN_COLORS['text_primary'],
                    padding=10
                )
            )
            main_box.add(ingredients_title)
            
            for ingredient in recipe_details['extendedIngredients']:
                ingredient_text = ingredient.get('original', ingredient.get('name', ''))
                # Vérifier si on a cet ingrédient
                has_ingredient = any(
                    ing_name.lower() in ingredient_text.lower() 
                    for ing_name in self.inventaire.keys()
                )
                
                color = self.palette.MODERN_COLORS['success'] if has_ingredient else self.palette.MODERN_COLORS['text_secondary']
                icon = "✅" if has_ingredient else "🔸"
                
                ingredient_label = toga.Label(
                    f"{icon} {ingredient_text}",
                    style=Pack(
                        font_size=12,
                        color=color,
                        padding=3
                    )
                )
                main_box.add(ingredient_label)
        
        # Instructions
        if 'instructions' in recipe_details and recipe_details['instructions']:
            instructions_title = toga.Label(
                "📝 Instructions",
                style=Pack(
                    font_size=16,
                    font_weight="bold",
                    color=self.palette.MODERN_COLORS['text_primary'],
                    padding=10
                )
            )
            main_box.add(instructions_title)
            
            # Nettoyer les instructions HTML
            instructions_text = recipe_details['instructions']
            instructions_text = instructions_text.replace('<li>', '• ')
            instructions_text = instructions_text.replace('</li>', '\n')
            instructions_text = instructions_text.replace('<ol>', '').replace('</ol>', '')
            instructions_text = instructions_text.replace('<ul>', '').replace('</ul>', '')
            
            instructions_label = toga.Label(
                instructions_text,
                style=Pack(
                    font_size=12,
                    color=self.palette.MODERN_COLORS['text_secondary'],
                    padding=10
                )
            )
            main_box.add(instructions_label)
        
        # Boutons d'action
        actions_box = toga.Box(style=Pack(direction=ROW, padding=20))
        
        # Bouton fermer
        close_btn = toga.Button(
            "✖️ Fermer",
            on_press=lambda widget: details_window.close(),
            style=Pack(
                padding=10,
                background_color=self.palette.MODERN_COLORS['danger'],
                color=self.palette.MODERN_COLORS['text_white'],
                flex=1,
                margin=5
            )
        )
        actions_box.add(close_btn)
        
        # Bouton URL si disponible
        if 'sourceUrl' in recipe_details:
            url_btn = toga.Button(
                "🌐 Site original",
                on_press=lambda widget: self.open_recipe_url(recipe_details['sourceUrl']),
                style=Pack(
                    padding=10,
                    background_color=self.palette.MODERN_COLORS['primary'],
                    color=self.palette.MODERN_COLORS['text_white'],
                    flex=1,
                    margin=5
                )
            )
            actions_box.add(url_btn)
        
        main_box.add(actions_box)
        
        scroll_container.content = main_box
        details_window.content = scroll_container
        details_window.show()

    def simple_image_from_url(self, url, width=150, height=150):
        """
        Fonction simple pour récupérer une image depuis une URL
        À utiliser dans vos méthodes existantes
        """
        print("fonction")
        print(url)
        try:
            data = requests.get(url).content
            # Opening a new file named img with extension .jpg
            # This file would store the data of the image file
            f = open('img.jpg','wb')

            # Storing the image data inside the data variable to the file
            f.write(data)
            f.close()
            """
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            pil_image = Image.open(io.BytesIO(response.content))
            pil_image = pil_image.resize((width, height), Image.Resampling.LANCZOS)
            
            img_bytes = io.BytesIO()
            pil_image.save(img_bytes, format='PNG')
            img_bytes.seek(0)
            
            return toga.Image(img_bytes)
            """
            img = Image.open('img.jpg')
            return toga.Image(img)
        except:
            return None
