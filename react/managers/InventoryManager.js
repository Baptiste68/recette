// managers/InventoryManager.js
class InventoryManager {
  constructor() {
    this.inventaire = {};
  }

  ajouterAliment(nom, quantite = 1, expiration = "Non specifiee") {
    nom = nom.trim();
    if (!nom) return { success: false, message: "Veuillez saisir le nom de l'aliment." };
    
    if (quantite <= 0) return { success: false, message: "La quantité doit être positive." };

    if (this.inventaire[nom]) {
      this.inventaire[nom].quantite += quantite;
      return { success: true, message: `${nom} mis à jour ! Quantité totale : ${this.inventaire[nom].quantite}` };
    } else {
      this.inventaire[nom] = { quantite, expiration };
      return { success: true, message: `${nom} ajouté avec succès ! Quantité : ${quantite}` };
    }
  }

  supprimerAliment(nom) {
    if (this.inventaire[nom]) {
      delete this.inventaire[nom];
      return { success: true, message: `${nom} supprimé de l'inventaire.` };
    }
    return { success: false, message: `${nom} n'existe pas dans l'inventaire.` };
  }

  modifierQuantite(nom, nouvelleQuantite) {
    if (!this.inventaire[nom]) {
      return { success: false, message: `${nom} n'existe pas dans l'inventaire.` };
    }

    if (nouvelleQuantite <= 0) {
      return this.supprimerAliment(nom);
    }

    this.inventaire[nom].quantite = nouvelleQuantite;
    return { success: true, message: `Quantité de ${nom} mise à jour : ${nouvelleQuantite}` };
  }

  obtenirInventaire() {
    return { ...this.inventaire };
  }

  obtenirStatistiques() {
    const aliments = Object.keys(this.inventaire);
    const totalQuantite = Object.values(this.inventaire).reduce((sum, item) => sum + item.quantite, 0);
    const expires = this.obtenirAlimentsExpires().length;
    
    return {
      totalAliments: aliments.length,
      totalQuantite,
      expires,
      bientotExpires: this.obtenirAlimentsBientotExpires().length
    };
  }

  obtenirAlimentsExpires() {
    const expires = [];
    const maintenant = new Date();
    
    Object.entries(this.inventaire).forEach(([nom, details]) => {
      if (details.expiration !== "Non specifiee") {
        try {
          const dateExp = new Date(details.expiration);
          if (dateExp < maintenant) {
            expires.push(nom);
          }
        } catch (e) {
          // Ignorer les dates invalides
        }
      }
    });
    
    return expires;
  }

  obtenirAlimentsBientotExpires(jours = 7) {
    const bientotExpires = [];
    const maintenant = new Date();
    
    Object.entries(this.inventaire).forEach(([nom, details]) => {
      if (details.expiration !== "Non specifiee") {
        try {
          const dateExp = new Date(details.expiration);
          const joursRestants = Math.ceil((dateExp - maintenant) / (1000 * 60 * 60 * 24));
          if (joursRestants >= 0 && joursRestants <= jours) {
            bientotExpires.push([nom, joursRestants]);
          }
        } catch (e) {
          // Ignorer les dates invalides
        }
      }
    });
    
    return bientotExpires.sort((a, b) => a[1] - b[1]);
  }

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

  obtenirStatutExpiration(nom) {
    if (!this.inventaire[nom]) return "Aliment non trouvé";
    
    const expiration = this.inventaire[nom].expiration;
    if (expiration === "Non specifiee") return "🔸 Date non spécifiée";
    
    try {
      const dateExp = new Date(expiration);
      const maintenant = new Date();
      const joursRestants = Math.ceil((dateExp - maintenant) / (1000 * 60 * 60 * 24));
      
      if (joursRestants < 0) return "🔴 EXPIRÉ";
      else if (joursRestants === 0) return "🟠 Expire aujourd'hui";
      else if (joursRestants <= 3) return `🟡 Expire dans ${joursRestants} jour(s)`;
      else if (joursRestants <= 7) return `🟢 Expire dans ${joursRestants} jours`;
      else return `✅ Expire le ${expiration}`;
    } catch (e) {
      return `⚠️ Date invalide: ${expiration}`;
    }
  }

  viderInventaire() {
    this.inventaire = {};
  }

  // Sauvegarde dans le localStorage du navigateur
  sauvegarderInventaire() {
    try {
      const donnees = {
        inventaire: this.inventaire,
        dateSauvegarde: new Date().toISOString(),
        version: '1.0'
      };
      localStorage.setItem('inventaire_app', JSON.stringify(donnees));
      return { success: true, message: "Inventaire sauvegardé avec succès" };
    } catch (error) {
      return { success: false, message: `Erreur lors de la sauvegarde: ${error.message}` };
    }
  }

  // Chargement depuis le localStorage
  chargerInventaire() {
    try {
      const donnees = localStorage.getItem('inventaire_app');
      if (!donnees) {
        return { success: false, message: "Aucune sauvegarde trouvée" };
      }

      const parsed = JSON.parse(donnees);
      if (parsed.inventaire) {
        this.inventaire = parsed.inventaire;
        return { success: true, message: `Inventaire chargé (sauvegardé le ${new Date(parsed.dateSauvegarde).toLocaleDateString()})` };
      } else {
        return { success: false, message: "Format de sauvegarde invalide" };
      }
    } catch (error) {
      return { success: false, message: `Erreur lors du chargement: ${error.message}` };
    }
  }
  /**
     * Vide complètement l'inventaire
     * @returns {Object} Résultat de l'opération
     */
    viderInventaire() {
        try {
            const nombreAliments = Object.keys(this.inventaire).length;
            
            if (nombreAliments === 0) {
                return {
                    success: false,
                    message: "L'inventaire est déjà vide."
                };
            }

            // Vider l'inventaire
            this.inventaire = {};
            
            // Sauvegarder automatiquement
            this.sauvegarderInventaire();
            
            return {
                success: true,
                message: `✅ Inventaire vidé ! ${nombreAliments} aliment(s) supprimé(s).`,
                nombreAliments: nombreAliments
            };
        } catch (error) {
            console.error('Erreur lors du vidage de l\'inventaire:', error);
            return {
                success: false,
                message: `❌ Erreur lors du vidage: ${error.message}`
            };
        }
    }
}

export default InventoryManager;