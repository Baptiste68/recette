// App.js - Composant principal
import React, { useState, useEffect } from 'react';
import InventoryManager from './managers/InventoryManager';
import DietManager from './managers/DietManager';
import RecipeManager from './managers/RecipeManager';
import { RecipeDisplayComponent } from './managers/RecipeDisplayManager';
import { RegimeAlimentaire, Allergie } from './constants/enums';
import { palette } from './constants/colors';
import { styles } from './styles/AppStyles';

const API_KEY = "ded78740b47643a18aecd38bc430db1a";

const InventaireApp = () => {
  // États
  const [currentTab, setCurrentTab] = useState('inventaire');
  const [inventoryManager] = useState(() => new InventoryManager());
  const [dietManager] = useState(() => new DietManager());
  const [recipeManager] = useState(() => new RecipeManager(API_KEY));
  
  // États pour l'inventaire
  const [inventaire, setInventaire] = useState({});
  const [nomAliment, setNomAliment] = useState('');
  const [quantiteAliment, setQuantiteAliment] = useState('');
  const [expirationAliment, setExpirationAliment] = useState('');
  
  // États pour les régimes
  const [regimesActifs, setRegimesActifs] = useState(new Set());
  const [allergiesActives, setAllergiesActives] = useState(new Set());
  
  // États pour les recettes avec nouveau système d'affichage
  const [nomRecette, setNomRecette] = useState('');
  const [recettes, setRecettes] = useState([]);
  const [showRecipes, setShowRecipes] = useState(false);
  const [loading, setLoading] = useState(false);

  // Aliments prédéfinis
  const alimentsPredefinis = {
    "🍎": "Pomme", "🍌": "Banane", "🍊": "Orange", "🍇": "Raisin",
    "🍓": "Fraise", "🥝": "Kiwi", "🥕": "Carotte", "🥒": "Concombre",
    "🍅": "Tomate", "🥬": "Salade", "🥔": "Pomme de terre", "🧅": "Oignon",
    "🥩": "Bœuf", "🍗": "Poulet", "🐟": "Poisson", "🥚": "Œuf",
    "🧀": "Fromage", "🥛": "Lait", "🍞": "Pain", "🍝": "Pâtes",
    "🍚": "Riz", "🥖": "Baguette", "🫖": "Thé", "☕": "Café"
  };

  // Mise à jour de l'inventaire
  const rafraichirInventaire = () => {
    setInventaire(inventoryManager.obtenirInventaire());
  };

  // Chargement initial des données sauvegardées
  useEffect(() => {
    // Charger l'inventaire sauvegardé
    const inventoryResult = inventoryManager.chargerInventaire();
    if (inventoryResult.success) {
      console.log('Inventaire chargé:', inventoryResult.message);
    }
    
    // Charger les préférences sauvegardées
    const dietResult = dietManager.chargerPreferences();
    if (dietResult.success) {
      console.log('Préférences chargées:', dietResult.message);
      // Mettre à jour les états React
      setRegimesActifs(new Set(dietManager.regimesActifs));
      setAllergiesActives(new Set(dietManager.allergiesActives));
    }
    
    rafraichirInventaire();
  }, []);

  // Sauvegarde automatique
  useEffect(() => {
    const interval = setInterval(() => {
      inventoryManager.sauvegarderInventaire();
      dietManager.sauvegarderPreferences();
    }, 30000); // Sauvegarde toutes les 30 secondes

    return () => clearInterval(interval);
  }, []);

  // Calcul de date d'expiration intelligente
  const calculerDateExpirationIntelligente = (nomAliment) => {
    const durees = {
      'tres_frais': ['Salade', 'Fraise', 'Cerise', 'Lait', 'Poisson'],
      'frais': ['Pomme', 'Banane', 'Orange', 'Carotte', 'Concombre', 'Tomate', 'Pain'],
      'moyen': ['Fromage', 'Œuf', 'Pomme de terre', 'Oignon'],
      'longue': ['Riz', 'Pâtes', 'Miel', 'Thé', 'Café', 'Beurre']
    };
    
    let jours = 30;
    for (const [categorie, aliments] of Object.entries(durees)) {
      if (aliments.includes(nomAliment)) {
        switch (categorie) {
          case 'tres_frais': jours = 4; break;
          case 'frais': jours = 7; break;
          case 'moyen': jours = 14; break;
          case 'longue': jours = 60; break;
        }
        break;
      }
    }
    
    const date = new Date();
    date.setDate(date.getDate() + jours);
    return date.toISOString().split('T')[0];
  };

  // Gestionnaires d'événements
  const ajouterAliment = () => {
    const quantite = parseInt(quantiteAliment) || 1;
    const expiration = expirationAliment || "Non specifiee";
    
    const result = inventoryManager.ajouterAliment(nomAliment, quantite, expiration);
    
    if (result.success) {
      setNomAliment('');
      setQuantiteAliment('');
      setExpirationAliment('');
      rafraichirInventaire();
      // Sauvegarde immédiate après ajout
      inventoryManager.sauvegarderInventaire();
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  const ajouterAlimentRapide = (nom) => {
    const dateExpiration = calculerDateExpirationIntelligente(nom);
    const result = inventoryManager.ajouterAliment(nom, 1, dateExpiration);
    
    if (result.success) {
      rafraichirInventaire();
      // Sauvegarde immédiate
      inventoryManager.sauvegarderInventaire();
      
      // Feedback visuel rapide
      const originalTitle = document.title;
      document.title = `✅ ${nom} ajouté`;
      setTimeout(() => {
        document.title = originalTitle;
      }, 2000);
    }
  };

  const supprimerAliment = (nom) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer '${nom}' ?`)) {
      inventoryManager.supprimerAliment(nom);
      rafraichirInventaire();
      inventoryManager.sauvegarderInventaire();
    }
  };

  const modifierQuantite = (nom, changement) => {
    const inventaireActuel = inventoryManager.obtenirInventaire();
    if (inventaireActuel[nom]) {
      const nouvelleQuantite = inventaireActuel[nom].quantite + changement;
      if (nouvelleQuantite <= 0) {
        supprimerAliment(nom);
      } else {
        inventoryManager.inventaire[nom].quantite = nouvelleQuantite;
        rafraichirInventaire();
        inventoryManager.sauvegarderInventaire();
      }
    }
  };

  const afficherInventaire = () => {
    const inv = inventoryManager.obtenirInventaire();
    if (Object.keys(inv).length === 0) {
      alert("📦 Votre inventaire est vide.");
      return;
    }
    
    let contenu = "📦 VOTRE INVENTAIRE\n" + "=".repeat(30) + "\n\n";
    Object.entries(inv).sort().forEach(([nom, details]) => {
      const icone = inventoryManager.obtenirIconeAliment(nom);
      const statut = inventoryManager.obtenirStatutExpiration(nom);
      contenu += `${icone} ${nom}\n`;
      contenu += `   📊 Quantité: ${details.quantite}\n`;
      contenu += `   ${statut}\n\n`;
    });
    
    alert(contenu);
  };

  const afficherStatistiques = () => {
    const stats = inventoryManager.obtenirStatistiques();
    let contenu = "📊 STATISTIQUES DE L'INVENTAIRE\n" + "=".repeat(35) + "\n\n";
    contenu += `📦 Nombre d'aliments différents: ${stats.totalAliments}\n`;
    contenu += `📊 Quantité totale: ${stats.totalQuantite}\n`;
    contenu += `🔴 Aliments expirés: ${stats.expires}\n`;
    contenu += `🟡 Expirent bientôt: ${stats.bientotExpires}\n`;
    alert(contenu);
  };

  const afficherExpires = () => {
    const expires = inventoryManager.obtenirAlimentsExpires();
    const bientotExpires = inventoryManager.obtenirAlimentsBientotExpires();
    
    let contenu = "⚠️ ALIMENTS À SURVEILLER\n" + "=".repeat(30) + "\n\n";
    
    if (expires.length > 0) {
      contenu += "🔴 EXPIRÉS:\n";
      expires.forEach(aliment => {
        const icone = inventoryManager.obtenirIconeAliment(aliment);
        contenu += `   ${icone} ${aliment}\n`;
      });
      contenu += "\n";
    }
    
    if (bientotExpires.length > 0) {
      contenu += "🟡 EXPIRENT BIENTÔT:\n";
      bientotExpires.forEach(([aliment, jours]) => {
        const icone = inventoryManager.obtenirIconeAliment(aliment);
        contenu += `   ${icone} ${aliment} (dans ${jours} jour(s))\n`;
      });
      contenu += "\n";
    }
    
    if (expires.length === 0 && bientotExpires.length === 0) {
      contenu += "✅ Tous vos aliments sont encore bons !";
    }
    
    alert(contenu);
  };

  const toggleRegime = (regime) => {
    const nouveauxRegimes = new Set(regimesActifs);
    if (nouveauxRegimes.has(regime)) {
      nouveauxRegimes.delete(regime);
      dietManager.retirerRegime(regime);
    } else {
      const added = dietManager.ajouterRegime(regime);
      if (added) {
        nouveauxRegimes.add(regime);
      } else {
        alert(`Le régime ${regime.nom} est incompatible avec vos régimes actuels.`);
        return;
      }
    }
    setRegimesActifs(nouveauxRegimes);
    dietManager.sauvegarderPreferences();
  };

  const toggleAllergie = (allergie) => {
    const nouvellesAllergies = new Set(allergiesActives);
    if (nouvellesAllergies.has(allergie)) {
      nouvellesAllergies.delete(allergie);
      dietManager.retirerAllergie(allergie);
    } else {
      nouvellesAllergies.add(allergie);
      dietManager.ajouterAllergie(allergie);
    }
    setAllergiesActives(nouvellesAllergies);
    dietManager.sauvegarderPreferences();
  };

  const afficherResumePreferences = () => {
    const resume = dietManager.obtenirResumePreferences();
    alert(resume);
  };

  const resetPreferences = () => {
    if (window.confirm("Êtes-vous sûr de vouloir réinitialiser toutes vos préférences ?")) {
      dietManager.resetPreferences();
      setRegimesActifs(new Set());
      setAllergiesActives(new Set());
      dietManager.sauvegarderPreferences();
      alert("Préférences réinitialisées !");
    }
  };

  const rechercherRecettesOptimisee = async () => {
    const inv = inventoryManager.obtenirInventaire();
    if (Object.keys(inv).length === 0) {
      alert("Ajoutez d'abord des aliments à votre inventaire !");
      return;
    }
    
    setLoading(true);
    
    // Mise à jour des régimes dans le recipe manager
    regimesActifs.forEach(regime => {
      recipeManager.ajouterRegime(regime);
    });
    
    const ingredients = Object.keys(inv);
    const result = await recipeManager.rechercherRecettesParIngredients(ingredients, 12);
    
    if (result.success && result.recettes.length > 0) {
      // Optimiser l'ordre des recettes selon l'inventaire
      const recettesOptimisees = recipeManager.optimiserUtilisationAliments(inv, result.recettes);
      setRecettes(recettesOptimisees);
      setShowRecipes(true);
    } else {
      alert(result.message || "Aucune recette trouvée");
    }
    setLoading(false);
  };

  const rechercherRecettesParNom = async () => {
    if (!nomRecette.trim()) {
      alert("Veuillez saisir le nom d'une recette.");
      return;
    }
    
    setLoading(true);
    
    // Mise à jour des régimes
    regimesActifs.forEach(regime => {
      recipeManager.ajouterRegime(regime);
    });
    
    const result = await recipeManager.rechercherRecettesParNom(nomRecette, 10);
    
    if (result.success && result.recettes.length > 0) {
      setRecettes(result.recettes);
      setShowRecipes(true);
    } else {
      alert(result.message || "Aucune recette trouvée");
    }
    setLoading(false);
  };

  const afficherAlimentsPrioritaires = () => {
    const expires = inventoryManager.obtenirAlimentsExpires();
    const bientotExpires = inventoryManager.obtenirAlimentsBientotExpires(3);
    
    let contenu = "⏰ ALIMENTS À UTILISER EN PRIORITÉ\n" + "=".repeat(40) + "\n\n";
    
    if (expires.length > 0) {
      contenu += "🔴 URGENCE MAXIMALE (expirés):\n";
      expires.forEach(aliment => {
        const icone = inventoryManager.obtenirIconeAliment(aliment);
        contenu += `   ${icone} ${aliment}\n`;
      });
      contenu += "\n";
    }
    
    if (bientotExpires.length > 0) {
      contenu += "🟡 À UTILISER RAPIDEMENT:\n";
      bientotExpires.forEach(([aliment, jours]) => {
        const icone = inventoryManager.obtenirIconeAliment(aliment);
        contenu += `   ${icone} ${aliment} (dans ${jours} jour(s))\n`;
      });
      contenu += "\n";
    }
    
    if (expires.length === 0 && bientotExpires.length === 0) {
      contenu += "✅ Aucun aliment urgent à utiliser !";
    } else {
      contenu += "💡 Conseil: Utilisez la recherche optimisée de recettes\n";
      contenu += "pour des suggestions qui priorisent ces aliments !";
    }
    
    alert(contenu);
  };

  const suggestionsAchats = () => {
    if (regimesActifs.size === 0) {
      alert("Configurez d'abord vos préférences alimentaires pour obtenir des suggestions personnalisées !");
      return;
    }
    
    let contenu = "💡 SUGGESTIONS D'ACHATS\n" + "=".repeat(30) + "\n\n";
    
    regimesActifs.forEach(regime => {
      const suggestions = dietManager.obtenirSuggestionsAliments(regime);
      contenu += `${regime.emoji} ${regime.nom}:\n`;
      suggestions.slice(0, 5).forEach(suggestion => {
        contenu += `   • ${suggestion}\n`;
      });
      contenu += "\n";
    });
    
    alert(contenu);
  };

  // Rendu des composants d'onglets
  const renderInventaireTab = () => (
    <div style={styles.tabContent}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>📦 Gestion Inventaire</h1>
        <p style={styles.headerSubtitle}>Optimisez votre stock alimentaire</p>
      </div>

      {/* Grille d'aliments prédéfinis */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>🍎 Aliments populaires</h2>
        <div style={styles.grid}>
          {Object.entries(alimentsPredefinis).map(([icone, nom]) => (
            <button
              key={nom}
              style={styles.gridItem}
              onClick={() => ajouterAlimentRapide(nom)}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              <span style={styles.gridIcon}>{icone}</span>
              <span style={styles.gridText}>{nom}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Ajout d'aliment */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>➕ Ajouter un aliment</h2>
        <input
          style={styles.input}
          type="text"
          placeholder="🍎 Nom de l'aliment"
          value={nomAliment}
          onChange={(e) => setNomAliment(e.target.value)}
        />
        <div style={styles.inputRow}>
          <input
            style={{...styles.input, ...styles.inputHalf}}
            type="number"
            placeholder="📊 Quantité"
            value={quantiteAliment}
            onChange={(e) => setQuantiteAliment(e.target.value)}
          />
          <input
            style={{...styles.input, ...styles.inputHalf}}
            type="date"
            placeholder="📅 Expiration"
            value={expirationAliment}
            onChange={(e) => setExpirationAliment(e.target.value)}
          />
        </div>
        <button 
          style={{...styles.button, ...styles.successButton}} 
          onClick={ajouterAliment}
        >
          ✅ Ajouter à l'inventaire
        </button>
      </div>

      {/* Actions rapides */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>🎯 Actions rapides</h2>
        <div style={styles.buttonRow}>
          <button 
            style={{...styles.button, ...styles.infoButton, ...styles.buttonFlex}} 
            onClick={afficherInventaire}
          >
            📋 Voir inventaire
          </button>
          <button 
            style={{...styles.button, ...styles.dangerButton, ...styles.buttonFlex}} 
            onClick={afficherExpires}
          >
            ⚠️ Aliments expirés
          </button>
        </div>
        <button 
          style={{...styles.button, ...styles.warningButton}} 
          onClick={afficherStatistiques}
        >
          📊 Statistiques
        </button>
      </div>

      {/* Inventaire actuel */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>📦 Inventaire actuel</h2>
        {Object.keys(inventaire).length === 0 ? (
          <p style={styles.emptyText}>Inventaire vide</p>
        ) : (
          Object.entries(inventaire).map(([nom, details]) => (
            <div key={nom} style={styles.inventoryItem}>
              <div style={styles.inventoryInfo}>
                <div style={styles.inventoryName}>
                  {inventoryManager.obtenirIconeAliment(nom)} {nom}
                </div>
                <div style={styles.quantityRow}>
                  <button 
                    style={styles.quantityButton}
                    onClick={() => modifierQuantite(nom, -1)}
                  >
                    ➖
                  </button>
                  <span style={styles.inventoryQuantity}>Quantité: {details.quantite}</span>
                  <button 
                    style={styles.quantityButton}
                    onClick={() => modifierQuantite(nom, 1)}
                  >
                    ➕
                  </button>
                </div>
                <div style={styles.inventoryExpiry}>
                  {inventoryManager.obtenirStatutExpiration(nom)}
                </div>
              </div>
              <button 
                style={styles.deleteButton}
                onClick={() => supprimerAliment(nom)}
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderRegimesTab = () => (
    <div style={styles.tabContent}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>🥗 Préférences Alimentaires</h1>
        <p style={styles.headerSubtitle}>Configurez vos régimes et allergies</p>
      </div>

      {/* Régimes alimentaires */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>🍽️ Régimes alimentaires</h2>
        {Object.values(RegimeAlimentaire).map(regime => (
          <div
            key={regime.value}
            style={styles.checkboxRow}
            onClick={() => toggleRegime(regime)}
          >
            <div style={{
              ...styles.checkbox, 
              ...(regimesActifs.has(regime) ? styles.checkboxActive : {})
            }}>
              {regimesActifs.has(regime) && <span style={styles.checkmark}>✓</span>}
            </div>
            <span style={styles.checkboxText}>
              {regime.emoji} {regime.nom} - {regime.description}
            </span>
          </div>
        ))}
      </div>

      {/* Allergies */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>⚠️ Allergies et intolérances</h2>
        {Object.values(Allergie).map(allergie => (
          <div
            key={allergie.value}
            style={styles.checkboxRow}
            onClick={() => toggleAllergie(allergie)}
          >
            <div style={{
              ...styles.checkbox, 
              ...(allergiesActives.has(allergie) ? styles.checkboxActive : {})
            }}>
              {allergiesActives.has(allergie) && <span style={styles.checkmark}>✓</span>}
            </div>
            <span style={styles.checkboxText}>
              {allergie.emoji} {allergie.nom}
            </span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={styles.buttonRow}>
        <button 
          style={{...styles.button, ...styles.successButton, ...styles.buttonFlex}} 
          onClick={afficherResumePreferences}
        >
          📄 Voir résumé
        </button>
        <button 
          style={{...styles.button, ...styles.dangerButton, ...styles.buttonFlex}} 
          onClick={resetPreferences}
        >
          🔄 Réinitialiser
        </button>
      </div>
    </div>
  );

  const renderRecettesTab = () => (
    <div style={styles.tabContent}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>🍽️ Suggestions de Recettes</h1>
        <p style={styles.headerSubtitle}>Trouvez des recettes avec vos ingrédients</p>
      </div>

      {/* Recherche optimisée */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>🎯 Recherche optimisée</h2>
        <p style={styles.description}>
          Trouve les meilleures recettes avec vos ingrédients disponibles.<br/>
          Priorise les aliments qui expirent bientôt !
        </p>
        <button 
          style={{...styles.button, ...styles.successButton}} 
          onClick={rechercherRecettesOptimisee}
          disabled={loading}
        >
          {loading ? "🔄 Recherche..." : "🚀 Recherche optimisée"}
        </button>
      </div>

      {/* Recherche par nom */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>🔍 Recherche par nom</h2>
        <input
          style={styles.input}
          type="text"
          placeholder="🍝 Nom de la recette (ex: pasta, pizza, soup...)"
          value={nomRecette}
          onChange={(e) => setNomRecette(e.target.value)}
        />
        <button 
          style={{...styles.button, ...styles.warningButton}} 
          onClick={rechercherRecettesParNom}
          disabled={loading}
        >
          {loading ? "🔄 Recherche..." : "🔍 Rechercher"}
        </button>
      </div>

      {/* Actions utiles */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>💡 Actions utiles</h2>
        <div style={styles.buttonRow}>
          <button 
            style={{...styles.button, ...styles.dangerButton, ...styles.buttonFlex}} 
            onClick={afficherAlimentsPrioritaires}
          >
            ⏰ Aliments à utiliser
          </button>
          <button 
            style={{...styles.button, ...styles.infoButton, ...styles.buttonFlex}} 
            onClick={suggestionsAchats}
          >
            💡 Suggestions d'achats
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Navigation */}
      <div style={styles.navigation}>
        <button
          style={{
            ...styles.navButton, 
            ...(currentTab === 'inventaire' ? styles.activeNavButton : {})
          }}
          onClick={() => setCurrentTab('inventaire')}
        >
          📦 Inventaire
        </button>
        <button
          style={{
            ...styles.navButton, 
            ...(currentTab === 'regimes' ? styles.activeNavButton : {})
          }}
          onClick={() => setCurrentTab('regimes')}
        >
          🥗 Régimes
        </button>
        <button
          style={{
            ...styles.navButton, 
            ...(currentTab === 'recettes' ? styles.activeNavButton : {})
          }}
          onClick={() => setCurrentTab('recettes')}
        >
          🍽️ Recettes
        </button>
      </div>

      {/* Contenu des onglets */}
      <div style={styles.content}>
        {currentTab === 'inventaire' && renderInventaireTab()}
        {currentTab === 'regimes' && renderRegimesTab()}
        {currentTab === 'recettes' && renderRecettesTab()}
      </div>

      {/* Nouveau système d'affichage des recettes avec pagination */}
      {showRecipes && (
        <RecipeDisplayComponent
          recipes={recettes}
          inventaire={inventaire}
          recipeManager={recipeManager}
          onClose={() => setShowRecipes(false)}
        />
      )}
    </div>
  );
};

export default InventaireApp;
