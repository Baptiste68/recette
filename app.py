"""
Idee recettes - Version sans émojis
"""

import toga
from toga.style import Pack
from toga.style.pack import COLUMN, ROW, LEFT, RIGHT, CENTER
import requests
import asyncio
from datetime import datetime, timedelta

# Clé API Spoonacular
API_KEY = "ded78740b47643a18aecd38bc430db1a"

inventaire = {}

# Application BeeWare
class InventaireApp(toga.App):
    def startup(self):
        # Configuration des couleurs et styles
        self.couleur_principale = "#2E7D32"  # Vert foncé
        self.couleur_secondaire = "#4CAF50"  # Vert clair
        self.couleur_accent = "#81C784"      # Vert pastel
        self.couleur_fond = "#F1F8E9"        # Vert très clair
        
        # Création de l'interface principale
        self.creer_interface()
        
        # Configuration de la fenêtre
        self.main_window = toga.MainWindow(title="Gestion d'Inventaire Alimentaire")
        self.main_window.content = self.conteneur_principal
        self.main_window.show()

    def creer_interface(self):
        # Conteneur principal avec ScrollContainer
        self.conteneur_principal = toga.ScrollContainer(
            style=Pack(
                direction=COLUMN,
                padding=20,
                background_color=self.couleur_fond
            )
        )
        
        # En-tête avec titre stylisé
        self.creer_entete()
        
        # Section d'ajout d'aliments
        self.creer_section_ajout()
        
        # Section d'affichage de l'inventaire
        self.creer_section_inventaire()
        
        # Section des recettes
        self.creer_section_recettes()
        
        # Assemblage des sections
        contenu_principal = toga.Box(style=Pack(direction=COLUMN))
        contenu_principal.add(self.entete)
        contenu_principal.add(self.section_ajout)
        contenu_principal.add(self.section_inventaire)
        contenu_principal.add(self.section_recettes)
        
        self.conteneur_principal.content = contenu_principal

    def creer_entete(self):
        """Crée un en-tête attrayant"""
        self.entete = toga.Box(style=Pack(
            direction=COLUMN,
            padding_bottom=30,
            text_align=CENTER
        ))
        
        # Titre principal
        titre = toga.Label(
            "*** MON INVENTAIRE ALIMENTAIRE ***",
            style=Pack(
                font_size=28,
                font_weight="bold",
                padding_bottom=10,
                text_align=CENTER
            )
        )
        
        # Sous-titre descriptif
        sous_titre = toga.Label(
            "Gerez vos aliments et decouvrez de delicieuses recettes",
            style=Pack(
                font_size=16,
                padding_bottom=20,
                text_align=CENTER
            )
        )
        
        self.entete.add(titre)
        self.entete.add(sous_titre)

    def creer_section_ajout(self):
        """Section pour ajouter des aliments avec design moderne"""
        self.section_ajout = toga.Box(style=Pack(
            direction=COLUMN,
            padding=20,
            background_color="#FFFFFF",
            text_align=LEFT
        ))
        
        # Titre de section
        titre_ajout = toga.Label(
            "[+] AJOUTER UN ALIMENT",
            style=Pack(
                font_size=20,
                font_weight="bold",
                padding_bottom=15
            )
        )
        
        # Conteneur pour les champs organisés
        conteneur_champs = toga.Box(style=Pack(
            direction=COLUMN,
            padding_bottom=15
        ))
        
        # Champ nom avec label
        label_nom = toga.Label("Nom de l'aliment :", style=Pack(padding_bottom=5))
        self.nom_aliment = toga.TextInput(
            placeholder="Ex: Tomates, Pommes, Lait...",
            style=Pack(
                padding=10,
                font_size=14,
                width=300
            )
        )
        
        # Conteneur pour quantité et expiration en ligne
        conteneur_ligne = toga.Box(style=Pack(direction=ROW, padding_top=10))
        
        # Champ quantité
        conteneur_quantite = toga.Box(style=Pack(direction=COLUMN, flex=1, padding_right=10))
        label_quantite = toga.Label("Quantite :", style=Pack(padding_bottom=5))
        self.quantite = toga.TextInput(
            placeholder="Ex: 5",
            style=Pack(padding=8, font_size=14)
        )
        
        # Champ expiration
        conteneur_expiration = toga.Box(style=Pack(direction=COLUMN, flex=1))
        label_expiration = toga.Label("Date d'expiration :", style=Pack(padding_bottom=5))
        self.expiration = toga.TextInput(
            placeholder="YYYY-MM-DD",
            style=Pack(padding=8, font_size=14)
        )
        
        # Bouton d'ajout
        self.bouton_ajouter = toga.Button(
            "AJOUTER A L'INVENTAIRE",
            on_press=self.ajouter_aliment,
            style=Pack(
                padding=15,
                font_size=16,
                font_weight="bold",
                width=250,
                background_color=self.couleur_principale,
                color="#FFFFFF"
            )
        )
        
        # Assemblage des éléments
        conteneur_champs.add(label_nom)
        conteneur_champs.add(self.nom_aliment)
        
        conteneur_quantite.add(label_quantite)
        conteneur_quantite.add(self.quantite)
        conteneur_expiration.add(label_expiration)
        conteneur_expiration.add(self.expiration)
        
        conteneur_ligne.add(conteneur_quantite)
        conteneur_ligne.add(conteneur_expiration)
        
        self.section_ajout.add(titre_ajout)
        self.section_ajout.add(conteneur_champs)
        self.section_ajout.add(conteneur_ligne)
        self.section_ajout.add(toga.Box(style=Pack(padding_top=15)))
        self.section_ajout.add(self.bouton_ajouter)

    def creer_section_inventaire(self):
        """Section d'affichage de l'inventaire avec style moderne"""
        self.section_inventaire = toga.Box(style=Pack(
            direction=COLUMN,
            padding=20,
            padding_top=30,
            background_color="#FFFFFF"
        ))
        
        # En-tête de section avec bouton
        entete_inventaire = toga.Box(style=Pack(direction=ROW))
        titre_inventaire = toga.Label(
            "[*] MON INVENTAIRE",
            style=Pack(
                font_size=20,
                font_weight="bold",
                flex=1
            )
        )
        
        self.bouton_actualiser = toga.Button(
            "ACTUALISER",
            on_press=self.actualiser_inventaire,
            style=Pack(
                padding=10,
                background_color=self.couleur_secondaire,
                color="#FFFFFF"
            )
        )
        
        # Zone d'affichage permanente de l'inventaire
        """
        self.zone_inventaire = toga.MultilineTextInput(
            readonly=True,
            placeholder="Votre inventaire",
            style=Pack(
                height=200,
                padding=15,
                font_size=14,
                background_color=self.couleur_fond
            )
        )
        """

        # Zone d'affichage permanente de l'inventaire
        self.zone_inventaire = toga.Box(style=Pack(
            padding=15,
            font_size=14,
            direction=COLUMN,
            background_color=self.couleur_fond
        ))

        entete_inventaire.add(titre_inventaire)
        entete_inventaire.add(self.bouton_actualiser)
        
        self.section_inventaire.add(entete_inventaire)
        self.section_inventaire.add(toga.Box(style=Pack(padding_top=15)))
        self.section_inventaire.add(self.zone_inventaire)
        self.actualiser_inventaire(None)

    def creer_section_recettes(self):
        """Section des recettes avec design attrayant"""
        self.section_recettes = toga.Box(style=Pack(
            direction=COLUMN,
            padding=20,
            padding_top=30,
            background_color="#FFFFFF"
        ))
        
        # Titre et bouton organisés
        entete_recettes = toga.Box(style=Pack(direction=ROW))
        titre_recettes = toga.Label(
            "[?] SUGGESTIONS DE RECETTES",
            style=Pack(
                font_size=20,
                font_weight="bold",
                flex=1
            )
        )
        
        self.bouton_recettes = toga.Button(
            "TROUVER DES RECETTES",
            on_press=self.recuperer_recettes,
            style=Pack(
                padding=12,
                font_size=14,
                font_weight="bold",
                background_color=self.couleur_accent,
                color="#000000"
            )
        )
        
        # Zone d'affichage permanente des recettes
        self.zone_recettes = toga.MultilineTextInput(
            readonly=True,
            placeholder="Les recettes suggerees apparaitront ici...\nAjoutez des aliments a votre inventaire puis cliquez sur 'Trouver des Recettes'",
            style=Pack(
                height=250,
                padding=15,
                font_size=14,
                background_color=self.couleur_fond
            )
        )
        
        entete_recettes.add(titre_recettes)
        entete_recettes.add(self.bouton_recettes)
        
        self.section_recettes.add(entete_recettes)
        self.section_recettes.add(toga.Box(style=Pack(padding_top=15)))
        self.section_recettes.add(self.zone_recettes)

    def ajouter_aliment(self, widget):
        """Ajouter un aliment avec validation améliorée"""
        nom = self.nom_aliment.value.strip().title()
        
        if not nom:
            self.main_window.error_dialog("Erreur", "Veuillez saisir le nom de l'aliment.")
            return
        
        try:
            quantite_val = int(self.quantite.value) if self.quantite.value else 1
        except ValueError:
            self.main_window.error_dialog("Erreur", "La quantite doit etre un nombre entier.")
            return
        
        expiration_val = self.expiration.value.strip() if self.expiration.value else "Non specifiee"
        
        # Validation de la date si fournie
        if expiration_val != "Non specifiee":
            try:
                datetime.strptime(expiration_val, "%Y-%m-%d")
            except ValueError:
                self.main_window.error_dialog("Erreur", "Format de date incorrect. Utilisez YYYY-MM-DD")
                return
        
        # Ajout ou mise à jour
        if nom in inventaire:
            inventaire[nom]['quantite'] += quantite_val
            message = f"[OK] {nom} mis a jour !\nQuantite totale : {inventaire[nom]['quantite']}"
        else:
            inventaire[nom] = {
                'quantite': quantite_val,
                'expiration': expiration_val
            }
            message = f"[OK] {nom} ajoute avec succes !\nQuantite : {quantite_val}"
        
        # Nettoyage des champs
        self.nom_aliment.value = ""
        self.quantite.value = ""
        self.expiration.value = ""
        
        # Actualisation automatique de l'inventaire
        self.actualiser_inventaire(None)
        
        self.main_window.info_dialog("Succes", message)

    def actualiser_inventaire(self, widget):
        """Actualise l'affichage de l'inventaire avec format amélioré"""
        if not inventaire:
            self.zone_inventaire.clear()
            inventaire_vide = toga.Label(
                f"[VIDE] Votre inventaire est vide.\nAjoutez des aliments pour commencer !",
                style=Pack(font_size=14, flex=1)
            )
            self.zone_inventaire.add(inventaire_vide)
            return

        print(inventaire)
        # Clear the current content before updating
        self.zone_inventaire.clear()
        print(inventaire)
        for nom, details in inventaire.items():
            quantite = details['quantite']
            expiration = details['expiration']
            
            # Icône selon le type d'aliment
            icone = self.obtenir_icone_aliment(nom)
            
            # Formatage de l'expiration avec alertes
            if expiration != "Non specifiee":
                try:
                    date_exp = datetime.strptime(expiration, "%Y-%m-%d")
                    jours_restants = (date_exp - datetime.now()).days
                    
                    if jours_restants < 0:
                        statut_exp = "[!] EXPIRE"
                    elif jours_restants <= 3:
                        statut_exp = f"[!] Expire dans {jours_restants} jour(s)"
                    elif jours_restants <= 7:
                        statut_exp = f"[?] Expire dans {jours_restants} jours"
                    else:
                        statut_exp = f"[OK] Expire le {expiration}"
                except:
                    statut_exp = f"[?] {expiration}"
            else:
                statut_exp = "[?] Date non specifiee"

            # Formatage de chaque élément
            """
            inventaire_formate += f"{icone} {nom}\n"
            inventaire_formate += f"   Quantite : {quantite}\n"
            inventaire_formate += f"   {statut_exp}\n\n"
            """
            
            # Détails de l'aliment (Nom, Quantité, Expiration)
            aliment_label = toga.Label(
                f"{nom} - Quantité: {quantite} - Expiration: {expiration}",
                style=Pack(font_size=14, flex=1)
            )
            
            # Bouton de suppression

            bouton_supprimer = toga.Button(
                "Supprimer",
                on_press=lambda widget, aliment=nom: self.supprimer_aliment(aliment),
                style=Pack(width=80,alignment=CENTER, font_size=12, background_color="#D32F2F", color="white")
            )
            
            # Ajouter l'aliment à la zone d'inventaire
            self.zone_inventaire.add(aliment_label)
            self.zone_inventaire.add(bouton_supprimer)

    def supprimer_aliment(self, aliment):
        """Supprimer un aliment de l'inventaire"""
        if aliment in inventaire:
            del inventaire[aliment]
            self.main_window.info_dialog("Succès", f"{aliment} a été supprimé de votre inventaire.")
            self.actualiser_inventaire(None)  # Actualisation après suppression
        else:
            self.main_window.error_dialog("Erreur", f"{aliment} n'existe pas dans l'inventaire.")

    def obtenir_icone_aliment(self, nom):
        """Retourne une icône textuelle selon le nom de l'aliment"""
        nom_lower = nom.lower()
        if any(fruit in nom_lower for fruit in ['pomme', 'poire', 'banane', 'orange']):
            return "[FRUIT]"
        elif any(legume in nom_lower for legume in ['tomate', 'carotte', 'salade', 'epinard']):
            return "[LEGUME]"
        elif any(produit in nom_lower for produit in ['lait', 'yaourt', 'fromage']):
            return "[LAITIER]"
        elif any(viande in nom_lower for viande in ['poulet', 'boeuf', 'porc', 'poisson']):
            return "[VIANDE]"
        else:
            return "[AUTRE]"

    def recuperer_recettes(self, widget):
        """Récupère les recettes avec interface améliorée"""
        if not inventaire:
            self.zone_recettes.value = "[ERREUR] Votre inventaire est vide !\nAjoutez des aliments avant de chercher des recettes."
            return
        
        # Indication de chargement
        self.zone_recettes.value = "[...] Recherche de recettes en cours...\nVeuillez patienter..."
        self.bouton_recettes.text = "RECHERCHE..."
        self.bouton_recettes.enabled = False
        
        try:
            aliments = ",".join(inventaire.keys())
            url = f"https://api.spoonacular.com/recipes/findByIngredients?ingredients={aliments}&number=8&apiKey={API_KEY}"
            
            # Timeout ajouté
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                recettes = response.json()
                
                # Vérification si recettes vides
                if not recettes:
                    self.zone_recettes.value = "[VIDE] Aucune recette trouvee avec vos ingredients.\nEssayez d'ajouter d'autres aliments !"
                else:
                    # Formatage des recettes
                    recettes_formatees = "*** RECETTES SUGGEREES ***\n" + "="*50 + "\n\n"
                    
                    for i, recette in enumerate(recettes, 1):
                        titre = recette['title']
                        ingredients_manques = recette['missedIngredientCount']
                        ingredients_utilises = recette['usedIngredientCount']
                        
                        # Score de compatibilité
                        if ingredients_manques == 0:
                            score = "[***] Parfait match !"
                        elif ingredients_manques <= 2:
                            score = "[**] Tres bon match"
                        else:
                            score = "[*] Match partiel"
                        
                        # Formatage de chaque recette
                        recettes_formatees += f"{i}. {titre}\n"
                        recettes_formatees += f"   {score}\n"
                        recettes_formatees += f"   [OK] Utilise {ingredients_utilises} de vos ingredients\n"
                        if ingredients_manques > 0:
                            recettes_formatees += f"   [!] Manque {ingredients_manques} ingredient(s)\n"
                        recettes_formatees += "\n"
                    
                    self.zone_recettes.value = recettes_formatees
            else:
                self.zone_recettes.value = f"[ERREUR] Erreur lors de la recuperation des recettes.\nCode d'erreur : {response.status_code}"
                
        except requests.RequestException as e:
            self.zone_recettes.value = "[RESEAU] Erreur de connexion.\nVerifiez votre connexion internet et reessayez."
        except Exception as e:
            self.zone_recettes.value = f"[ERREUR] Une erreur inattendue s'est produite.\nDetails : {str(e)}"
        
        finally:
            # Restauration du bouton
            self.bouton_recettes.text = "TROUVER DES RECETTES"
            self.bouton_recettes.enabled = True

# Fonction main
def main():
    return InventaireApp("Gestion d'Inventaire", "org.beeware.inventaire")

# Point d'entrée
if __name__ == '__main__':
    main().main_loop()