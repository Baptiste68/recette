// managers/RecipeDisplayManager.js
import { useState, useEffect } from 'react';
import { palette } from '../constants/colors';
import { styles } from '../styles/AppStyles';

class RecipeDisplayManager {
  constructor() {
    this.currentPage = 0;
    this.recipesPerPage = 1;
    this.currentRecipes = [];
    this.inventaire = {};
    this.recipeManager = null;
  }

  // Méthodes utilitaires
  calculateTotalPages() {
    return Math.ceil(this.currentRecipes.length / this.recipesPerPage);
  }

  calculateStats() {
    const perfectMatches = this.currentRecipes.filter(r => (r.missedIngredientCount || 0) === 0).length;
    const goodMatches = this.currentRecipes.filter(r => {
      const missed = r.missedIngredientCount || 0;
      return missed > 0 && missed <= 2;
    }).length;
    const partialMatches = this.currentRecipes.length - perfectMatches - goodMatches;

    return { perfectMatches, goodMatches, partialMatches };
  }

  getCurrentPageRecipes() {
    if (this.currentPage === 0) return [];
    
    const startIdx = (this.currentPage - 1) * this.recipesPerPage;
    const endIdx = Math.min(startIdx + this.recipesPerPage, this.currentRecipes.length);
    
    return {
      recipes: this.currentRecipes.slice(startIdx, endIdx),
      startIdx,
      endIdx
    };
  }

  getPageTitles(pageNum) {
    const startIdx = (pageNum - 1) * this.recipesPerPage;
    const endIdx = Math.min(startIdx + this.recipesPerPage, this.currentRecipes.length);
    const pageRecipes = this.currentRecipes.slice(startIdx, endIdx);
    
    return pageRecipes.map(r => 
      r.title.length > 30 ? r.title.substring(0, 30) + "..." : r.title
    );
  }

  async openRecipeUrl(url) {
    try {
      window.open(url, '_blank');
    } catch (error) {
      console.error('Impossible d\'ouvrir le lien:', error);
      alert(`Impossible d'ouvrir le lien: ${error.message}`);
    }
  }

  async showRecipeDetails(recipe) {
    if (!this.recipeManager) {
      alert("Gestionnaire de recettes non disponible");
      return null;
    }

    try {
      const recipeId = recipe.id;
      if (!recipeId) {
        alert("ID de recette manquant");
        return null;
      }

      const result = await this.recipeManager.obtenirDetailsRecette(recipeId);
      
      if (result.success && result.details) {
        return result.details;
      } else {
        alert(`Impossible de récupérer les détails: ${result.message}`);
        return null;
      }
    } catch (error) {
      alert(`Erreur lors de la récupération des détails: ${error.message}`);
      return null;
    }
  }

  cleanInstructions(instructions) {
    if (!instructions) return '';
    
    return instructions
      .replace(/<li>/g, '• ')
      .replace(/<\/li>/g, '\n')
      .replace(/<ol>|<\/ol>|<ul>|<\/ul>/g, '')
      .replace(/<[^>]*>/g, '') // Supprime tous les tags HTML restants
      .trim();
  }

  checkIngredientAvailability(ingredientText) {
    return Object.keys(this.inventaire).some(ingName => 
      ingName.toLowerCase().includes(ingredientText.toLowerCase()) ||
      ingredientText.toLowerCase().includes(ingName.toLowerCase())
    );
  }
}

// Composant React pour l'affichage des recettes
export const RecipeDisplayComponent = ({ 
  recipes, 
  inventaire, 
  recipeManager, 
  onClose 
}) => {
  const [displayManager] = useState(() => {
    const manager = new RecipeDisplayManager();
    manager.currentRecipes = recipes;
    manager.inventaire = inventaire;
    manager.recipeManager = recipeManager;
    return manager;
  });

  const [currentPage, setCurrentPage] = useState(0);
  const [recipeDetails, setRecipeDetails] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mise à jour du gestionnaire quand les props changent
  useEffect(() => {
    displayManager.currentRecipes = recipes;
    displayManager.inventaire = inventaire;
    displayManager.recipeManager = recipeManager;
    displayManager.currentPage = currentPage;
  }, [recipes, inventaire, recipeManager, currentPage]);

  const totalPages = displayManager.calculateTotalPages();
  const stats = displayManager.calculateStats();

  const goToPage = (pageNum) => {
    setCurrentPage(pageNum);
    displayManager.currentPage = pageNum;
  };

  const handleShowDetails = async (recipe) => {
    setLoading(true);
    const details = await displayManager.showRecipeDetails(recipe);
    if (details) {
      setRecipeDetails(details);
      setShowDetailsModal(true);
    }
    setLoading(false);
  };

  // Rendu de la page d'accueil avec statistiques
  const renderOverviewPage = () => (
    <div>
      <div style={styles.recipeOverviewCard}>
        <h2 style={{ color: palette.textPrimary, marginBottom: '20px' }}>
          📋 Résumé des Recettes
        </h2>
        
        <div style={styles.recipeStatsRow}>
          <div style={{ ...styles.recipeStatItem, color: palette.success }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>⭐ {stats.perfectMatches}</div>
            <div>Matchs parfaits</div>
          </div>
          <div style={{ ...styles.recipeStatItem, color: palette.warning }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>🔥 {stats.goodMatches}</div>
            <div>Bons matchs</div>
          </div>
          <div style={{ ...styles.recipeStatItem, color: palette.info }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>👍 {stats.partialMatches}</div>
            <div>Matchs partiels</div>
          </div>
        </div>

        <h3 style={{ color: palette.textPrimary, margin: '20px 0' }}>
          📄 Pages de Recettes
        </h3>
        
        <div>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
            const titles = displayManager.getPageTitles(pageNum);
            return (
              <button
                key={pageNum}
                style={styles.recipePageButton}
                onClick={() => goToPage(pageNum)}
                onMouseEnter={(e) => e.target.style.backgroundColor = palette.primary}
                onMouseLeave={(e) => e.target.style.backgroundColor = palette.accent}
              >
                📖 Page {pageNum} • {titles.join(', ')}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Rendu d'une page de recettes
  const renderRecipePage = () => {
    const { recipes, startIdx, endIdx } = displayManager.getCurrentPageRecipes();

    return (
      <div>
        <h2 style={{ 
          textAlign: 'center', 
          color: palette.textPrimary, 
          marginBottom: '20px' 
        }}>
          📖 Page {currentPage} • Recettes {startIdx + 1} à {endIdx}
        </h2>
        
        {recipes.map((recette, index) => {
          const globalIndex = startIdx + index + 1;
          const ingredientsManques = recette.missedIngredientCount || 0;
          const ingredientsUtilises = recette.usedIngredientCount || 0;
          
          let icone = "👍";
          let score = "BON MATCH";
          let scoreColor = palette.info;
          
          if (ingredientsManques === 0) {
            icone = "⭐";
            score = "PARFAIT MATCH !";
            scoreColor = palette.success;
          } else if (ingredientsManques <= 2) {
            icone = "🔥";
            score = "TRÈS BON MATCH";
            scoreColor = palette.warning;
          }

          return (
            <div key={recette.id || index} style={styles.recipeCard}>
              <div style={styles.recipeCardHeader}>
                <h3 style={styles.recipeTitle}>
                  {globalIndex}. {icone} {recette.title}
                </h3>
                <span style={{ ...styles.recipeScore, color: scoreColor }}>
                  {score}
                </span>
              </div>

              <div style={styles.recipeInfo}>
                <div style={styles.recipeInfoText}>
                  ✅ Utilise {ingredientsUtilises} de vos ingrédients
                </div>
                {ingredientsManques > 0 && (
                  <div style={styles.recipeInfoText}>
                    ❌ Manque {ingredientsManques} ingrédient(s)
                  </div>
                )}
              </div>

              {recette.usedIngredients && recette.usedIngredients.length > 0 && (
                <div style={styles.recipeIngredientsList}>
                  🥘 Vos ingrédients: {recette.usedIngredients.slice(0, 3).map(ing => ing.name).join(', ')}
                  {recette.usedIngredients.length > 3 && ` (+ ${recette.usedIngredients.length - 3} autres)`}
                </div>
              )}

              <div style={styles.recipeActionButtons}>
                <button
                  style={styles.recipeDetailButton}
                  onClick={() => handleShowDetails(recette)}
                  disabled={loading}
                >
                  {loading ? "🔄 Chargement..." : "📋 Voir détails"}
                </button>
                
                {(recette.sourceUrl || recette.spoonacularSourceUrl) && (
                  <button
                    style={styles.recipeUrlButton}
                    onClick={() => displayManager.openRecipeUrl(
                      recette.sourceUrl || recette.spoonacularSourceUrl
                    )}
                  >
                    🌐 Recette complète
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Rendu de la navigation
  const renderNavigation = () => (
    <div style={styles.recipeNavigation}>
      <button
        style={{
          ...styles.recipeNavButton,
          ...(currentPage === 0 ? styles.recipeActiveNavButton : {})
        }}
        onClick={() => goToPage(0)}
      >
        🏠 Accueil
      </button>

      {currentPage > 0 && (
        <button
          style={styles.recipeNavButton}
          onClick={() => goToPage(currentPage - 1)}
        >
          ⬅️ Précédent
        </button>
      )}

      <span style={styles.recipePageInfo}>
        Page {currentPage} sur {totalPages}
      </span>

      {currentPage < totalPages && (
        <button
          style={styles.recipeNavButton}
          onClick={() => goToPage(currentPage + 1)}
        >
           ➡️ Suivant
        </button>
      )}
    </div>
  );

  // Rendu du modal de détails
  const renderDetailsModal = () => {
    if (!showDetailsModal || !recipeDetails) return null;

    return (
      <div style={styles.recipeModalOverlay} onClick={() => setShowDetailsModal(false)}>
        <div style={styles.recipeDetailsModal} onClick={(e) => e.stopPropagation()}>
          <button
            style={styles.recipeCloseButton}
            onClick={() => setShowDetailsModal(false)}
          >
            ✕
          </button>
          
          <div style={styles.recipeDetailsContent}>
            <h2 style={styles.recipeDetailsTitle}>
              {recipeDetails.title || 'Recette'}
            </h2>

            {(recipeDetails.readyInMinutes || recipeDetails.servings) && (
              <div style={styles.recipeDetailsInfo}>
                {recipeDetails.readyInMinutes && (
                  <div style={styles.recipeDetailsInfoItem}>
                    ⏱️ {recipeDetails.readyInMinutes} minutes
                  </div>
                )}
                {recipeDetails.servings && (
                  <div style={styles.recipeDetailsInfoItem}>
                    👥 {recipeDetails.servings} portions
                  </div>
                )}
              </div>
            )}

            {recipeDetails.extendedIngredients && (
              <div>
                <h3 style={styles.recipeSectionTitle}>🥘 Ingrédients</h3>
                {recipeDetails.extendedIngredients.map((ingredient, index) => {
                  const ingredientText = ingredient.original || ingredient.name || '';
                  const hasIngredient = displayManager.checkIngredientAvailability(ingredientText);
                  const icon = hasIngredient ? "✅" : "🔸";
                  const color = hasIngredient ? palette.success : palette.textSecondary;
                  
                  return (
                    <div key={index} style={{ ...styles.recipeIngredientItem, color }}>
                      {icon} {ingredientText}
                    </div>
                  );
                })}
              </div>
            )}

            {recipeDetails.instructions && (
              <div style={{ marginTop: '20px' }}>
                <h3 style={styles.recipeSectionTitle}>📝 Instructions</h3>
                <div style={styles.recipeInstructionsText}>
                  {displayManager.cleanInstructions(recipeDetails.instructions)}
                </div>
              </div>
            )}

            <div style={styles.recipeActionButtons}>
              <button
                style={styles.recipeDetailButton}
                onClick={() => setShowDetailsModal(false)}
              >
                ✖️ Fermer
              </button>
              
              {recipeDetails.sourceUrl && (
                <button
                  style={styles.recipeUrlButton}
                  onClick={() => displayManager.openRecipeUrl(recipeDetails.sourceUrl)}
                >
                  🌐 Site original
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.recipeModalOverlay} onClick={onClose}>
      <div style={styles.recipeModalContent} onClick={(e) => e.stopPropagation()}>
        <button style={styles.recipeCloseButton} onClick={onClose}>✕</button>
        
        <div style={styles.recipeHeader}>
          <h1 style={styles.recipeHeaderTitle}>🍽️ Recettes Suggérées</h1>
          <p style={styles.recipeHeaderSubtitle}>
            📊 {recipes.length} recettes trouvées • Optimisées pour votre inventaire
          </p>
        </div>

        <div style={styles.recipeContent}>
          {currentPage === 0 ? renderOverviewPage() : renderRecipePage()}
        </div>

        {renderNavigation()}
        {renderDetailsModal()}
      </div>
    </div>
  );
};

export default RecipeDisplayManager;
