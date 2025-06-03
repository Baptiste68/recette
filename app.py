"""
Idee recettes
"""

import toga
from toga.style import Pack
from toga.style.pack import COLUMN, ROW
import requests

# Clé API Spoonacular
API_KEY = "ded78740b47643a18aecd38bc430db1a"

# Inventaire local
inventaire = {}

# Fonction pour ajouter un aliment à l'inventaire
def ajouter_aliment(widget, nom_aliment, quantite, expiration):
    if nom_aliment.value in inventaire:
        inventaire[nom_aliment.value]['quantite'] += int(quantite.value)
    else:
        inventaire[nom_aliment.value] = {
            'quantite': int(quantite.value),
            'expiration': expiration.value
        }
    nom_aliment.value = ""
    quantite.value = ""
    expiration.value = ""
    widget.app.main_window.info_dialog("Succès", f"{nom_aliment.value} ajouté à l'inventaire.")

# Fonction pour afficher l'inventaire
def afficher_inventaire():
    inventaire_str = "\n".join(
        [f"{nom} - Quantité : {details['quantite']} - Expiration : {details['expiration'] or 'Non spécifiée'}"
         for nom, details in inventaire.items()]
    )
    return inventaire_str if inventaire_str else "Inventaire vide."

# Fonction pour récupérer des recettes depuis Spoonacular
def recuperer_recettes(widget):
    aliments = ",".join(inventaire.keys())
    url = f"https://api.spoonacular.com/recipes/findByIngredients?ingredients={aliments}&number=5&apiKey={API_KEY}"
    response = requests.get(url)
    if response.status_code == 200:
        recettes = response.json()
        recettes_str = "\n".join([f"{recette['title']} (Manque {recette['missedIngredientCount']} ingrédients)"
                                  for recette in recettes])
        widget.app.main_window.info_dialog("Recettes suggérées", recettes_str)
    else:
        widget.app.main_window.error_dialog("Erreur", "Impossible de récupérer les recettes.")

# Application BeeWare
class InventaireApp(toga.App):
    def startup(self):
        # Fenêtre principale
        main_box = toga.Box(style=Pack(direction=COLUMN, padding=10))

        # Champs pour ajouter un aliment
        nom_aliment = toga.TextInput(placeholder="Nom de l'aliment", style=Pack(flex=1))
        quantite = toga.TextInput(placeholder="Quantité", style=Pack(flex=1))
        expiration = toga.TextInput(placeholder="Date d'expiration (YYYY-MM-DD)", style=Pack(flex=1))
        bouton_ajouter = toga.Button(
            "Ajouter à l'inventaire",
            on_press=lambda widget: ajouter_aliment(widget, nom_aliment, quantite, expiration),
            style=Pack(padding=10)
        )

        # Bouton pour afficher l'inventaire
        bouton_afficher_inventaire = toga.Button(
            "Afficher l'inventaire",
            on_press=lambda widget: self.main_window.info_dialog("Inventaire", afficher_inventaire()),
            style=Pack(padding=10)
        )

        # Bouton pour récupérer des recettes
        bouton_recettes = toga.Button(
            "Suggérer des recettes",
            on_press=recuperer_recettes,
            style=Pack(padding=10)
        )

        # Ajout des widgets à la fenêtre
        main_box.add(nom_aliment)
        main_box.add(quantite)
        main_box.add(expiration)
        main_box.add(bouton_ajouter)
        main_box.add(bouton_afficher_inventaire)
        main_box.add(bouton_recettes)

        self.main_window = toga.MainWindow(title=self.formal_name)
        self.main_window.content = main_box
        self.main_window.show()

# Lancer l'application
def main():
    return InventaireApp("Gestion d'Inventaire", "org.beeware.inventaire")