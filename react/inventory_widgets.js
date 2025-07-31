/**
 * Module de gestion des widgets d'inventaire
 */

import React, { useState, useRef } from 'react';

export class InventoryWidgetManager {
  constructor(appInstance) {
    this.app = appInstance;
    this.inventoryWidgets = {};
  }

  createInventoryPanel(inventoryManager) {
    /** Code du panneau inventaire */
    // Container principal de l'inventaire
    const inventoryContainer = {
      style: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        padding: '10px',
        backgroundColor: '#f8f9fa'
      }
    };

    // Titre du panneau inventaire
    const inventoryTitle = {
      text: "📦 INVENTAIRE ACTUEL",
      style: {
        textAlign: 'center',
        fontSize: '16px',
        fontWeight: 'bold',
        padding: '10px',
        backgroundColor: '#e9ecef',
        color: '#495057'
      }
    };

    // Statistiques rapides
    this.statsLabel = {
      text: "📊 0 aliments | 🔴 0 expirés",
      style: {
        textAlign: 'center',
        padding: '5px',
        fontSize: '12px'
      }
    };

    // Container scrollable pour la liste des aliments
    this.inventoryScroll = {
      style: {
        flex: 1,
        padding: '5px',
        overflow: 'auto'
      }
    };

    // Box qui contiendra dynamiquement les aliments
    this.inventoryListBox = {
      style: {
        display: 'flex',
        flexDirection: 'column',
        padding: '5px'
      }
    };
    this.inventoryScroll.content = this.inventoryListBox;

    // Bouton pour rafraîchir l'inventaire
    const refreshBtn = {
      text: "🔄 Actualiser",
      onPress: (widget) => this.refreshInventoryDisplay(null, inventoryManager),
      style: {
        padding: '5px',
        backgroundColor: '#6c757d',
        color: 'white'
      }
    };

    // Assemblage du panneau
    return {
      inventoryContainer,
      inventoryTitle,
      statsLabel: this.statsLabel,
      inventoryScroll: this.inventoryScroll,
      refreshBtn
    };
  }

  createInventoryItemWidget(nom, details, inventoryManager) {
    /** Création des widgets d'items */
    // Container pour un aliment
    const itemBox = {
      style: {
        display: 'flex',
        flexDirection: 'row',
        padding: '8px',
        backgroundColor: 'white'
      }
    };

    // Informations de l'aliment
    const infoBox = {
      style: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        padding: '5px'
      }
    };

    // Nom avec icône
    const icone = inventoryManager.obtenirIconeAliment(nom);
    const nomLabel = {
      text: `${icone} ${nom}`,
      style: {
        fontWeight: 'bold',
        fontSize: '14px'
      }
    };

    // Container pour quantité avec boutons +/-
    const quantiteBox = {
      style: {
        display: 'flex',
        flexDirection: 'row',
        padding: '2px'
      }
    };

    // Bouton moins
    const btnMoins = {
      text: "➖",
      onPress: (widget) => {
        inventoryManager.modifierQuantite(nom, -1);
        // 🟢 Mise à jour ciblée
        this.updateInventoryStats();
        this.updateSingleInventoryItem(nom, inventoryManager);
      },
      style: {
        width: '35px',
        height: '30px',
        backgroundColor: '#ff6b6b',
        color: 'white',
        fontSize: '12px'
      }
    };

    // Quantité
    const quantiteLabel = {
      text: `📊 Quantité: ${details.quantite}`,
      style: {
        fontSize: '12px',
        color: '#6c757d'
      }
    };

    // Bouton plus
    const btnPlus = {
      text: "➕",
      onPress: (widget) => {
        inventoryManager.modifierQuantite(nom, 1);
        // 🟢 Mise à jour ciblée
        this.updateInventoryStats();
        this.updateSingleInventoryItem(nom, inventoryManager);
      },
      style: {
        width: '35px',
        height: '30px',
        backgroundColor: '#51cf66',
        color: 'white',
        fontSize: '12px'
      }
    };

    quantiteBox.children = [btnMoins, quantiteLabel, btnPlus];

    // Statut d'expiration
    const statut = inventoryManager.obtenirStatutExpiration(nom);
    // Déterminer la couleur selon le statut
    let statutColor;
    if (statut.toLowerCase().includes("expiré")) {
      statutColor = "#dc3545"; // Rouge
    } else if (statut.toLowerCase().includes("expire")) {
      statutColor = "#ffc107"; // Jaune
    } else {
      statutColor = "#28a745"; // Vert
    }

    const statutLabel = {
      text: statut,
      style: {
        fontSize: '11px',
        color: statutColor
      }
    };

    infoBox.children = [nomLabel, quantiteBox, statutLabel];

    // Bouton de suppression
    const deleteBtn = {
      text: "🗑️",
      onPress: (widget) => {
        inventoryManager.supprimerAliment(nom);
        this.refreshInventoryDisplay(null, inventoryManager);
      },
      style: {
        width: '40px',
        height: '40px',
        backgroundColor: '#dc3545',
        color: 'white',
        fontSize: '16px'
      }
    };

    itemBox.children = [infoBox, deleteBtn];

    return itemBox;
  }

  createPredefinedFoodGrid(eventHandlers, dietManager, widgetManager, inventoryManager, lastCacheTime, statsCache, window) {
    /**Création de la grille d'aliments prédéfinis */
    // Dictionnaire des aliments prédéfinis avec leurs icônes
    this.alimentsPredefinis = {
      // Fruits
      "🍎": "Pomme",
      "🍌": "Banane",
      "🍊": "Orange",
      "🍇": "Raisin",
      "🍓": "Fraise",
      "🥝": "Kiwi",
      "🍑": "Cerise",
      "🍒": "Griotte",

      // Légumes
      "🥕": "Carotte",
      "🥒": "Concombre",
      "🍅": "Tomate",
      "🥬": "Salade",
      "🥔": "Pomme de terre",
      "🧅": "Oignon",
      "🫒": "Olive",
      "🌶️": "Piment",

      // Protéines
      "🥩": "Bœuf",
      "🍗": "Poulet",
      "🐟": "Poisson",
      "🥚": "Œuf",
      "🧀": "Fromage",
      "🥛": "Lait",

      // Féculents
      "🍞": "Pain",
      "🍝": "Pâtes",
      "🍚": "Riz",
      "🥖": "Baguette",

      // Autres
      "🫖": "Thé",
      "☕": "Café",
      "🍯": "Miel",
      "🧈": "Beurre"
    };

    // Container principal de la grille
    const gridContainer = {
      style: {
        display: 'flex',
        flexDirection: 'column',
        padding: '10px',
        backgroundColor: '#f0f8ff'
      }
    };

    // Titre de la section
    const gridTitle = {
      text: "🛒 AJOUT RAPIDE D'ALIMENTS",
      style: {
        textAlign: 'center',
        fontSize: '16px',
        fontWeight: 'bold',
        padding: '8px',
        backgroundColor: '#e6f3ff',
        color: '#2c5282'
      }
    };

    // Instructions
    const instructions = {
      text: "Cliquez sur un aliment pour l'ajouter à votre inventaire (quantité +1 à chaque clic)",
      style: {
        textAlign: 'center',
        fontSize: '11px',
        padding: '5px',
        color: '#666'
      }
    };

    // Création de la grille (4 colonnes)
    const gridRows = [];
    const alimentsItems = Object.entries(this.alimentsPredefinis);

    // Organiser les aliments par rangées de 4
    for (let i = 0; i < alimentsItems.length; i += 4) {
      const row = {
        style: {
          display: 'flex',
          flexDirection: 'row',
          padding: '2px'
        },
        children: []
      };

      // Ajouter jusqu'à 4 aliments par rangée
      for (let j = 0; j < 4; j++) {
        if (i + j < alimentsItems.length) {
          const [icone, nom] = alimentsItems[i + j];
          // Bouton pour chaque aliment
          const btnAliment = {
            text: `${icone}\n${nom}`,
            onPress: (widget) => eventHandlers.ajouterAlimentRapide(nom, dietManager, widgetManager, inventoryManager, lastCacheTime, statsCache, window),
            style: {
              flex: 1,
              padding: '3px',
              height: '60px',
              backgroundColor: '#ffffff',
              color: '#333',
              fontSize: '10px'
            }
          };
          row.children.push(btnAliment);
        } else {
          // Espace vide pour maintenir l'alignement
          const spacer = {
            style: { flex: 1 }
          };
          row.children.push(spacer);
        }
      }

      gridRows.push(row);
    }

    // Assemblage du container
    gridContainer.children = [gridTitle, instructions, ...gridRows];

    return gridContainer;
  }

  updateSingleInventoryItem(nomAliment, inventoryManager) {
    /**🟢 Met à jour UN SEUL élément sans recréer toute la liste */
    const inventaire = inventoryManager.obtenirInventaire();

    if (!(nomAliment in inventaire)) {
      // L'aliment a été supprimé, faire un refresh complet
      this.refreshInventoryDisplay(null, inventoryManager);
      return;
    }

    // Trouver et mettre à jour seulement cet élément
    for (let i = 0; i < this.inventoryListBox.children.length; i++) {
      const child = this.inventoryListBox.children[i];
      if (child.children && child.children.length > 0) {
        // Chercher le label avec le nom de l'aliment
        const infoBox = child.children[0].children ? child.children[0] : null;
        if (infoBox && infoBox.children) {
          for (const labelWidget of infoBox.children) {
            if (labelWidget.text && labelWidget.text.includes(nomAliment)) {
              // Trouvé! Mettre à jour juste ce widget
              const details = inventaire[nomAliment];
              // Remplacer par le nouveau widget
              const newWidget = this.createInventoryItemWidget(nomAliment, details, inventoryManager);
              this.inventoryListBox.children.splice(i, 1, newWidget);
              return;
            }
          }
        }
      }
    }

    // Si pas trouvé, c'est un nouvel élément
    const details = inventaire[nomAliment];
    const newWidget = this.createInventoryItemWidget(nomAliment, details, inventoryManager);
    this.inventoryListBox.children.push(newWidget);
    // Séparateur
    const separator = {
      style: {
        height: '1px',
        backgroundColor: '#dee2e6',
        paddingTop: '2px',
        paddingBottom: '2px'
      }
    };
    this.inventoryListBox.children.push(separator);
  }

  refreshInventoryDisplay(widget, inventoryManager) {
    /**Met à jour l'affichage de l'inventaire */
    console.log("lwqwe");
    // Vider la liste actuelle
    this.inventoryListBox.children = [];

    // Obtenir l'inventaire actuel
    const inventaire = inventoryManager.obtenirInventaire();

    if (Object.keys(inventaire).length === 0) {
      // Affichage si inventaire vide
      const emptyLabel = {
        text: "📦 Inventaire vide\n\nAjoutez des aliments via l'onglet Inventaire !",
        style: {
          textAlign: 'center',
          padding: '20px',
          color: '#6c757d',
          fontStyle: 'italic'
        }
      };
      this.inventoryListBox.children.push(emptyLabel);
      this.statsLabel.text = "📊 0 aliments | 🔴 0 expirés";
    } else {
      // Ajouter chaque aliment
      const sortedEntries = Object.entries(inventaire).sort(([a], [b]) => a.localeCompare(b));
      for (const [nom, details] of sortedEntries) {
        const itemWidget = this.createInventoryItemWidget(nom, details, inventoryManager);
        this.inventoryListBox.children.push(itemWidget);

        // Séparateur
        const separator = {
          style: {
            height: '1px',
            backgroundColor: '#dee2e6',
            paddingTop: '2px',
            paddingBottom: '2px'
          }
        };
        this.inventoryListBox.children.push(separator);
      }

      // Mettre à jour les statistiques
      const stats = inventoryManager.obtenirStatistiques();
      this.statsLabel.text = `📊 ${stats.totalAliments} aliments | 🔴 ${stats.expires} expirés`;
    }
  }

  updateInventoryStats(lastCacheTime, statsCache, inventoryManager) {
    /**Version cachée des statistiques */
    const currentTime = new Date();

    // Cache valide pendant 5 secondes
    let stats;
    if (lastCacheTime &&
        (currentTime - lastCacheTime) / 1000 < 5 &&
        statsCache) {
      stats = statsCache;
    } else {
      stats = inventoryManager.obtenirStatistiques();
      statsCache = stats;
      lastCacheTime = currentTime;
    }

    this.statsLabel.text = `📊 ${stats.totalAliments} aliments | 🔴 ${stats.expires} expirés`;
  }

  calculerDateExpirationIntelligente(nomAliment) {
    /**🟢 Calcule une date d'expiration intelligente selon le type d'aliment */

    // Catégories d'aliments avec durées de conservation
    const dureesConservation = {
      // Très périssables (3-5 jours)
      'tresFrais': ['Salade', 'Fraise', 'Cerise', 'Griotte', 'Lait', 'Poisson'],

      // Frais (7 jours)
      'frais': ['Pomme', 'Banane', 'Orange', 'Carotte', 'Concombre', 'Tomate', 'Pain', 'Baguette'],

      // Moyennement périssables (14 jours)
      'moyen': ['Fromage', 'Œuf', 'Pomme de terre', 'Oignon'],

      // Longue conservation (30+ jours)
      'longue': ['Riz', 'Pâtes', 'Miel', 'Thé', 'Café', 'Beurre']
    };

    let jours = 30; // Par défaut

    for (const [categorie, aliments] of Object.entries(dureesConservation)) {
      if (aliments.includes(nomAliment)) {
        if (categorie === 'tresFrais') {
          jours = 4;
        } else if (categorie === 'frais') {
          jours = 7;
        } else if (categorie === 'moyen') {
          jours = 14;
        } else if (categorie === 'longue') {
          jours = 60;
        }
        break;
      }
    }

    const dateExpiration = new Date();
    dateExpiration.setDate(dateExpiration.getDate() + jours);
    return dateExpiration.toISOString().split('T')[0]; // Format YYYY-MM-DD
  }

  addOrUpdateInventoryItem(nomAliment, inventoryManager) {
    /**🟢 Ajoute ou met à jour sans refresh complet */
    // Vérifier si l'aliment existe déjà
    const inventaire = inventoryManager.obtenirInventaire();

    if (nomAliment in inventaire) {
      // Mise à jour d'un existant
      this.updateSingleInventoryItem(nomAliment, inventoryManager);
    } else {
      // Nouvel aliment - l'ajouter à la fin
      const details = inventaire[nomAliment] || { quantite: 1 };
      const newWidget = this.createInventoryItemWidget(nomAliment, details, inventoryManager);
      this.inventoryListBox.children.push(newWidget);

      // Séparateur
      const separator = {
        style: {
          height: '1px',
          backgroundColor: '#dee2e6',
          paddingTop: '2px',
          paddingBottom: '2px'
        }
      };
      this.inventoryListBox.children.push(separator);
    }
  }
}