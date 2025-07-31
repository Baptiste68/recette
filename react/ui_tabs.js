import React, { useState } from 'react';

// Import des modules personnalisés (à adapter selon votre structure)
// import { RegimeAlimentaire, Allergie } from './dietManager';

class TabManager {
  constructor(appInstance) {
    this.app = appInstance;
    this.current_tab = null;
  }

  createInventaireTab(widgetManager, inventory, eventHandlers, dietManager, lastCacheTime, statsCache, window, palette) {
    const InventaireTab = () => {
      const [nomAliment, setNomAliment] = useState('');
      const [quantiteAliment, setQuantiteAliment] = useState('');
      const [expirationAliment, setExpirationAliment] = useState('');

      const inventaireBoxStyle = {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        padding: 0,
        backgroundColor: palette.MODERN_COLORS.bg_primary
      };

      const headerBoxStyle = {
        display: 'flex',
        flexDirection: 'column',
        padding: '25px',
        backgroundColor: palette.MODERN_COLORS.primary,
        textAlign: 'center'
      };

      const titleLabelStyle = {
        textAlign: 'center',
        fontSize: '24px',
        fontWeight: 'bold',
        color: palette.MODERN_COLORS.text_white,
        padding: '5px'
      };

      const subtitleLabelStyle = {
        textAlign: 'center',
        fontSize: '14px',
        color: palette.MODERN_COLORS.text_white,
        padding: '5px'
      };

      const mainContainerStyle = {
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        backgroundColor: palette.MODERN_COLORS.bg_primary
      };

      return (
        <div style={inventaireBoxStyle}>
          {/* Header moderne avec gradient simulé */}
          <div style={headerBoxStyle}>
            <div style={titleLabelStyle}>📦 Gestion Inventaire</div>
            <div style={subtitleLabelStyle}>Optimisez votre stock alimentaire</div>
          </div>

          {/* Container principal avec cards */}
          <div style={mainContainerStyle}>
            {/* Card pour la grille d'aliments */}
            <div style={this.createModernCardStyle(palette)}>
              <div style={{
                fontSize: '18px',
                fontWeight: 'normal',
                padding: '10px',
                color: palette.MODERN_COLORS.text_primary
              }}>
                🍎 Aliments populaires
              </div>
              {/* Grille d'aliments prédéfinis */}
              {widgetManager.createPredefinedFoodGrid(
                eventHandlers, dietManager, widgetManager, inventory, 
                lastCacheTime, statsCache, window
              )}
            </div>

            {/* Section ajout d'aliment */}
            <div style={this.createModernCardStyle(palette)}>
              <div style={{
                fontWeight: 'bold',
                padding: '10px',
                color: palette.MODERN_COLORS.text_primary
              }}>
                ➕ Ajouter un aliment
              </div>

              {/* Champs de saisie */}
              <input
                type="text"
                placeholder="🍎 Nom de l'aliment"
                value={nomAliment}
                onChange={(e) => setNomAliment(e.target.value)}
                style={this.createModernInputStyle(palette)}
              />

              <div style={{ display: 'flex', padding: '5px' }}>
                <input
                  type="text"
                  placeholder="📊 Quantité"
                  value={quantiteAliment}
                  onChange={(e) => setQuantiteAliment(e.target.value)}
                  style={{
                    ...this.createModernInputStyle(palette),
                    flex: 1,
                    marginRight: '5px'
                  }}
                />
                <input
                  type="text"
                  placeholder="📅 Expiration (YYYY-MM-DD)"
                  value={expirationAliment}
                  onChange={(e) => setExpirationAliment(e.target.value)}
                  style={{
                    ...this.createModernInputStyle(palette),
                    flex: 1,
                    marginRight: '5px'
                  }}
                />
              </div>

              <button
                onClick={() => eventHandlers.onAjouterAliment(
                  null, inventory, widgetManager, 
                  { value: nomAliment }, 
                  { value: quantiteAliment }, 
                  { value: expirationAliment }, 
                  window, lastCacheTime, statsCache
                )}
                style={this.createGlassButtonStyle(palette, 'success')}
              >
                ✅ Ajouter à l'inventaire
              </button>
            </div>

            {/* Section actions */}
            <div style={this.createModernCardStyle(palette)}>
              <div style={{
                fontSize: '18px',
                fontWeight: 'bold',
                padding: '10px',
                color: palette.MODERN_COLORS.text_primary
              }}>
                🎯 Actions rapides
              </div>

              <div style={{ display: 'flex', padding: '10px' }}>
                <button
                  onClick={() => eventHandlers.afficherInventaire(null, inventory, window)}
                  style={{
                    ...this.createGlassButtonStyle(palette, 'info'),
                    flex: 1,
                    marginRight: '5px'
                  }}
                >
                  📋 Voir inventaire
                </button>

                <button
                  onClick={() => eventHandlers.afficherExpires(null, inventory, window)}
                  style={{
                    ...this.createGlassButtonStyle(palette, 'danger'),
                    flex: 1,
                    marginRight: '5px'
                  }}
                >
                  ⚠️ Aliments expirés
                </button>

                <button
                  onClick={() => eventHandlers.afficherStatistiques(null, inventory, window)}
                  style={{
                    ...this.createGlassButtonStyle(palette, 'warning'),
                    flex: 1,
                    marginRight: '5px'
                  }}
                >
                  📊 Statistiques
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    };

    return <InventaireTab />;
  }

  createRegimesTab(dietManager, eventHandlers, window) {
    const RegimesTab = () => {
      const [regimeCheckboxes, setRegimeCheckboxes] = useState({});
      const [allergieCheckboxes, setAllergieCheckboxes] = useState({});

      const regimesBoxStyle = {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        padding: '10px',
        backgroundColor: '#f8f9fa'
      };

      const handleRegimeToggle = (regime, value) => {
        eventHandlers.toggleRegime(regime, value, dietManager, regimeCheckboxes, window);
        setRegimeCheckboxes(prev => ({ ...prev, [regime]: value }));
      };

      const handleAllergieToggle = (allergie, value) => {
        eventHandlers.toggleAllergie(allergie, value, dietManager, regimeCheckboxes);
        setAllergieCheckboxes(prev => ({ ...prev, [allergie]: value }));
      };

      return (
        <div style={regimesBoxStyle}>
          {/* Titre */}
          <div style={{
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            padding: '10px'
          }}>
            🥗 PRÉFÉRENCES ALIMENTAIRES
          </div>

          {/* Section régimes alimentaires */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '10px',
            backgroundColor: '#f9f9f9'
          }}>
            <div style={{ fontWeight: 'bold', padding: '5px' }}>
              🍽️ Régimes alimentaires
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', padding: '5px' }}>
              {/* Ici, vous devrez remplacer RegimeAlimentaire par vos données réelles */}
              {/* RegimeAlimentaire.map(regime => (
                <label key={regime.name} style={{ padding: '3px' }}>
                  <input
                    type="checkbox"
                    checked={regimeCheckboxes[regime] || false}
                    onChange={(e) => handleRegimeToggle(regime, e.target.checked)}
                  />
                  {regime.emoji} {regime.nom_affichage} - {regime.description}
                </label>
              )) */}
            </div>
          </div>

          {/* Section allergies */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '10px',
            backgroundColor: '#fff3cd'
          }}>
            <div style={{ fontWeight: 'bold', padding: '5px' }}>
              ⚠️ Allergies et intolérances
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', padding: '5px' }}>
              {/* Ici, vous devrez remplacer Allergie par vos données réelles */}
              {/* Allergie.map(allergie => (
                <label key={allergie.name} style={{ padding: '3px' }}>
                  <input
                    type="checkbox"
                    checked={allergieCheckboxes[allergie] || false}
                    onChange={(e) => handleAllergieToggle(allergie, e.target.checked)}
                  />
                  {allergie.emoji} {allergie.nom_affichage}
                </label>
              )) */}
            </div>
          </div>

          {/* Boutons d'action */}
          <div style={{ display: 'flex', padding: '10px' }}>
            <button
              onClick={() => dietManager.afficherResumePreferences(window)}
              style={{
                flex: 1,
                padding: '5px',
                backgroundColor: '#4CAF50',
                color: 'white',
                margin: '5px'
              }}
            >
              📄 Voir résumé
            </button>

            <button
              onClick={() => dietManager.resetPreferences()}
              style={{
                flex: 1,
                padding: '5px',
                backgroundColor: '#f44336',
                color: 'white',
                margin: '5px'
              }}
            >
              🔄 Réinitialiser
            </button>
          </div>
        </div>
      );
    };

    return <RegimesTab />;
  }

  createRecettesTab(inventoryManager, eventHandlers, dietManager, recipeManager, window) {
    const RecettesTab = () => {
      const [nomRecette, setNomRecette] = useState('');

      return (
        <div style={{ display: 'flex', flexDirection: 'column', padding: '10px' }}>
          {/* Titre */}
          <div style={{
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            padding: '10px'
          }}>
            🍽️ SUGGESTIONS DE RECETTES
          </div>

          {/* Section recherche optimisée */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '10px',
            backgroundColor: '#e8f5e8'
          }}>
            <div style={{ fontWeight: 'bold', padding: '5px' }}>
              🎯 Recherche optimisée
            </div>

            <div style={{ padding: '5px', textAlign: 'center' }}>
              Trouve les meilleures recettes avec vos ingrédients disponibles.
              <br />
              Priorise les aliments qui expirent bientôt !
            </div>

            <button
              onClick={() => eventHandlers.rechercheRecettesOptimisee(
                null, inventoryManager, dietManager, recipeManager, window
              )}
              style={{
                padding: '10px',
                backgroundColor: '#4CAF50',
                color: 'white'
              }}
            >
              🚀 Recherche optimisée
            </button>
          </div>

          {/* Section recherche par nom */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '10px',
            backgroundColor: '#fff3e0'
          }}>
            <div style={{ fontWeight: 'bold', padding: '5px' }}>
              🔍 Recherche par nom
            </div>

            <input
              type="text"
              placeholder="🍝 Nom de la recette (ex: pasta, pizza, soup...)"
              value={nomRecette}
              onChange={(e) => setNomRecette(e.target.value)}
              style={{ padding: '5px' }}
            />

            <button
              onClick={() => eventHandlers.rechercheRecettesParNom(
                null, { value: nomRecette }, dietManager, recipeManager, window
              )}
              style={{
                padding: '5px',
                backgroundColor: '#FF9800',
                color: 'white'
              }}
            >
              🔍 Rechercher
            </button>
          </div>

          {/* Section statistiques */}
          <div style={{ display: 'flex', padding: '10px' }}>
            <button
              onClick={() => inventoryManager.afficherAlimentsPrioritaires(null, window)}
              style={{
                flex: 1,
                padding: '5px',
                backgroundColor: '#f44336',
                color: 'white',
                margin: '5px'
              }}
            >
              ⏰ Aliments à utiliser
            </button>

            <button
              onClick={() => inventoryManager.suggestionsAchats(null, dietManager, window)}
              style={{
                flex: 1,
                padding: '5px',
                backgroundColor: '#2196F3',
                color: 'white',
                margin: '5px'
              }}
            >
              💡 Suggestions d'achats
            </button>
          </div>
        </div>
      );
    };

    return <RecettesTab />;
  }

  // Méthodes de navigation
  showInventaireTab(contentContainer) {
    this.current_tab = "inventaire";
    // Dans React, vous utiliseriez plutôt un state pour gérer l'onglet actif
    // contentContainer.content = this.inventaire_box;
  }

  showRegimesTab(contentContainer) {
    this.current_tab = "regimes";
    // contentContainer.content = this.regimes_box;
  }

  showRecettesTab(contentContainer) {
    this.current_tab = "recettes";
    // contentContainer.content = this.recettes_box;
  }

  // Styles de cartes modernes avec ombres
  createModernCardStyle(palette) {
    return {
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      backgroundColor: palette.MODERN_COLORS.bg_card,
      margin: '10px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    };
  }

  // Boutons avec effet glassmorphism
  createGlassButtonStyle(palette, colorKey = 'success') {
    return {
      padding: '15px',
      backgroundColor: palette.MODERN_COLORS[colorKey],
      color: palette.MODERN_COLORS.text_white,
      margin: '5px',
      textAlign: 'center',
      fontWeight: 'bold',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    };
  }

  // Navigation moderne avec indicateurs visuels
  createModernNavStyle(palette, isActive = false) {
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
        borderRadius: '4px',
        cursor: 'pointer'
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
        borderRadius: '4px',
        cursor: 'pointer'
      };
    }
  }

  // Inputs modernes avec meilleur spacing
  createModernInputStyle(palette) {
    return {
      padding: '12px',
      margin: '5px',
      backgroundColor: palette.MODERN_COLORS.bg_card,
      fontSize: '14px',
      border: '1px solid #ddd',
      borderRadius: '4px'
    };
  }
}

// Composant React principal utilisant TabManager
const TabManagerComponent = ({ appInstance, ...props }) => {
  const [activeTab, setActiveTab] = useState('inventaire');
  const tabManager = new TabManager(appInstance);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'inventaire':
        return tabManager.createInventaireTab(
          props.widgetManager, props.inventory, props.eventHandlers,
          props.dietManager, props.lastCacheTime, props.statsCache, 
          props.window, props.palette
        );
      case 'regimes':
        return tabManager.createRegimesTab(
          props.dietManager, props.eventHandlers, props.window
        );
      case 'recettes':
        return tabManager.createRecettesTab(
          props.inventoryManager, props.eventHandlers, props.dietManager,
          props.recipeManager, props.window
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Navigation tabs */}
      <div style={{ display: 'flex', padding: '10px' }}>
        <button
          onClick={() => setActiveTab('inventaire')}
          style={tabManager.createModernNavStyle(props.palette, activeTab === 'inventaire')}
        >
          📦 Inventaire
        </button>
        <button
          onClick={() => setActiveTab('regimes')}
          style={tabManager.createModernNavStyle(props.palette, activeTab === 'regimes')}
        >
          🥗 Régimes
        </button>
        <button
          onClick={() => setActiveTab('recettes')}
          style={tabManager.createModernNavStyle(props.palette, activeTab === 'recettes')}
        >
          🍽️ Recettes
        </button>
      </div>

      {/* Content container */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {renderActiveTab()}
      </div>
    </div>
  );
};

export default TabManagerComponent;