/**
 * Module de gestion de l'inventaire alimentaire
 */

export class InventoryManager {
  constructor() {
    this.inventaire = {};
  }

  /**
   * Ajoute un aliment à l'inventaire
   * Returns: [succès, message]
   */
  ajouterAliment(nom, quantite = 1, expiration = "Non specifiee") {
    console.log(nom);
    nom = nom.trim().replace(/\b\w/g, l => l.toUpperCase()); // Title case equivalent
    
    if (!nom) {
      return [false, "Veuillez saisir le nom de l'aliment."];
    }
    
    // Validation de la quantité
    try {
      quantite = quantite ? parseInt(quantite) : 1;
    } catch (error) {
      return [false, "La quantité doit être un nombre entier."];
    }
    if (quantite <= 0) {
      return [false, "La quantité doit être positive."];
    }
    
    if (!expiration) {
      expiration = "Non specifiee";
    }
    // Validation de la date si fournie
    if (expiration !== "Non specifiee") {
      try {
        const dateTest = new Date(expiration);
        if (isNaN(dateTest.getTime()) || !expiration.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return [false, "Format de date incorrect. Utilisez YYYY-MM-DD"];
        }
      } catch (error) {
        return [false, "Format de date incorrect. Utilisez YYYY-MM-DD"];
      }
    }
    
    // Ajout ou mise à jour
    let message;
    if (nom in this.inventaire) {
      this.inventaire[nom].quantite += quantite;
      message = `${nom} mis à jour ! Quantité totale : ${this.inventaire[nom].quantite}`;
    } else {
      this.inventaire[nom] = {
        quantite: quantite,
        expiration: expiration
      };
      message = `${nom} ajouté avec succès ! Quantité : ${quantite}`;
    }
    
    return [true, message];
  }

  /**
   * Supprime un aliment de l'inventaire
   * Returns: [succès, message]
   */
  supprimerAliment(nom) {
    if (nom in this.inventaire) {
      delete this.inventaire[nom];
      return [true, `${nom} a été supprimé de votre inventaire.`];
    } else {
      return [false, `${nom} n'existe pas dans l'inventaire.`];
    }
  }

  /**
   * Modifie la quantité d'un aliment
   * Returns: [succès, message]
   */
  modifierQuantite(nom, changement) {
    const inventaire = this.obtenirInventaire();
    
    if (nom in inventaire) {
      const ancienneQuantite = inventaire[nom].quantite;
      const nouvelleQuantite = ancienneQuantite + changement;
      
      if (nouvelleQuantite <= 0) {
        // Si quantité devient 0 ou moins, supprimer l'aliment
        this.supprimerAliment(nom);
      } else {
        // Modifier la quantité
        inventaire[nom].quantite = nouvelleQuantite;
        this.sauvegarderInventaire();
        
        // 🟢 Mise à jour ciblée
        //inventory_widgets.update_single_inventory_item(nom)
        //inventory_widgets.update_inventory_stats()
      }
    }
  }

  /**
   * Retourne l'inventaire complet
   */
  obtenirInventaire() {
    return { ...this.inventaire }; // Shallow copy equivalent
  }

  /**
   * Retourne la liste des aliments expirés
   */
  obtenirAlimentsExpires() {
    const expires = [];
    for (const [nom, details] of Object.entries(this.inventaire)) {
      if (details.expiration !== "Non specifiee") {
        try {
          const dateExp = new Date(details.expiration);
          if (dateExp < new Date()) {
            expires.push(nom);
          }
        } catch (error) {
          continue;
        }
      }
    }
    return expires;
  }

  /**
   * Retourne les aliments qui expirent dans les prochains jours
   * Returns: Liste de [nom_aliment, jours_restants]
   */
  obtenirAlimentsBientotExpires(jours = 7) {
    const bientotExpires = [];
    for (const [nom, details] of Object.entries(this.inventaire)) {
      if (details.expiration !== "Non specifiee") {
        try {
          const dateExp = new Date(details.expiration);
          const joursRestants = Math.floor((dateExp - new Date()) / (1000 * 60 * 60 * 24));
          if (joursRestants >= 0 && joursRestants <= jours) {
            bientotExpires.push([nom, joursRestants]);
          }
        } catch (error) {
          continue;
        }
      }
    }
    return bientotExpires.sort((a, b) => a[1] - b[1]);
  }

  /**
   * Retourne le statut d'expiration d'un aliment
   */
  obtenirStatutExpiration(nom) {
    if (!(nom in this.inventaire)) {
      return "Aliment non trouvé";
    }
    
    const expiration = this.inventaire[nom].expiration;
    if (expiration === "Non specifiee") {
      return "🔸 Date non spécifiée";
    }
    
    try {
      const dateExp = new Date(expiration);
      const joursRestants = Math.floor((dateExp - new Date()) / (1000 * 60 * 60 * 24));
      
      if (joursRestants < 0) {
        return "🔴 EXPIRÉ";
      } else if (joursRestants === 0) {
        return "🟠 Expire aujourd'hui";
      } else if (joursRestants <= 3) {
        return `🟡 Expire dans ${joursRestants} jour(s)`;
      } else if (joursRestants <= 7) {
        return `🟢 Expire dans ${joursRestants} jours`;
      } else {
        return `✅ Expire le ${expiration}`;
      }
    } catch (error) {
      return `⚠️ Date invalide: ${expiration}`;
    }
  }

  /**
   * Retourne une icône selon le type d'aliment
   */
  obtenirIconeAliment(nom) {
    const nomLower = nom.toLowerCase();
    
    // Fruits
    if (['pomme', 'poire', 'banane', 'orange', 'fraise', 'raisin', 'kiwi', 'ananas'].some(fruit => nomLower.includes(fruit))) {
      return "🍎";
    }
    // Légumes
    else if (['tomate', 'carotte', 'salade', 'épinard', 'courgette', 'brocoli', 'poivron'].some(legume => nomLower.includes(legume))) {
      return "🥕";
    }
    // Produits laitiers
    else if (['lait', 'yaourt', 'fromage', 'crème', 'beurre'].some(produit => nomLower.includes(produit))) {
      return "🥛";
    }
    // Viandes et poissons
    else if (['poulet', 'bœuf', 'porc', 'poisson', 'saumon', 'thon'].some(viande => nomLower.includes(viande))) {
      return "🍖";
    }
    // Céréales et féculents
    else if (['riz', 'pâtes', 'pain', 'farine', 'blé', 'pomme de terre'].some(cereale => nomLower.includes(cereale))) {
      return "🌾";
    }
    // Épices et herbes
    else if (['sel', 'poivre', 'basilic', 'thym', 'persil'].some(epice => nomLower.includes(epice))) {
      return "🌿";
    }
    else {
      return "🥘";
    }
  }

  /**
   * Vide complètement l'inventaire
   */
  viderInventaire() {
    this.inventaire = {};
  }

  /**
   * Retourne des statistiques sur l'inventaire
   */
  obtenirStatistiques() {
    const totalAliments = Object.keys(this.inventaire).length;
    const totalQuantite = Object.values(this.inventaire).reduce((sum, details) => sum + details.quantite, 0);
    const expires = this.obtenirAlimentsExpires().length;
    const bientotExpires = this.obtenirAlimentsBientotExpires().length;
    
    return {
      totalAliments: totalAliments,
      totalQuantite: totalQuantite,
      expires: expires,
      bientotExpires: bientotExpires
    };
  }

  /**
   * Sauvegarde l'inventaire dans le localStorage
   * Returns: [succès, message]
   */
  sauvegarderInventaire(fichier = "inventaire") {
    try {
      // Préparer les données avec timestamp
      const donneesSauvegarde = {
        inventaire: this.inventaire,
        dateSauvegarde: new Date().toISOString(),
        version: '1.0'
      };
      
      // Sauvegarde dans le localStorage (équivalent pour le navigateur)
      localStorage.setItem(fichier, JSON.stringify(donneesSauvegarde));
      
      return [true, `Inventaire sauvegardé avec succès`];
    } catch (error) {
      return [false, `Erreur lors de la sauvegarde : ${error.message}`];
    }
  }

  /**
   * Charge l'inventaire depuis le localStorage
   * Returns: [succès, message]
   */
  chargerInventaire(fichier = "inventaire") {
    try {
      // Lecture depuis le localStorage
      const donneesString = localStorage.getItem(fichier);
      
      // Vérifier que les données existent
      if (!donneesString) {
        return [false, `Le fichier ${fichier} n'existe pas`];
      }
      
      // Parser les données JSON
      const donnees = JSON.parse(donneesString);
      
      // Validation des données
      if (!donnees.inventaire) {
        return [false, "Format de fichier invalide : clé 'inventaire' manquante"];
      }
      
      // Charger l'inventaire
      this.inventaire = donnees.inventaire;
      
      // Information sur la date de sauvegarde si disponible
      let message = `Inventaire chargé avec succès`;
      if (donnees.dateSauvegarde) {
        const dateSauvegarde = new Date(donnees.dateSauvegarde).toLocaleString();
        message += `\nDate de sauvegarde : ${dateSauvegarde}`;
      }
      
      return [true, message];
    } catch (error) {
      if (error instanceof SyntaxError) {
        return [false, `Erreur : Le fichier ${fichier} n'est pas un JSON valide`];
      }
      return [false, `Erreur lors du chargement : ${error.message}`];
    }
  }

  /**
   * Sauvegarde automatique silencieuse
   * Returns: True si la sauvegarde a réussi
   */
  sauvegarderAutomatique() {
    try {
      const [succes] = this.sauvegarderInventaire("inventaire_auto");
      return succes;
    } catch (error) {
      return false;
    }
  }

  /**
   * Retourne la liste des fichiers de sauvegarde disponibles
   * Returns: Liste des noms de fichiers de sauvegarde
   */
  obtenirFichiersSauvegarde() {
    try {
      const fichiers = [];
      
      // Parcourir le localStorage pour trouver les sauvegardes
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('inventaire')) {
          fichiers.push(key);
        }
      }
      
      return fichiers.sort().reverse(); // Plus récents en premier
    } catch (error) {
      return [];
    }
  }

  /**
   * Affiche les aliments à utiliser en priorité
   */
  afficherAlimentsPrioritaires(widget, window) {
    const expires = this.obtenirAlimentsExpires();
    const bientotExpires = this.obtenirAlimentsBientotExpires(3);
    
    let contenu = "⏰ ALIMENTS À UTILISER EN PRIORITÉ\n" + "=".repeat(40) + "\n\n";
    
    if (expires.length > 0) {
      contenu += "🔴 URGENCE MAXIMALE (expirés):\n";
      for (const aliment of expires) {
        const icone = this.obtenirIconeAliment(aliment);
        contenu += `   ${icone} ${aliment}\n`;
      }
      contenu += "\n";
    }
    
    if (bientotExpires.length > 0) {
      contenu += "🟡 À UTILISER RAPIDEMENT:\n";
      for (const [aliment, jours] of bientotExpires) {
        const icone = this.obtenirIconeAliment(aliment);
        contenu += `   ${icone} ${aliment} (dans ${jours} jour(s))\n`;
      }
      contenu += "\n";
    }
    
    if (expires.length === 0 && bientotExpires.length === 0) {
      contenu += "✅ Aucun aliment urgent à utiliser !";
    } else {
      contenu += "💡 Conseil: Utilisez la recherche optimisée de recettes\n";
      contenu += "pour des suggestions qui priorisent ces aliments !";
    }
    
    return window.infoDialog("Aliments prioritaires", contenu);
  }

  /**
   * Suggestions d'achats basées sur les régimes
   */
  suggestionsAchats(widget, dietManager, window) {
    if (dietManager.regimesActifs.size === 0) {
      return window.infoDialog(
        "Aucun régime",
        "Configurez d'abord vos préférences alimentaires pour obtenir des suggestions personnalisées !"
      );
    }
    
    let contenu = "💡 SUGGESTIONS D'ACHATS\n" + "=".repeat(30) + "\n\n";
    
    for (const regime of dietManager.regimesActifs) {
      const suggestions = dietManager.obtenirSuggestionsAliments(regime);
      contenu += `${regime.emoji} ${regime.nomAffichage}:\n`;
      for (const suggestion of suggestions.slice(0, 5)) { // Limite à 5 suggestions par régime
        contenu += `   • ${suggestion}\n`;
      }
      contenu += "\n";
    }
    
    return window.infoDialog("Suggestions d'achats", contenu);
  }

  /**
   * Handler pour le bouton plus
   */
  onPressPlus(aliment) {
    this.modifierQuantite(aliment, 1);
  }
}