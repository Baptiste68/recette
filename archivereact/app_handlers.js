import React from 'react';
import { RecipeDisplayManager } from './recipe_display_manager';

class EventHandlers {
  constructor(appInstance, palette) {
    this.app = appInstance;
    this.palette = palette;
    this.recipeDisplayManager = null;
  }

  // Méthodes inventaire
  async ajouterAliment(widget) {
    const nom = this.nomAliment.value.strip();
    const quantiteStr = this.quantiteAliment.value.strip();
    const expiration = this.expirationAliment.value.strip();

    if (!nom) {
      await this.mainWindow.errorDialog("Erreur", "Veuillez saisir le nom de l'aliment.");
      return;
    }

    let quantite;
    try {
      quantite = quantiteStr ? parseInt(quantiteStr) : 1;
    } catch (error) {
      await this.mainWindow.errorDialog("Erreur", "La quantité doit être un nombre entier.");
      return;
    }

    const expirationFinal = expiration || "Non spécifiée";

    // Vérification de compatibilité avec les régimes
    const [compatible, raison] = this.dietManager.validerAlimentCompatible(nom);
    if (!compatible) {
      const result = await this.mainWindow.questionDialog(
        "Attention",
        `L'aliment '${nom}' n'est pas compatible avec vos préférences:\n${raison}\n\nVoulez-vous l'ajouter quand même ?`
      );
      if (!result) {
        return;
      }
    }

    // Ajout à l'inventaire
    const [succes, message] = this.inventoryManager.ajouterAliment(nom, quantite, expirationFinal);

    if (succes) {
      // Vider les champs
      this.nomAliment.value = "";
      this.quantiteAliment.value = "";
      this.expirationAliment.value = "";

      this.refreshInventoryDisplay(null);
      await this.mainWindow.infoDialog("Succès", message);
    } else {
      await this.mainWindow.errorDialog("Erreur", message);
    }
  }

  afficherInventaire(widget, inventoryManager, mainWindow) {
    const inventaire = inventoryManager.obtenirInventaire();

    if (!inventaire || Object.keys(inventaire).length === 0) {
      return mainWindow.infoDialog("Inventaire", "📦 Votre inventaire est vide.");
    }

    let contenu = "📦 VOTRE INVENTAIRE\n" + "=".repeat(30) + "\n\n";

    const sortedItems = Object.entries(inventaire).sort(([a], [b]) => a.localeCompare(b));
    
    for (const [nom, details] of sortedItems) {
      const icone = inventoryManager.obtenirIconeAliment(nom);
      const statut = inventoryManager.obtenirStatutExpiration(nom);

      contenu += `${icone} ${nom}\n`;
      contenu += `   📊 Quantité: ${details.quantite}\n`;
      contenu += `   ${statut}\n\n`;
    }

    return mainWindow.infoDialog("Inventaire", contenu);
  }

  afficherStatistiques(widget, inventoryManager, mainWindow) {
    const stats = inventoryManager.obtenirStatistiques();

    let contenu = "📊 STATISTIQUES DE L'INVENTAIRE\n" + "=".repeat(35) + "\n\n";
    contenu += `📦 Nombre d'aliments différents: ${stats.totalAliments}\n`;
    contenu += `📊 Quantité totale: ${stats.totalQuantite}\n`;
    contenu += `🔴 Aliments expirés: ${stats.expires}\n`;
    contenu += `🟡 Expirent bientôt: ${stats.bientotExpires}\n`;

    return mainWindow.infoDialog("Statistiques", contenu);
  }

  afficherExpires(widget, inventoryManager, mainWindow) {
    const expires = inventoryManager.obtenirAlimentsExpires();
    const bientotExpires = inventoryManager.obtenirAlimentsBientotExpires();

    let contenu = "⚠️ ALIMENTS À SURVEILLER\n" + "=".repeat(30) + "\n\n";

    if (expires && expires.length > 0) {
      contenu += "🔴 EXPIRÉS:\n";
      for (const aliment of expires) {
        const icone = inventoryManager.obtenirIconeAliment(aliment);
        contenu += `   ${icone} ${aliment}\n`;
      }
      contenu += "\n";
    }

    if (bientotExpires && bientotExpires.length > 0) {
      contenu += "🟡 EXPIRENT BIENTÔT:\n";
      for (const [aliment, jours] of bientotExpires) {
        const icone = inventoryManager.obtenirIconeAliment(aliment);
        contenu += `   ${icone} ${aliment} (dans ${jours} jour(s))\n`;
      }
      contenu += "\n";
    }

    if ((!expires || expires.length === 0) && (!bientotExpires || bientotExpires.length === 0)) {
      contenu += "✅ Tous vos aliments sont encore bons !";
    }

    return mainWindow.infoDialog("Aliments expirés", contenu);
  }

  ajouterAlimentRapide(nomAliment, dietManager, widgetManager, inventoryManager, lastCacheTime, statsCache, window) {
    // 🟢 Version optimisée sans dialogues bloquants
    // Vérification rapide de compatibilité
    const [compatible, raison] = dietManager.validerAlimentCompatible(nomAliment);

    if (!compatible) {
      // Log silencieux au lieu de dialogue bloquant
      console.log(`⚠️ ${nomAliment} incompatible: ${raison}`);
    }

    // Calcul intelligent de la date d'expiration
    const dateExpiration = widgetManager.calculerDateExpirationIntelligente(nomAliment);

    // Ajout rapide
    const [succes, message] = inventoryManager.ajouterAliment(nomAliment, 1, dateExpiration);

    if (succes) {
      // 🟢 OPTIMISATION: Éviter le refresh complet
      const inventaire = inventoryManager.obtenirInventaire();
      if (Object.keys(inventaire).length === 1) {
        widgetManager.refreshInventoryDisplay(null, inventoryManager);
      }
      widgetManager.addOrUpdateInventoryItem(nomAliment, inventoryManager);
      widgetManager.updateInventoryStats(lastCacheTime, statsCache, inventoryManager);

      // Feedback visuel léger
      this.showQuickFeedback(`✅ ${nomAliment} ajouté`, window);
    } else {
      console.log(`❌ ${message}`);
    }
  }

  modifierQuantite(nomAliment, changement, lastCacheTime, statsCache, inventoryManager) {
    // 🟢 Modifie la quantité d'un aliment (+1 ou -1)
    const inventaire = this.inventoryManager.obtenirInventaire();

    if (nomAliment in inventaire) {
      const ancienneQuantite = inventaire[nomAliment].quantite;
      const nouvelleQuantite = ancienneQuantite + changement;

      if (nouvelleQuantite <= 0) {
        // Si quantité devient 0 ou moins, supprimer l'aliment
        this.supprimerAliment(nomAliment);
      } else {
        // Modifier la quantité
        inventaire[nomAliment].quantite = nouvelleQuantite;
        this.inventoryManager.sauvegarderInventaire();

        // 🟢 Mise à jour ciblée
        this.updateSingleInventoryItem(nomAliment);
        this.updateInventoryStats(lastCacheTime, statsCache, inventoryManager);
      }
    }
  }

  // Méthodes régimes
  toggleRegime(regime, isChecked, dietManager, regimeCheckboxes, window) {
    if (isChecked) {
      if (!dietManager.ajouterRegime(regime)) {
        // Régime incompatible, désactiver la checkbox
        regimeCheckboxes[regime].value = false;
        window.errorDialog(
          "Incompatibilité",
          `Le régime ${regime.nomAffichage} est incompatible avec vos régimes actuels.`
        );
      }
    } else {
      dietManager.retirerRegime(regime);
    }
  }

  toggleAllergie(allergie, isChecked, dietManager, regimeCheckboxes) {
    if (isChecked) {
      dietManager.ajouterAllergie(allergie);
      // Auto-activation des régimes correspondants
      for (const [regime, checkbox] of Object.entries(regimeCheckboxes)) {
        if (dietManager.regimesActifs.includes(regime)) {
          checkbox.value = true;
        }
      }
    } else {
      dietManager.retirerAllergie(allergie);
    }
  }

  // Méthodes recettes
  rechercheRecettesOptimisee(widget, inventoryManager, dietManager, recipeManager, window) {
    const inventaire = inventoryManager.obtenirInventaire();

    if (!inventaire || Object.keys(inventaire).length === 0) {
      return window.infoDialog(
        "Inventaire vide",
        "Ajoutez d'abord des aliments à votre inventaire pour obtenir des suggestions de recettes !"
      );
    }

    // Mise à jour des régimes du recipe manager
    for (const regime of dietManager.regimesActifs) {
      // Conversion vers l'enum du recipe_manager si nécessaire
      recipeManager.ajouterRegime(regime);
    }

    const ingredients = Object.keys(inventaire);

    try {
      const [succes, message, recettes] = recipeManager.rechercherRecettesParIngredients(ingredients, 10);
      
      if (succes && recettes) {
        if (!this.recipeDisplayManager) {
          // this.recipeDisplayManager = new RecipeDisplayManager(this.palette);
        }

        // this.recipeDisplayManager.showRecipesPaginated(
        //   recettes, inventaire, window, recipeManager
        // );
        
        // Version simplifiée pour l'exemple
        this.afficherRecettesSimple(recettes, window);
      } else {
        return window.infoDialog("Aucune recette", message);
      }
    } catch (error) {
      return window.errorDialog("Erreur", `Erreur lors de la recherche: ${error.message}`);
    }
  }

  rechercheRecettesParNom(widget, nomRecette, dietManager, recipeManager, window) {
    const nom = nomRecette.value.trim();

    if (!nom) {
      return window.errorDialog("Erreur", "Veuillez saisir le nom d'une recette.");
    }

    // Mise à jour des régimes
    for (const regime of dietManager.regimesActifs) {
      recipeManager.ajouterRegime(regime);
    }

    try {
      const [succes, message, recettes] = recipeManager.rechercherRecettesParNom(nom, 8);

      if (succes && recettes) {
        let contenu = `🔍 RECETTES POUR '${nom.toUpperCase()}'\n` + "=".repeat(40) + "\n\n";

        for (let i = 0; i < recettes.length; i++) {
          const recette = recettes[i];
          const titre = recette.title || 'Titre non disponible';
          const temps = recette.readyInMinutes || 'Non spécifié';

          contenu += `${i + 1}. 🍽️ ${titre}\n`;
          contenu += `   ⏱️ Temps: ${temps} minutes\n\n`;
        }

        return window.infoDialog("Recettes trouvées", contenu);
      } else {
        return window.infoDialog("Aucune recette", message);
      }
    } catch (error) {
      return window.errorDialog("Erreur", `Erreur lors de la recherche: ${error.message}`);
    }
  }

  // Méthode helper pour afficher les recettes de manière simple
  afficherRecettesSimple(recettes, window) {
    let contenu = "🍽️ RECETTES SUGGÉRÉES\n" + "=".repeat(30) + "\n\n";

    for (let i = 0; i < Math.min(recettes.length, 5); i++) {
      const recette = recettes[i];
      const titre = recette.title || 'Titre non disponible';
      const temps = recette.readyInMinutes || 'Non spécifié';

      contenu += `${i + 1}. ${titre}\n`;
      contenu += `   ⏱️ ${temps} minutes\n\n`;
    }

    return window.infoDialog("Recettes suggérées", contenu);
  }

  // Autre
  showQuickFeedback(message, window) {
    // 🟢 Affiche un feedback rapide sans bloquer l'interface
    // Temporairement changer le titre de la fenêtre
    const originalTitle = window.title;
    window.title = message;

    // Remettre le titre original après 2 secondes
    const restoreTitle = () => {
      window.title = originalTitle;
    };

    // Timer non-bloquant
    this.delayedRestoreTitle(restoreTitle, 2000);
  }

  delayedRestoreTitle(callback, delay) {
    // 🟢 Restore le titre après un délai
    setTimeout(callback, delay);
  }

  onAjouterAliment(widget, inventoryManager, widgetManager, nomAliment, quantiteAliment, expirationAliment, window, lastCacheTime, statsCache) {
    const resultat = inventoryManager.ajouterAliment(
      nomAliment.value.trim(),
      quantiteAliment.value.trim(),
      expirationAliment.value.trim()
    );

    // Décomposer le tuple directement
    const [success, message] = resultat;

    if (success) {
      const inventaire = inventoryManager.obtenirInventaire();
      if (Object.keys(inventaire).length === 1) {
        widgetManager.refreshInventoryDisplay(null, inventoryManager);
      } else {
        widgetManager.addOrUpdateInventoryItem(nomAliment, inventoryManager);
      }
      widgetManager.updateInventoryStats(lastCacheTime, statsCache, inventoryManager);
      window.infoDialog("Aliment ajouté", message);
      
      // Optionnel: vider les champs
      nomAliment.value = "";
      quantiteAliment.value = "";
      expirationAliment.value = "";
    } else {
      window.errorDialog("Erreur lors de l'ajout:", message);
    }
  }
}

// Composant React qui utilise EventHandlers
const EventHandlersComponent = ({ 
  appInstance, 
  palette, 
  inventoryManager, 
  dietManager, 
  recipeManager, 
  widgetManager,
  window: windowProp 
}) => {
  const [eventHandlers] = React.useState(() => new EventHandlers(appInstance, palette));

  // Exemple d'utilisation avec des boutons
  return (
    <div style={{ padding: '20px' }}>
      <h2>Gestionnaire d'événements</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Actions Inventaire</h3>
        <button
          onClick={() => eventHandlers.afficherInventaire(null, inventoryManager, windowProp)}
          style={{
            margin: '5px',
            padding: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          📋 Voir Inventaire
        </button>
        
        <button
          onClick={() => eventHandlers.afficherStatistiques(null, inventoryManager, windowProp)}
          style={{
            margin: '5px',
            padding: '10px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          📊 Statistiques
        </button>

        <button
          onClick={() => eventHandlers.afficherExpires(null, inventoryManager, windowProp)}
          style={{
            margin: '5px',
            padding: '10px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ⚠️ Aliments Expirés
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Actions Recettes</h3>
        <button
          onClick={() => eventHandlers.rechercheRecettesOptimisee(null, inventoryManager, dietManager, recipeManager, windowProp)}
          style={{
            margin: '5px',
            padding: '10px',
            backgroundColor: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🚀 Recherche Optimisée
        </button>
      </div>

      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '4px' 
      }}>
        <p><strong>Gestionnaire d'événements initialisé</strong></p>
        <p>Palette: {palette ? '✅ Configurée' : '❌ Non configurée'}</p>
        <p>App: {appInstance ? '✅ Connectée' : '❌ Non connectée'}</p>
      </div>
    </div>
  );
};

export default EventHandlersComponent;
