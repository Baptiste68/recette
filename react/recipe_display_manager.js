import React, { useState, useCallback } from 'react';

class RecipeDisplayManager {
    constructor(palette) {
        this.palette = palette;
        this.currentPage = 0;
        this.recipesPerPage = 1;
        this.currentRecipes = [];
        this.inventaire = {};
        this.recipeWindow = null;
        this.recipeManager = null;
    }

    showRecipesPaginated(recettes, inventaire, window, recipeManager = null) {
        this.currentRecipes = recettes;
        this.inventaire = inventaire;
        this.recipeManager = recipeManager;
        this.currentPage = 0;

        // Retourne le composant React au lieu de créer une fenêtre
        return <RecipeWindow 
            manager={this}
            recipes={recettes}
            inventaire={inventaire}
            recipeManager={recipeManager}
        />;
    }

    createHeader() {
        return {
            title: "🍽️ Recettes Suggérées",
            subtitle: `📊 ${this.currentRecipes.length} recettes trouvées • Optimisées pour votre inventaire`
        };
    }

    updateContent(currentPage) {
        this.currentPage = currentPage;
        const totalPages = Math.ceil(this.currentRecipes.length / this.recipesPerPage);

        if (this.currentPage === 0) {
            return this.showOverviewPage(totalPages);
        } else {
            return this.showRecipePage();
        }
    }

    showOverviewPage(totalPages) {
        // Répartition par match
        const perfectMatches = this.currentRecipes.filter(r => (r.missedIngredientCount || 0) === 0).length;
        const goodMatches = this.currentRecipes.filter(r => {
            const missed = r.missedIngredientCount || 0;
            return missed > 0 && missed <= 2;
        }).length;
        const partialMatches = this.currentRecipes.length - perfectMatches - goodMatches;

        const stats = {
            perfect: perfectMatches,
            good: goodMatches,
            partial: partialMatches
        };

        // Pages de recettes
        const pages = [];
        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
            const startIdx = (pageNum - 1) * this.recipesPerPage;
            const endIdx = Math.min(startIdx + this.recipesPerPage, this.currentRecipes.length);
            const pageRecipes = this.currentRecipes.slice(startIdx, endIdx);
            const pageTitles = pageRecipes.map(r => 
                r.title.length > 30 ? r.title.substring(0, 30) + "..." : r.title
            );

            pages.push({
                pageNum,
                titles: pageTitles.join(', ')
            });
        }

        return {
            type: 'overview',
            stats,
            pages,
            totalPages
        };
    }

    showRecipePage() {
        const startIdx = (this.currentPage - 1) * this.recipesPerPage;
        const endIdx = Math.min(startIdx + this.recipesPerPage, this.currentRecipes.length);
        const pageRecipes = this.currentRecipes.slice(startIdx, endIdx);

        return {
            type: 'recipes',
            pageNumber: this.currentPage,
            startIdx: startIdx + 1,
            endIdx,
            recipes: pageRecipes.map((recette, i) => this.createRecipeCard(recette, startIdx + i + 1))
        };
    }

    createRecipeCard(recette, index) {
        console.log(recette);
        console.log(recette.image);

        const ingredientsManques = recette.missedIngredientCount || 0;
        const ingredientsUtilises = recette.usedIngredientCount || 0;

        // Icône et score
        let icone, score, scoreColor;
        if (ingredientsManques === 0) {
            icone = "⭐";
            score = "PARFAIT MATCH !";
            scoreColor = this.palette.MODERN_COLORS.success;
        } else if (ingredientsManques <= 2) {
            icone = "🔥";
            score = "TRÈS BON MATCH";
            scoreColor = this.palette.MODERN_COLORS.warning;
        } else {
            icone = "👍";
            score = "BON MATCH";
            scoreColor = this.palette.MODERN_COLORS.info;
        }

        // Ingrédients utilisés détails
        const ingredientsUtilisesDetails = recette.usedIngredients || [];
        let ingredientsText = '';
        if (ingredientsUtilisesDetails.length > 0) {
            const nomsUtilises = ingredientsUtilisesDetails.slice(0, 3).map(ing => ing.name);
            ingredientsText = nomsUtilises.join(', ');
            if (ingredientsUtilisesDetails.length > 3) {
                ingredientsText += ` (+ ${ingredientsUtilisesDetails.length - 3} autres)`;
            }
        }

        return {
            id: recette.id,
            index,
            title: recette.title,
            icone,
            score,
            scoreColor,
            ingredientsManques,
            ingredientsUtilises,
            ingredientsText,
            image: recette.image,
            sourceUrl: recette.sourceUrl || recette.spoonacularSourceUrl,
            recette
        };
    }

    createNavigation(totalPages, currentPage) {
        return {
            currentPage,
            totalPages,
            showPrev: currentPage > 0,
            showNext: currentPage < totalPages
        };
    }

    goToPage(pageNum, setCurrentPage) {
        setCurrentPage(pageNum);
    }

    openRecipeUrl(url) {
        try {
            window.open(url, '_blank');
        } catch (e) {
            alert(`Impossible d'ouvrir le lien: ${e.message}`);
        }
    }

    showRecipeDetails(recipe) {
        if (!this.recipeManager) {
            alert("Gestionnaire de recettes non disponible");
            return;
        }

        try {
            const recipeId = recipe.id;
            if (!recipeId) {
                alert("ID de recette manquant");
                return;
            }

            // Appeler l'API pour obtenir les détails
            this.recipeManager.obtenirDetailsRecette(recipeId)
                .then(({ success, message, details }) => {
                    if (success && details) {
                        this.showRecipeDetailsWindow(details);
                    } else {
                        alert(`Impossible de récupérer les détails: ${message}`);
                    }
                })
                .catch(e => {
                    alert(`Erreur lors de la récupération des détails: ${e.message}`);
                });

        } catch (e) {
            alert(`Erreur lors de la récupération des détails: ${e.message}`);
        }
    }

    showRecipeDetailsWindow(recipeDetails) {
        // Retourne les données pour affichage dans un modal React
        const ingredients = (recipeDetails.extendedIngredients || []).map(ingredient => {
            const ingredientText = ingredient.original || ingredient.name || '';
            const hasIngredient = Object.keys(this.inventaire).some(
                ingName => ingredientText.toLowerCase().includes(ingName.toLowerCase())
            );

            return {
                text: ingredientText,
                hasIngredient,
                icon: hasIngredient ? "✅" : "🔸"
            };
        });

        // Nettoyer les instructions HTML
        let instructionsText = recipeDetails.instructions || '';
        instructionsText = instructionsText.replace(/<li>/g, '• ')
                                         .replace(/<\/li>/g, '\n')
                                         .replace(/<ol>/g, '')
                                         .replace(/<\/ol>/g, '')
                                         .replace(/<ul>/g, '')
                                         .replace(/<\/ul>/g, '');

        return {
            title: recipeDetails.title || 'Recette',
            readyInMinutes: recipeDetails.readyInMinutes,
            servings: recipeDetails.servings,
            ingredients,
            instructions: instructionsText,
            sourceUrl: recipeDetails.sourceUrl
        };
    }

    async simpleImageFromUrl(url, width = 150, height = 150) {
        console.log("fonction");
        console.log(url);
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const blob = await response.blob();
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error('Error loading image:', error);
            return null;
        }
    }
}

// Composant React principal
const RecipeWindow = ({ manager, recipes, inventaire, recipeManager }) => {
    const [currentPage, setCurrentPage] = useState(0);
    
    const header = manager.createHeader();
    const content = manager.updateContent(currentPage);
    const totalPages = Math.ceil(recipes.length / manager.recipesPerPage);
    const navigation = manager.createNavigation(totalPages, currentPage);

    const handleGoToPage = useCallback((pageNum) => {
        manager.goToPage(pageNum, setCurrentPage);
    }, [manager]);

    const handleShowDetails = useCallback((recipe) => {
        manager.showRecipeDetails(recipe);
    }, [manager]);

    const handleOpenUrl = useCallback((url) => {
        manager.openRecipeUrl(url);
    }, [manager]);

    return (
        <div style={{ 
            backgroundColor: manager.palette.MODERN_COLORS.bg_primary,
            minHeight: '100vh'
        }}>
            {/* Header */}
            <div style={{
                padding: '25px',
                backgroundColor: manager.palette.MODERN_COLORS.primary,
                textAlign: 'center'
            }}>
                <h1 style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: manager.palette.MODERN_COLORS.text_white,
                    margin: '5px 0'
                }}>
                    {header.title}
                </h1>
                <p style={{
                    fontSize: '14px',
                    color: manager.palette.MODERN_COLORS.text_white,
                    margin: '5px 0'
                }}>
                    {header.subtitle}
                </p>
            </div>

            {/* Content */}
            <div style={{ padding: '20px' }}>
                {content.type === 'overview' ? (
                    <OverviewPage 
                        content={content} 
                        onGoToPage={handleGoToPage}
                        palette={manager.palette}
                    />
                ) : (
                    <RecipePage 
                        content={content}
                        onShowDetails={handleShowDetails}
                        onOpenUrl={handleOpenUrl}
                        palette={manager.palette}
                    />
                )}
            </div>

            {/* Navigation */}
            <Navigation 
                navigation={navigation}
                onGoToPage={handleGoToPage}
                palette={manager.palette}
            />
        </div>
    );
};

// Composant pour la page d'aperçu
const OverviewPage = ({ content, onGoToPage, palette }) => (
    <div style={{
        padding: '20px',
        backgroundColor: palette.MODERN_COLORS.bg_secondary
    }}>
        <h2 style={{
            textAlign: 'center',
            fontSize: '20px',
            fontWeight: 'bold',
            color: palette.MODERN_COLORS.text_primary,
            margin: '10px 0'
        }}>
            📋 Résumé des Recettes
        </h2>

        {/* Statistiques */}
        <div style={{ display: 'flex', padding: '10px' }}>
            <div style={{ flex: 1, textAlign: 'center', padding: '5px' }}>
                <span style={{
                    fontSize: '14px',
                    color: palette.MODERN_COLORS.success
                }}>
                    ⭐ {content.stats.perfect}<br/>Matchs parfaits
                </span>
            </div>
            <div style={{ flex: 1, textAlign: 'center', padding: '5px' }}>
                <span style={{
                    fontSize: '14px',
                    color: palette.MODERN_COLORS.warning
                }}>
                    🔥 {content.stats.good}<br/>Bons matchs
                </span>
            </div>
            <div style={{ flex: 1, textAlign: 'center', padding: '5px' }}>
                <span style={{
                    fontSize: '14px',
                    color: palette.MODERN_COLORS.info
                }}>
                    👍 {content.stats.partial}<br/>Matchs partiels
                </span>
            </div>
        </div>

        {/* Pages */}
        <h3 style={{
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            color: palette.MODERN_COLORS.text_primary,
            margin: '15px 0'
        }}>
            📄 Pages de Recettes
        </h3>

        <div style={{ padding: '10px' }}>
            {content.pages.map(page => (
                <button
                    key={page.pageNum}
                    onClick={() => onGoToPage(page.pageNum)}
                    style={{
                        display: 'block',
                        width: '100%',
                        padding: '8px',
                        margin: '5px 0',
                        backgroundColor: palette.MODERN_COLORS.accent,
                        color: palette.MODERN_COLORS.text_white,
                        border: 'none',
                        fontSize: '12px',
                        textAlign: 'center',
                        cursor: 'pointer'
                    }}
                >
                    📖 Page {page.pageNum} • {page.titles}
                </button>
            ))}
        </div>
    </div>
);

// Composant pour la page de recettes
const RecipePage = ({ content, onShowDetails, onOpenUrl, palette }) => (
    <div>
        <h2 style={{
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            color: palette.MODERN_COLORS.text_primary,
            margin: '15px 0'
        }}>
            📖 Page {content.pageNumber} • Recettes {content.startIdx} à {content.endIdx}
        </h2>

        {content.recipes.map(recipe => (
            <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onShowDetails={onShowDetails}
                onOpenUrl={onOpenUrl}
                palette={palette}
            />
        ))}
    </div>
);

// Composant pour une carte de recette
const RecipeCard = ({ recipe, onShowDetails, onOpenUrl, palette }) => {
    const [imageUrl, setImageUrl] = useState(null);

    React.useEffect(() => {
        if (recipe.image) {
            // Simuler le chargement d'image
            setImageUrl(recipe.image);
        }
    }, [recipe.image]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '15px',
            backgroundColor: palette.MODERN_COLORS.bg_secondary,
            margin: '10px 0'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', padding: '5px' }}>
                <h3 style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: palette.MODERN_COLORS.text_primary,
                    flex: 1,
                    margin: 0
                }}>
                    {recipe.index}. {recipe.icone} {recipe.title}
                </h3>
                <span style={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: recipe.scoreColor
                }}>
                    {recipe.score}
                </span>
            </div>

            {/* Main content */}
            <div style={{ display: 'flex', padding: '5px' }}>
                {/* Image */}
                <div style={{
                    width: '150px',
                    height: '150px',
                    padding: '10px',
                    backgroundColor: palette.MODERN_COLORS.bg_primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {imageUrl ? (
                        <img 
                            src={imageUrl} 
                            alt={recipe.title}
                            style={{ width: '130px', height: '130px', objectFit: 'cover' }}
                        />
                    ) : (
                        <span style={{
                            fontSize: '48px',
                            color: palette.MODERN_COLORS.text_secondary
                        }}>
                            🍽️
                        </span>
                    )}
                </div>

                {/* Text content */}
                <div style={{ flex: 1, padding: '10px' }}>
                    {/* Info */}
                    <div>
                        <p style={{
                            fontSize: '12px',
                            color: palette.MODERN_COLORS.success,
                            margin: '2px 0'
                        }}>
                            ✅ Utilise {recipe.ingredientsUtilises} de vos ingrédients
                        </p>
                        
                        {recipe.ingredientsManques > 0 && (
                            <p style={{
                                fontSize: '12px',
                                color: palette.MODERN_COLORS.danger,
                                margin: '2px 0'
                            }}>
                                ❌ Manque {recipe.ingredientsManques} ingrédient(s)
                            </p>
                        )}

                        {recipe.ingredientsText && (
                            <p style={{
                                fontSize: '11px',
                                color: palette.MODERN_COLORS.text_secondary,
                                margin: '2px 0'
                            }}>
                                🥘 Vos ingrédients: {recipe.ingredientsText}
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', padding: '10px 0' }}>
                        {recipe.sourceUrl && (
                            <button
                                onClick={() => onOpenUrl(recipe.sourceUrl)}
                                style={{
                                    padding: '5px',
                                    backgroundColor: palette.MODERN_COLORS.primary,
                                    color: palette.MODERN_COLORS.text_white,
                                    border: 'none',
                                    fontSize: '12px',
                                    flex: 1,
                                    margin: '0 2px',
                                    cursor: 'pointer'
                                }}
                            >
                                🌐 Recette complète
                            </button>
                        )}
                        
                        <button
                            onClick={() => onShowDetails(recipe.recette)}
                            style={{
                                padding: '5px',
                                backgroundColor: palette.MODERN_COLORS.accent,
                                color: palette.MODERN_COLORS.text_white,
                                border: 'none',
                                fontSize: '12px',
                                flex: 1,
                                margin: '0 2px',
                                cursor: 'pointer'
                            }}
                        >
                            📋 Voir détails
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Composant de navigation
const Navigation = ({ navigation, onGoToPage, palette }) => (
    <div style={{
        display: 'flex',
        padding: '20px',
        backgroundColor: palette.MODERN_COLORS.bg_secondary
    }}>
        <button
            onClick={() => onGoToPage(0)}
            style={{
                padding: '10px',
                backgroundColor: navigation.currentPage === 0 ? 
                    palette.MODERN_COLORS.primary : 
                    palette.MODERN_COLORS.accent,
                color: palette.MODERN_COLORS.text_white,
                border: 'none',
                margin: '0 5px',
                cursor: 'pointer'
            }}
        >
            🏠 Accueil
        </button>

        {navigation.showPrev && (
            <button
                onClick={() => onGoToPage(navigation.currentPage - 1)}
                style={{
                    padding: '10px',
                    backgroundColor: palette.MODERN_COLORS.accent,
                    color: palette.MODERN_COLORS.text_white,
                    border: 'none',
                    margin: '0 5px',
                    cursor: 'pointer'
                }}
            >
                ⬅️ Précédent
            </button>
        )}

        <div style={{
            flex: 1,
            textAlign: 'center',
            fontSize: '14px',
            color: palette.MODERN_COLORS.text_primary,
            padding: '10px'
        }}>
            Page {navigation.currentPage} sur {navigation.totalPages}
        </div>

        {navigation.showNext && (
            <button
                onClick={() => onGoToPage(navigation.currentPage + 1)}
                style={{
                    padding: '10px',
                    backgroundColor: palette.MODERN_COLORS.accent,
                    color: palette.MODERN_COLORS.text_white,
                    border: 'none',
                    margin: '0 5px',
                    cursor: 'pointer'
                }}
            >
                ➡️ Suivant
            </button>
        )}
    </div>
);

export default RecipeDisplayManager;