// managers/RecipeDisplayManager.js - Version avec images améliorées
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

  getPageRecipes(pageNum) {
    const startIdx = (pageNum - 1) * this.recipesPerPage;
    const endIdx = Math.min(startIdx + this.recipesPerPage, this.currentRecipes.length);
    return this.currentRecipes.slice(startIdx, endIdx);
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

  // Rendu de la page d'accueil avec statistiques et images
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
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px',
          marginTop: '20px'
        }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
            const titles = displayManager.getPageTitles(pageNum);
            const pageRecipes = displayManager.getPageRecipes(pageNum);

            return (
              <div
                key={pageNum}
                style={{
                  backgroundColor: palette.bgCard,
                  borderRadius: '16px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: `2px solid ${palette.borders.light}`,
                  boxShadow: palette.shadows.sm,
                }}
                onClick={() => goToPage(pageNum)}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-4px)';
                  e.target.style.boxShadow = palette.shadows.card;
                  e.target.style.borderColor = palette.primary;
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = palette.shadows.sm;
                  e.target.style.borderColor = palette.borders.light;
                }}
              >
                {/* Images des recettes en preview */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '12px',
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  {pageRecipes.slice(0, 3).map((recipe, idx) => (
                    recipe.image ? (
                      <img 
                        key={idx}
                        src={recipe.image} 
                        alt={recipe.title}
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '10px',
                          objectFit: 'cover',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          border: `2px solid ${palette.borders.light}`
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div 
                        key={idx}
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '10px',
                          backgroundColor: palette.bgSecondary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                          border: `2px solid ${palette.borders.light}`
                        }}
                      >
                        🍽️
                      </div>
                    )
                  ))}
                  {pageRecipes.length > 3 && (
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '10px',
                      backgroundColor: palette.primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      color: 'white',
                      fontWeight: 'bold'
                    }}>
                      +{pageRecipes.length - 3}
                    </div>
                  )}
                </div>

                {/* Informations de la page */}
                <div style={{
                  textAlign: 'center',
                  color: palette.textPrimary,
                  fontWeight: '600',
                  fontSize: '16px',
                  marginBottom: '8px'
                }}>
                  📖 Page {pageNum}
                </div>
                
                <div style={{
                  fontSize: '13px',
                  color: palette.textSecondary,
                  textAlign: 'center',
                  lineHeight: '1.4'
                }}>
                  {titles.join(' • ')}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Rendu d'une page de recettes avec images
  // Dans managers/RecipeDisplayManager.js - Améliorer l'affichage des recettes

  // Remplacer la partie rendu des recettes pour afficher les scores d'optimisation
  const renderRecipePage = () => {
    const { recipes, startIdx, endIdx } = displayManager.getCurrentPageRecipes();

    return (
      <div>
        <h2 style={{ 
          textAlign: 'center', 
          color: palette.textPrimary, 
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px'
        }}>
          📖 Page {currentPage} • Recettes {startIdx + 1} à {endIdx}
          {/* Indicateur de recettes optimisées */}
          {recipes.some(r => (r.utilisationScore || 0) >= 2) && (
            <span style={{
              fontSize: '12px',
              backgroundColor: palette.success,
              color: palette.textWhite,
              padding: '4px 10px',
              borderRadius: '12px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              🎯 Optimisées
            </span>
          )}
        </h2>
        
        {recipes.map((recette, index) => {
          const globalIndex = startIdx + index + 1;
          const utilisationScore = recette.utilisationScore || recette.usedIngredientCount || 0;
          const ingredientsManques = recette.missedIngredientCount || 0;
          const scoreTotal = recette.scoreTotal || 0;
          const ratioUtilisation = recette.ratioUtilisation || 0;
          
          // Déterminer le niveau d'optimisation
          let niveau = "BON";
          let couleurNiveau = palette.info;
          let iconeNiveau = "👍";
          
          if (utilisationScore >= 4) {
            niveau = "EXCELLENT";
            couleurNiveau = palette.success;
            iconeNiveau = "🌟";
          } else if (utilisationScore >= 3) {
            niveau = "TRÈS BON";
            couleurNiveau = palette.warning;
            iconeNiveau = "🔥";
          } else if (utilisationScore >= 2) {
            niveau = "BON";
            couleurNiveau = palette.info;
            iconeNiveau = "⭐";
          } else if (ingredientsManques === 0) {
            niveau = "PARFAIT";
            couleurNiveau = palette.success;
            iconeNiveau = "✨";
          }

          return (
            <div key={recette.id || index} style={{...styles.recipeCard, position: 'relative'}}>
              {/* Badge de niveau d'optimisation */}
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                backgroundColor: couleurNiveau,
                color: palette.textWhite,
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                zIndex: 10
              }}>
                {iconeNiveau} {niveau}
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '16px',
              }}>
                {/* Image de la recette */}
                {recette.image ? (
                  <img 
                    src={recette.image} 
                    alt={recette.title}
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '12px',
                      objectFit: 'cover',
                      marginRight: '16px',
                      boxShadow: palette.shadows.sm,
                      flexShrink: 0,
                      border: `2px solid ${couleurNiveau}` // Bordure colorée selon l'optimisation
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '12px',
                    backgroundColor: palette.bgSecondary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '16px',
                    fontSize: '32px',
                    flexShrink: 0,
                    border: `2px solid ${couleurNiveau}`
                  }}>
                    🍽️
                  </div>
                )}

                {/* Contenu de la recette */}
                <div style={{ flex: 1, paddingRight: '100px' }}>
                  <h3 style={{
                    ...styles.recipeTitle,
                    margin: '0 0 12px 0',
                    fontSize: '18px',
                    lineHeight: '1.3'
                  }}>
                    {globalIndex}. {iconeNiveau} {recette.title}
                  </h3>

                  {/* Métriques d'optimisation */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginBottom: '12px'
                  }}>
                    <span style={{
                      backgroundColor: palette.success,
                      color: palette.textWhite,
                      padding: '3px 8px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      ✅ {utilisationScore} utilisé{utilisationScore > 1 ? 's' : ''}
                    </span>
                    
                    {ingredientsManques > 0 && (
                      <span style={{
                        backgroundColor: palette.warning,
                        color: palette.textWhite,
                        padding: '3px 8px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        ❌ {ingredientsManques} manquant{ingredientsManques > 1 ? 's' : ''}
                      </span>
                    )}
                    
                    {ratioUtilisation > 0 && (
                      <span style={{
                        backgroundColor: palette.info,
                        color: palette.textWhite,
                        padding: '3px 8px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        📊 {Math.round(ratioUtilisation * 100)}% inventaire
                      </span>
                    )}
                    
                    {scoreTotal > 0 && (
                      <span style={{
                        backgroundColor: palette.primary,
                        color: palette.textWhite,
                        padding: '3px 8px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        🎯 Score: {scoreTotal}
                      </span>
                    )}
                  </div>

                  {/* Informations d'urgence */}
                  {recette.urgenceScore > 0 && (
                    <div style={{
                      backgroundColor: '#ff4444',
                      color: 'white',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      ⏰ Utilise des aliments qui expirent bientôt !
                    </div>
                  )}
                </div>
              </div>

              {/* Liste des ingrédients utilisés avec style amélioré */}
              {recette.usedIngredients && recette.usedIngredients.length > 0 && (
                <div style={{
                  ...styles.recipeIngredientsList,
                  background: `linear-gradient(135deg, ${palette.bgSecondary}, ${palette.bgCard})`,
                  border: `1px solid ${couleurNiveau}`,
                  borderRadius: '12px',
                  padding: '12px 16px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '6px'
                  }}>
                    <span style={{ fontWeight: '600', color: palette.textPrimary }}>
                      🥘 Vos ingrédients utilisés:
                    </span>
                  </div>
                  <div style={{ color: palette.textSecondary, fontSize: '13px' }}>
                    {recette.usedIngredients.map(ing => ing.name).join(', ')}
                    {recette.usedIngredients.length > 3 && ` (+ ${recette.usedIngredients.length - 3} autres)`}
                  </div>
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

  // Rendu du modal de détails avec image
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
            {/* Image en en-tête du modal */}
            {recipeDetails.image && (
              <div style={{
                textAlign: 'center',
                marginBottom: '20px'
              }}>
                <img 
                  src={recipeDetails.image} 
                  alt={recipeDetails.title}
                  style={{
                    maxWidth: '100%',
                    height: '200px',
                    borderRadius: '16px',
                    objectFit: 'cover',
                    boxShadow: palette.shadows.card
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

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