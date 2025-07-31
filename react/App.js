import React, { useState, useEffect } from 'react';

import { DietManager } from './diet_manager.js';
import { InventoryManager } from './inventory.js';
import { RecipeManager } from './recipe_manager.js';
import { InventoryWidgetManager } from './inventory_widgets.js';
import TabManager from './ui_tabs.js';
import EventHandlers from './app_handlers.js';
import { Palette } from './palette.js';

// Configuration
const API_KEY = "ded78740b47643a18aecd38bc430db1a";

class InventaireApp {
  constructor() {
    this.startup();
  }

  startup() {
    // Initialisation des gestionnaires
    this.dietManager = new DietManager();
    this.inventoryManager = new InventoryManager();
    this.recipeManager = new RecipeManager(API_KEY);

    this.inventoryCache = {};
    this.statsCache = null;
    this.lastCacheTime = null;

    // Délégation aux modules spécialisés
    this.widgetManager = new InventoryWidgetManager(this);
    this.tabManager = new TabManager(this);
    this.palette = new Palette();
    this.eventHandlers = new EventHandlers(this, this.palette);

    // État de l'application
    this.currentTab = "inventaire";

    // Mock des objets pour l'exemple
    this.mockInitialization();
  }

  // Mock pour l'exemple - remplacer par vos vrais modules
  mockInitialization() {
    this.palette = {
      MODERN_COLORS: {
        bg_primary: '#f8f9fa',
        bg_secondary: '#e9ecef',
        bg_card: '#ffffff',
        primary: '#007bff',
        success: '#28a745',
        danger: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8',
        text_primary: '#343a40',
        text_white: '#ffffff'
      }
    };

    this.mainWindow = {
      title: "Gestion Inventaire & Recettes",
      infoDialog: (title, message) => alert(`${title}: ${message}`),
      errorDialog: (title, message) => alert(`Erreur - ${title}: ${message}`),
      questionDialog: (title, message) => window.confirm(`${title}: ${message}`)
    };
  }

  updateNavButtons(activeTab) {
    this.currentTab = activeTab;
  }

  combineInv() {
    this.tabManager.showInventaireTab(this.contentContainer);
    this.updateNavButtons("inventaire");
  }

  combineRecettes() {
    this.tabManager.showRecettesTab(this.contentContainer);
    this.updateNavButtons("recettes");
  }

  combineRegimes() {
    this.tabManager.showRegimesTab(this.contentContainer);
    this.updateNavButtons("regimes");
  }
}

// Composant React principal
const InventaireAppComponent = () => {
  const [app] = useState(() => new InventaireApp());
  const [currentTab, setCurrentTab] = useState("inventaire");

  // Mock des données pour l'exemple
  const [inventoryData, setInventoryData] = useState({
    pommes: { quantite: 5, expiration: '2024-12-01' },
    pain: { quantite: 2, expiration: '2024-08-05' },
    lait: { quantite: 1, expiration: '2024-08-10' }
  });

  const handleTabChange = (tabName) => {
    setCurrentTab(tabName);
    app.updateNavButtons(tabName);
  };

  // Styles basés sur la palette
  const palette = app.palette;

  const mainContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    padding: 0,
    backgroundColor: palette.MODERN_COLORS.bg_primary,
    minHeight: '100vh'
  };

  const leftContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    flex: 2,
    padding: '5px'
  };

  const navBoxStyle = {
    display: 'flex',
    flexDirection: 'row',
    padding: '15px',
    backgroundColor: palette.MODERN_COLORS.bg_card,
    gap: '10px'
  };

  const contentContainerStyle = {
    flex: 1,
    padding: 0,
    backgroundColor: palette.MODERN_COLORS.bg_primary,
    overflow: 'auto',
    minHeight: '500px'
  };

  const createModernNavStyle = (isActive = false) => {
    if (isActive) {
      return {
        flex: 1,
        padding: '15px',
        backgroundColor: palette.MODERN_COLORS.primary,
        color: palette.MODERN_COLORS.text_white,
        margin: '3px',
        textAlign: 'center',
        fontWeight: 'bold',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'all 0.3s ease'
      };
    } else {
      return {
        flex: 1,
        padding: '15px',
        backgroundColor: palette.MODERN_COLORS.bg_secondary,
        color: palette.MODERN_COLORS.text_primary,
        margin: '3px',
        textAlign: 'center',
        fontWeight: 'bold',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'all 0.3s ease'
      };
    }
  };

  // Composant pour l'onglet Inventaire
  const InventaireTab = () => {
    const [nomAliment, setNomAliment] = useState('');
    const [quantite, setQuantite] = useState('');
    const [expiration, setExpiration] = useState('');

    const handleAjouterAliment = () => {
      if (!nomAliment.trim()) {
        app.mainWindow.errorDialog("Erreur", "Veuillez saisir le nom de l'aliment.");
        return;
      }

      const nouvelAliment = {
        quantite: parseInt(quantite) || 1,
        expiration: expiration || 'Non spécifiée'
      };

      setInventoryData(prev => ({
        ...prev,
        [nomAliment.toLowerCase()]: nouvelAliment
      }));

      // Vider les champs
      setNomAliment('');
      setQuantite('');
      setExpiration('');

      app.mainWindow.infoDialog("Succès", `${nomAliment} ajouté à l'inventaire !`);
    };

    const afficherInventaire = () => {
      if (Object.keys(inventoryData).length === 0) {
        app.mainWindow.infoDialog("Inventaire", "📦 Votre inventaire est vide.");
        return;
      }

      let contenu = "📦 VOTRE INVENTAIRE\n" + "=".repeat(30) + "\n\n";
      
      Object.entries(inventoryData).forEach(([nom, details]) => {
        contenu += `🍎 ${nom}\n`;
        contenu += `   📊 Quantité: ${details.quantite}\n`;
        contenu += `   📅 Expiration: ${details.expiration}\n\n`;
      });

      app.mainWindow.infoDialog("Inventaire", contenu);
    };

    return (
      <div style={{ padding: '20px' }}>
        {/* Header moderne */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '25px',
          backgroundColor: palette.MODERN_COLORS.primary,
          textAlign: 'center',
          marginBottom: '20px',
          borderRadius: '12px'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 'bold',
            color: palette.MODERN_COLORS.text_white,
            padding: '5px'
          }}>
            📦 Gestion Inventaire
          </h1>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: palette.MODERN_COLORS.text_white,
            padding: '5px'
          }}>
            Optimisez votre stock alimentaire
          </p>
        </div>

        {/* Section ajout d'aliment */}
        <div style={{
          backgroundColor: palette.MODERN_COLORS.bg_card,
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{
            color: palette.MODERN_COLORS.text_primary,
            marginBottom: '15px'
          }}>
            ➕ Ajouter un aliment
          </h3>

          <input
            type="text"
            placeholder="🍎 Nom de l'aliment"
            value={nomAliment}
            onChange={(e) => setNomAliment(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              margin: '5px 0',
              backgroundColor: palette.MODERN_COLORS.bg_card,
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />

          <div style={{ display: 'flex', gap: '10px', margin: '5px 0' }}>
            <input
              type="text"
              placeholder="📊 Quantité"
              value={quantite}
              onChange={(e) => setQuantite(e.target.value)}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: palette.MODERN_COLORS.bg_card,
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
            <input
              type="date"
              placeholder="📅 Expiration"
              value={expiration}
              onChange={(e) => setExpiration(e.target.value)}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: palette.MODERN_COLORS.bg_card,
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          <button
            onClick={handleAjouterAliment}
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor: palette.MODERN_COLORS.success,
              color: palette.MODERN_COLORS.text_white,
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            ✅ Ajouter à l'inventaire
          </button>
        </div>

        {/* Section actions */}
        <div style={{
          backgroundColor: palette.MODERN_COLORS.bg_card,
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{
            color: palette.MODERN_COLORS.text_primary,
            marginBottom: '15px'
          }}>
            🎯 Actions rapides
          </h3>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={afficherInventaire}
              style={{
                flex: 1,
                minWidth: '150px',
                padding: '12px',
                backgroundColor: palette.MODERN_COLORS.info,
                color: palette.MODERN_COLORS.text_white,
                border: 'none',
                borderRadius: '4px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              📋 Voir inventaire
            </button>

            <button
              onClick={() => app.mainWindow.infoDialog("Statistiques", `Total d'aliments: ${Object.keys(inventoryData).length}`)}
              style={{
                flex: 1,
                minWidth: '150px',
                padding: '12px',
                backgroundColor: palette.MODERN_COLORS.warning,
                color: palette.MODERN_COLORS.text_white,
                border: 'none',
                borderRadius: '4px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              📊 Statistiques
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Composant pour l'onglet Régimes
  const RegimesTab = () => {
    const [regimes, setRegimes] = useState({
      vegetarien: false,
      vegan: false,
      sans_gluten: false,
      sans_lactose: false
    });

    const [allergies, setAllergies] = useState({
      fruits_coque: false,
      crustaces: false,
      oeufs: false,
      poisson: false
    });

    const handleRegimeChange = (regime) => {
      setRegimes(prev => ({
        ...prev,
        [regime]: !prev[regime]
      }));
    };

    const handleAllergieChange = (allergie) => {
      setAllergies(prev => ({
        ...prev,
        [allergie]: !prev[allergie]
      }));
    };

    return (
      <div style={{ padding: '20px' }}>
        <h1 style={{
          textAlign: 'center',
          fontSize: '18px',
          fontWeight: 'bold',
          padding: '10px',
          color: palette.MODERN_COLORS.text_primary
        }}>
          🥗 PRÉFÉRENCES ALIMENTAIRES
        </h1>

        {/* Section régimes */}
        <div style={{
          backgroundColor: '#f9f9f9',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3 style={{ fontWeight: 'bold', padding: '5px' }}>🍽️ Régimes alimentaires</h3>
          
          {Object.entries(regimes).map(([regime, isChecked]) => (
            <label key={regime} style={{ display: 'block', padding: '8px' }}>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => handleRegimeChange(regime)}
                style={{ marginRight: '10px' }}
              />
              {regime.replace('_', ' ').toUpperCase()}
            </label>
          ))}
        </div>

        {/* Section allergies */}
        <div style={{
          backgroundColor: '#fff3cd',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3 style={{ fontWeight: 'bold', padding: '5px' }}>⚠️ Allergies et intolérances</h3>
          
          {Object.entries(allergies).map(([allergie, isChecked]) => (
            <label key={allergie} style={{ display: 'block', padding: '8px' }}>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => handleAllergieChange(allergie)}
                style={{ marginRight: '10px' }}
              />
              {allergie.replace('_', ' ').toUpperCase()}
            </label>
          ))}
        </div>

        {/* Boutons d'action */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              const resumeRegimes = Object.entries(regimes)
                .filter(([_, isChecked]) => isChecked)
                .map(([regime, _]) => regime)
                .join(', ');
              const resumeAllergies = Object.entries(allergies)
                .filter(([_, isChecked]) => isChecked)
                .map(([allergie, _]) => allergie)
                .join(', ');
              
              app.mainWindow.infoDialog("Résumé", 
                `Régimes: ${resumeRegimes || 'Aucun'}\nAllergies: ${resumeAllergies || 'Aucune'}`
              );
            }}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            📄 Voir résumé
          </button>

          <button
            onClick={() => {
              setRegimes({
                vegetarien: false,
                vegan: false,
                sans_gluten: false,
                sans_lactose: false
              });
              setAllergies({
                fruits_coque: false,
                crustaces: false,
                oeufs: false,
                poisson: false
              });
            }}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🔄 Réinitialiser
          </button>
        </div>
      </div>
    );
  };

  // Composant pour l'onglet Recettes
  const RecettesTab = () => {
    const [nomRecette, setNomRecette] = useState('');

    const rechercheOptimisee = () => {
      if (Object.keys(inventoryData).length === 0) {
        app.mainWindow.infoDialog(
          "Inventaire vide",
          "Ajoutez d'abord des aliments à votre inventaire pour obtenir des suggestions de recettes !"
        );
        return;
      }

      const ingredients = Object.keys(inventoryData).join(', ');
      app.mainWindow.infoDialog(
        "Recettes suggérées",
        `Voici des recettes avec vos ingrédients:\n${ingredients}\n\n🍝 Pasta aux légumes\n🥗 Salade composée\n🍲 Soupe maison`
      );
    };

    const rechercheParNom = () => {
      if (!nomRecette.trim()) {
        app.mainWindow.errorDialog("Erreur", "Veuillez saisir le nom d'une recette.");
        return;
      }

      app.mainWindow.infoDialog(
        "Recettes trouvées",
        `🔍 RECETTES POUR '${nomRecette.toUpperCase()}'\n\n1. 🍽️ ${nomRecette} classique\n2. 🍽️ ${nomRecette} moderne\n3. 🍽️ ${nomRecette} végétarien`
      );
    };

    return (
      <div style={{ padding: '20px' }}>
        <h1 style={{
          textAlign: 'center',
          fontSize: '18px',
          fontWeight: 'bold',
          padding: '10px',
          color: palette.MODERN_COLORS.text_primary
        }}>
          🍽️ SUGGESTIONS DE RECETTES
        </h1>

        {/* Recherche optimisée */}
        <div style={{
          backgroundColor: '#e8f5e8',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3 style={{ fontWeight: 'bold', padding: '5px' }}>🎯 Recherche optimisée</h3>
          <p style={{ padding: '5px', textAlign: 'center' }}>
            Trouve les meilleures recettes avec vos ingrédients disponibles.<br />
            Priorise les aliments qui expirent bientôt !
          </p>
          <button
            onClick={rechercheOptimisee}
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🚀 Recherche optimisée
          </button>
        </div>

        {/* Recherche par nom */}
        <div style={{
          backgroundColor: '#fff3e0',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3 style={{ fontWeight: 'bold', padding: '5px' }}>🔍 Recherche par nom</h3>
          <input
            type="text"
            placeholder="🍝 Nom de la recette (ex: pasta, pizza, soup...)"
            value={nomRecette}
            onChange={(e) => setNomRecette(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              margin: '10px 0',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
          <button
            onClick={rechercheParNom}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🔍 Rechercher
          </button>
        </div>

        {/* Actions rapides */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => app.mainWindow.infoDialog("Aliments prioritaires", "🍎 Pommes (expire dans 2 jours)\n🥛 Lait (expire dans 5 jours)")}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            ⏰ Aliments à utiliser
          </button>

          <button
            onClick={() => app.mainWindow.infoDialog("Suggestions", "💡 Suggestions d'achats:\n- Légumes verts\n- Protéines\n- Féculents")}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            💡 Suggestions d'achats
          </button>
        </div>
      </div>
    );
  };

  const renderCurrentTab = () => {
    switch (currentTab) {
      case 'inventaire':
        return <InventaireTab />;
      case 'regimes':
        return <RegimesTab />;
      case 'recettes':
        return <RecettesTab />;
      default:
        return <InventaireTab />;
    }
  };

  return (
    <div style={mainContainerStyle}>
      <div style={leftContainerStyle}>
        {/* Barre de navigation */}
        <div style={navBoxStyle}>
          <button
            onClick={() => handleTabChange('inventaire')}
            style={createModernNavStyle(currentTab === 'inventaire')}
          >
            📦 Inventaire
          </button>
          <button
            onClick={() => handleTabChange('regimes')}
            style={createModernNavStyle(currentTab === 'regimes')}
          >
            🥗 Régimes
          </button>
          <button
            onClick={() => handleTabChange('recettes')}
            style={createModernNavStyle(currentTab === 'recettes')}
          >
            🍽️ Recettes
          </button>
        </div>

        {/* Contenu des onglets */}
        <div style={contentContainerStyle}>
          {renderCurrentTab()}
        </div>
      </div>

      {/* Panneau latéral d'informations */}
      <div style={{
        width: '300px',
        backgroundColor: palette.MODERN_COLORS.bg_card,
        padding: '20px',
        borderLeft: '1px solid #ddd'
      }}>
        <h3>📊 Résumé</h3>
        <div style={{ marginBottom: '15px' }}>
          <strong>Inventaire:</strong>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {Object.keys(inventoryData).length} aliment(s)
          </div>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <strong>Onglet actuel:</strong>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {currentTab}
          </div>
        </div>
        <div style={{ fontSize: '10px', color: '#999', marginTop: '20px' }}>
          Gestion Inventaire & Recettes v1.0
        </div>
      </div>
    </div>
  );
};

// Point d'entrée de l'application
const App = () => {
  return <InventaireAppComponent />;
};

export default App;