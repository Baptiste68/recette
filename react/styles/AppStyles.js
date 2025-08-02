// styles/AppStyles.js - Styles conservés avec ajouts pour les nouvelles fonctionnalités
import { palette } from '../constants/colors';

export const styles = {
  // Styles originaux conservés
  container: {
    minHeight: '100vh',
    backgroundColor: palette.bgPrimary,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    position: 'relative',
  },

  // Navigation moderne avec glassmorphism
  navigation: {
    display: 'flex',
    backgroundColor: palette.bgGlass,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: `1px solid ${palette.borders.light}`,
    padding: '12px 20px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: palette.shadows.sm,
  },
  navButton: {
    flex: 1,
    padding: '14px 20px',
    margin: '0 6px',
    borderRadius: '16px',
    background: 'transparent',
    border: `2px solid transparent`,
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    color: palette.textSecondary,
    textAlign: 'center',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
  },
  activeNavButton: {
    background: palette.gradients.primary,
    color: palette.textWhite,
    transform: 'translateY(-2px)',
    boxShadow: palette.shadows.glow,
    border: `2px solid ${palette.accent}`,
  },

  // Sélecteur de langue moderne (NOUVEAU)
  languageSelector: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    zIndex: 200,
  },
  languageButton: {
    background: palette.bgGlass,
    backdropFilter: 'blur(10px)',
    border: `1px solid ${palette.borders.light}`,
    borderRadius: '12px',
    padding: '10px 15px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: palette.textPrimary,
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  languageDropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '8px',
    background: palette.bgCard,
    borderRadius: '12px',
    boxShadow: palette.shadows.modal,
    border: `1px solid ${palette.borders.light}`,
    overflow: 'hidden',
    minWidth: '200px',
  },
  languageOption: {
    padding: '12px 16px',
    cursor: 'pointer',
    fontSize: '14px',
    color: palette.textPrimary,
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  // Header moderne avec gradients
  header: {
    background: palette.gradients.primary,
    padding: '40px 30px',
    textAlign: 'center',
    color: palette.textWhite,
    position: 'relative',
    overflow: 'hidden',
  },
  headerTitle: {
    fontSize: '32px',
    fontWeight: '700',
    margin: '0 0 8px 0',
    letterSpacing: '-0.5px',
  },
  headerSubtitle: {
    fontSize: '16px',
    margin: '0',
    opacity: '0.9',
    fontWeight: '400',
  },

  // Cards modernes avec glassmorphism et largeur limitée
  card: {
    backgroundColor: palette.bgCard,
    margin: '0 0 20px 0',
    padding: '24px',
    borderRadius: '20px',
    boxShadow: palette.shadows.card,
    border: `1px solid ${palette.borders.light}`,
    transition: 'all 0.3s ease',
    position: 'relative',
  },
  cardHover: {
    transform: 'translateY(-4px)',
    boxShadow: palette.shadows.float,
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  // Grille d'aliments modernisée avec catégories
  categoryTabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  categoryTab: {
    padding: '10px 16px',
    borderRadius: '12px',
    border: `2px solid ${palette.borders.light}`,
    background: palette.bgSecondary,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: palette.textSecondary,
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  activeCategoryTab: {
    background: palette.gradients.primary,
    color: palette.textWhite,
    border: `2px solid ${palette.primary}`,
    transform: 'scale(1.05)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: '16px',
    marginTop: '20px',
  },
  gridItem: {
    aspectRatio: '1',
    backgroundColor: palette.bgCard,
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    border: `2px solid ${palette.borders.light}`,
    padding: '12px',
    boxShadow: palette.shadows.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  gridItemHover: {
    transform: 'scale(1.08) translateY(-4px)',
    boxShadow: palette.shadows.float,
    border: `2px solid ${palette.primary}`,
  },
  gridIcon: {
    fontSize: '32px',
    marginBottom: '8px',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
  },
  gridText: {
    fontSize: '12px',
    color: palette.textPrimary,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: '1.2',
  },

  // Inputs modernes avec design épuré
  inputGroup: {
    marginBottom: '20px',
  },
  inputLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '16px 20px',
    marginBottom: '16px',
    border: `2px solid ${palette.borders.light}`,
    borderRadius: '12px',
    fontSize: '16px',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
    backgroundColor: palette.bgCard,
    outline: 'none',
    fontFamily: 'inherit',
  },
  inputFocus: {
    borderColor: palette.primary,
    boxShadow: `0 0 0 3px ${palette.states.focus}`,
  },
  inputRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '16px',
  },

  // Boutons modernes avec animations
  button: {
    padding: '16px 24px',
    borderRadius: '12px',
    border: 'none',
    color: palette.textWhite,
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    margin: '8px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    width: '100%',
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'inherit',
    outline: 'none',
  },
  buttonHover: {
    transform: 'translateY(-2px)',
    boxShadow: palette.shadows.float,
  },
  successButton: {
    background: palette.gradients.success,
    boxShadow: palette.shadows.button,
  },
  warningButton: {
    background: palette.gradients.warning,
    boxShadow: palette.shadows.button,
  },
  infoButton: {
    background: palette.gradients.info,
    boxShadow: palette.shadows.button,
  },
  dangerButton: {
    background: palette.gradients.danger,
    boxShadow: palette.shadows.button,
  },
  primaryButton: {
    background: palette.gradients.primary,
    boxShadow: palette.shadows.button,
  },
  buttonRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginTop: '20px',
  },
  buttonIcon: {
    marginRight: '8px',
    fontSize: '16px',
  },

  // Inventaire compact avec 2-3 éléments par ligne
  inventoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '12px',
    marginTop: '16px',
  },
  inventoryItem: {
    display: 'flex',
    backgroundColor: palette.bgCard,
    padding: '16px',
    borderRadius: '12px',
    alignItems: 'center',
    boxShadow: palette.shadows.sm,
    border: `1px solid ${palette.borders.light}`,
    transition: 'all 0.2s ease',
    position: 'relative',
    minHeight: '80px',
  },
  inventoryItemHover: {
    transform: 'translateY(-1px)',
    boxShadow: palette.shadows.card,
  },
  inventoryInfo: {
    flex: 1,
    marginRight: '12px',
  },
  inventoryName: {
    fontSize: '16px',
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  inventoryIcon: {
    fontSize: '20px',
    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
    background: palette.bgSecondary,
    borderRadius: '8px',
    padding: '6px 10px',
  },
  quantityButton: {
    backgroundColor: palette.primary,
    color: palette.textWhite,
    border: 'none',
    borderRadius: '6px',
    width: '28px',
    height: '28px',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    fontWeight: '600',
  },
  quantityButtonHover: {
    transform: 'scale(1.1)',
    boxShadow: palette.shadows.button,
  },
  inventoryQuantity: {
    fontSize: '14px',
    color: palette.textPrimary,
    fontWeight: '600',
    minWidth: '90px',
    textAlign: 'center',
  },
  inventoryExpiry: {
    fontSize: '11px',
    color: palette.textSecondary,
    fontWeight: '500',
    padding: '3px 6px',
    borderRadius: '6px',
    background: palette.bgSecondary,
  },
  deleteButton: {
    backgroundColor: palette.danger,
    color: palette.textWhite,
    border: 'none',
    borderRadius: '8px',
    width: '36px',
    height: '36px',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    boxShadow: palette.shadows.sm,
  },
  deleteButtonHover: {
    transform: 'scale(1.1)',
    boxShadow: palette.shadows.button,
  },

  // État vide moderne
  emptyState: {
    textAlign: 'center',
    padding: '60px 30px',
    color: palette.textSecondary,
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '20px',
    opacity: '0.6',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '16px',
    lineHeight: '1.5',
    color: palette.textSecondary,
  },

  // Checkboxes modernes
  checkboxContainer: {
    display: 'grid',
    gap: '12px',
    marginTop: '16px',
  },
  checkboxRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    cursor: 'pointer',
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    border: `2px solid transparent`,
  },
  checkboxRowHover: {
    backgroundColor: palette.bgSecondary,
    border: `2px solid ${palette.borders.medium}`,
  },
  checkbox: {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    border: `2px solid ${palette.borders.medium}`,
    marginRight: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    position: 'relative',
  },
  checkboxActive: {
    background: palette.gradients.primary,
    border: `2px solid ${palette.primary}`,
    boxShadow: `0 0 0 3px ${palette.states.focus}`,
  },
  checkmark: {
    color: palette.textWhite,
    fontSize: '14px',
    fontWeight: '700',
  },
  checkboxContent: {
    flex: 1,
  },
  checkboxTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: '4px',
  },
  checkboxDescription: {
    fontSize: '14px',
    color: palette.textSecondary,
    lineHeight: '1.4',
  },

  // Cartes d'information modernes avec largeur limitée
  infoCard: {
    background: palette.gradients.glass,
    backdropFilter: 'blur(10px)',
    border: `1px solid ${palette.borders.light}`,
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '16px',
    margin: '0 0 16px 0',
  },
  infoCardIcon: {
    fontSize: '32px',
    marginBottom: '12px',
  },
  infoCardTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: '8px',
  },
  infoCardDescription: {
    fontSize: '15px',
    color: palette.textSecondary,
    lineHeight: '1.5',
    marginBottom: '16px',
  },

  // STYLES POUR RECIPE DISPLAY MANAGER (CONSERVÉS INTÉGRALEMENT)
  recipeModalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26, 26, 46, 0.6)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  recipeModalContent: {
    backgroundColor: palette.bgCard,
    borderRadius: '24px',
    width: '100%',
    maxWidth: '1000px',
    maxHeight: '90vh',
    overflow: 'hidden',
    boxShadow: palette.shadows.modal,
    border: `1px solid ${palette.borders.light}`,
  },
  recipeHeader: {
    background: palette.gradients.primary,
    padding: '32px',
    textAlign: 'center',
    color: palette.textWhite,
    position: 'relative',
  },
  recipeHeaderTitle: {
    fontSize: '28px',
    fontWeight: '700',
    margin: '0 0 8px 0',
    letterSpacing: '-0.5px',
  },
  recipeHeaderSubtitle: {
    fontSize: '16px',
    margin: '0',
    opacity: '0.9',
    fontWeight: '400',
  },
  recipeContent: {
    padding: '32px',
    maxHeight: '60vh',
    overflowY: 'auto',
  },

  // Page d'accueil des recettes modernisée
  recipeOverviewCard: {
    background: palette.gradients.glass,
    backdropFilter: 'blur(10px)',
    border: `1px solid ${palette.borders.light}`,
    borderRadius: '20px',
    padding: '32px',
    textAlign: 'center',
    marginBottom: '24px',
  },
  recipeStatsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '20px',
    margin: '24px 0',
  },
  recipeStatsRow: {
    display: 'flex',
    justifyContent: 'space-around',
    gap: '20px',
    margin: '24px 0',
    flexWrap: 'wrap',
  },
  recipeStatCard: {
    background: palette.bgCard,
    borderRadius: '16px',
    padding: '20px',
    textAlign: 'center',
    border: `1px solid ${palette.borders.light}`,
    transition: 'all 0.2s ease',
  },
  recipeStatItem: {
    textAlign: 'center',
    padding: '16px',
    borderRadius: '12px',
    background: palette.bgCard,
    border: `1px solid ${palette.borders.light}`,
    minWidth: '120px',
  },
  recipeStatIcon: {
    fontSize: '32px',
    marginBottom: '8px',
  },
  recipeStatNumber: {
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '4px',
  },
  recipeStatLabel: {
    fontSize: '14px',
    color: palette.textSecondary,
    fontWeight: '500',
  },
  recipePageGrid: {
    display: 'grid',
    gap: '12px',
    marginTop: '24px',
  },
  recipePageButton: {
    padding: '16px 20px',
    backgroundColor: palette.bgCard,
    border: `2px solid ${palette.borders.light}`,
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: palette.textPrimary,
    transition: 'all 0.2s ease',
    textAlign: 'left',
  },
  recipePageButtonHover: {
    backgroundColor: palette.primary,
    color: palette.textWhite,
    transform: 'translateY(-2px)',
    boxShadow: palette.shadows.button,
  },

  // Cards de recettes modernisées
  recipeCard: {
    backgroundColor: palette.bgCard,
    borderRadius: '20px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: palette.shadows.card,
    border: `1px solid ${palette.borders.light}`,
    transition: 'all 0.3s ease',
  },
  recipeCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  recipeImage: {
  width: '80px',
  height: '80px',
  borderRadius: '12px',
  objectFit: 'cover',
  marginRight: '16px',
  boxShadow: palette.shadows.sm,
  flexShrink: 0,
},

recipeImagePlaceholder: {
  width: '80px',
  height: '80px',
  borderRadius: '12px',
  backgroundColor: palette.bgSecondary,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: '16px',
  fontSize: '24px',
  flexShrink: 0,
},
  recipeTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: palette.textPrimary,
    flex: 1,
    marginRight: '16px',
    margin: 0,
    lineHeight: '1.3',
  },
  recipeScore: {
    fontSize: '12px',
    fontWeight: '600',
    padding: '6px 12px',
    borderRadius: '20px',
    background: palette.gradients.success,
    color: palette.textWhite,
    whiteSpace: 'nowrap',
  },
  recipeInfo: {
    marginBottom: '16px',
  },
  recipeInfoText: {
    fontSize: '14px',
    color: palette.textSecondary,
    marginBottom: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  recipeIngredientsList: {
    fontSize: '13px',
    color: palette.textSecondary,
    fontStyle: 'italic',
    background: palette.bgSecondary,
    padding: '12px 16px',
    borderRadius: '12px',
    marginTop: '12px',
    lineHeight: '1.4',
  },

  // Boutons d'action pour recettes
  recipeActionButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px',
    marginTop: '20px',
  },
  recipeDetailButton: {
    padding: '12px 20px',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    background: palette.gradients.primary,
    color: palette.textWhite,
  },
  recipeUrlButton: {
    padding: '12px 20px',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    background: palette.gradients.info,
    color: palette.textWhite,
  },

  // Navigation des recettes modernisée
  recipeNavigation: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px 32px',
    background: palette.bgSecondary,
    borderTop: `1px solid ${palette.borders.light}`,
  },
  recipeNavButton: {
    padding: '12px 20px',
    background: palette.gradients.primary,
    color: palette.textWhite,
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    margin: '0 8px',
    transition: 'all 0.2s ease',
  },
  recipeActiveNavButton: {
    background: palette.gradients.success,
    transform: 'scale(1.05)',
  },
  recipePageInfo: {
    fontSize: '15px',
    color: palette.textPrimary,
    fontWeight: '600',
  },

  // Modal de détails modernisé
  recipeDetailsModal: {
    backgroundColor: palette.bgCard,
    borderRadius: '24px',
    width: '95%',
    maxWidth: '800px',
    maxHeight: '85vh',
    overflow: 'hidden',
    boxShadow: palette.shadows.modal,
  },
  recipeDetailsContent: {
    padding: '32px',
    maxHeight: '65vh',
    overflowY: 'auto',
  },
  recipeDetailsTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: palette.textPrimary,
    textAlign: 'center',
    marginBottom: '20px',
    lineHeight: '1.3',
  },
  recipeDetailsInfo: {
    display: 'flex',
    justifyContent: 'center',
    gap: '32px',
    marginBottom: '28px',
    flexWrap: 'wrap',
  },
  recipeDetailsInfoItem: {
    fontSize: '15px',
    color: palette.textSecondary,
    textAlign: 'center',
    padding: '12px 16px',
    background: palette.bgSecondary,
    borderRadius: '12px',
    fontWeight: '500',
  },
  recipeSectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: '16px',
    marginTop: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  recipeIngredientItem: {
    fontSize: '14px',
    padding: '8px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderBottom: `1px solid ${palette.borders.light}`,
  },
  recipeInstructionsText: {
    fontSize: '14px',
    color: palette.textSecondary,
    lineHeight: '1.6',
    whiteSpace: 'pre-line',
    background: palette.bgSecondary,
    padding: '20px',
    borderRadius: '12px',
  },

  // Close button modernisé
  recipeCloseButton: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    backgroundColor: palette.danger,
    color: palette.textWhite,
    border: 'none',
    borderRadius: '12px',
    width: '44px',
    height: '44px',
    cursor: 'pointer',
    fontSize: '20px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeButtonHover: {
    transform: 'scale(1.1)',
    boxShadow: palette.shadows.button,
  },

  // États de chargement
  loading: {
    opacity: 0.6,
    pointerEvents: 'none',
    position: 'relative',
  },
  loadingSpinner: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '32px',
    height: '32px',
    border: `3px solid ${palette.borders.light}`,
    borderTop: `3px solid ${palette.primary}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },

  // Responsive design amélioré pour largeur limitée
  '@media (max-width: 768px)': {
    container: {
      padding: '0',
    },
    navigation: {
      padding: '8px 12px',
      flexDirection: 'row',
    },
    navButton: {
      padding: '10px 8px',
      fontSize: '12px',
      margin: '0 2px',
    },
    content: {
      padding: '0 12px',
    },
    card: {
      margin: '0 0 16px 0',
      padding: '16px',
    },
    infoCard: {
      margin: '0 0 16px 0',
      padding: '16px',
    },
    header: {
      padding: '20px 16px',
    },
    headerTitle: {
      fontSize: '24px',
    },
    grid: {
      gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
      gap: '12px',
    },
    buttonRow: {
      gridTemplateColumns: '1fr',
      gap: '12px',
    },
    categoryTabs: {
      flexDirection: 'column',
      gap: '8px',
    },
    recipeModalContent: {
      width: '95%',
      margin: '10px',
      borderRadius: '16px',
    },
    recipeContent: {
      padding: '20px',
    },
    recipeNavigation: {
      padding: '16px',
      flexDirection: 'column',
      gap: '12px',
    },
    inventoryGrid: {
      gridTemplateColumns: '1fr',
      gap: '8px',
    },
    inventoryItem: {
      minHeight: '70px',
      padding: '12px',
    },
    quantityControls: {
      gap: '6px',
      padding: '4px 8px',
    },
    quantityButton: {
      width: '24px',
      height: '24px',
      fontSize: '12px',
    },
    inventoryQuantity: {
      fontSize: '12px',
      minWidth: '70px',
    },
    deleteButton: {
      width: '30px',
      height: '30px',
      fontSize: '14px',
    },
    languageSelector: {
      position: 'relative',
      top: 'auto',
      right: 'auto',
    },
  },

  // Breakpoint pour tablettes (nouveau)
  '@media (min-width: 769px) and (max-width: 1024px)': {
    content: {
      maxWidth: '900px',
      padding: '0 24px',
    },
    inventoryGrid: {
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    },
  },

  // Breakpoint pour écrans moyens (nouveau)
  '@media (min-width: 1025px) and (max-width: 1400px)': {
    content: {
      maxWidth: '1000px',
    },
    inventoryGrid: {
      gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
    },
  },

  // Animations keyframes (ajoutées pour compatibilité)
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },

  '@keyframes fadeIn': {
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },

  '@keyframes slideIn': {
    from: { transform: 'translateX(-100%)' },
    to: { transform: 'translateX(0)' },
  },

  '@keyframes bounce': {
    '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
    '40%': { transform: 'translateY(-10px)' },
    '60%': { transform: 'translateY(-5px)' },
  },

  // Classes d'animation
  fadeIn: {
    animation: 'fadeIn 0.5s ease-out',
  },

  slideIn: {
    animation: 'slideIn 0.3s ease-out',
  },

  bounce: {
    animation: 'bounce 0.6s ease-out',
  },

  // Animations pour les notifications d'optimisation
  '@keyframes slideInRight': {
  '0%': { 
    transform: 'translateX(100%)',
    opacity: '0'
  },
  '100%': { 
    transform: 'translateX(0)',
    opacity: '1'
  }
  },

  '@keyframes slideOutRight': {
  '0%': { 
    transform: 'translateX(0)',
    opacity: '1'
  },
  '100%': { 
    transform: 'translateX(100%)',
    opacity: '0'
  }
  },

  '@keyframes pulse': {
  '0%': { 
    transform: 'scale(1)',
    opacity: '1'
  },
  '50%': { 
    transform: 'scale(1.05)',
    opacity: '0.8'
  },
  '100%': { 
    transform: 'scale(1)',
    opacity: '1'
  }
  },

  // Style pour les éléments de progression
  progressOverlay: {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2000,
  animation: 'fadeIn 0.3s ease'
  },

  progressCard: {
  backgroundColor: palette.bgCard,
  padding: '30px',
  borderRadius: '20px',
  boxShadow: palette.shadows.modal,
  textAlign: 'center',
  maxWidth: '400px',
  margin: '20px',
  animation: 'slideIn 0.4s ease'
  },

  progressTitle: {
  fontSize: '20px',
  fontWeight: '700',
  color: palette.textPrimary,
  marginBottom: '15px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px'
  },

  progressSubtitle: {
  fontSize: '14px',
  color: palette.textSecondary,
  lineHeight: '1.5',
  marginBottom: '20px'
  },

  progressSpinner: {
  width: '40px',
  height: '40px',
  border: `4px solid ${palette.borders.light}`,
  borderTop: `4px solid ${palette.primary}`,
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  margin: '0 auto'
  },

  // Notifications de succès
  successNotification: {
  position: 'fixed',
  bottom: '20px',
  right: '20px',
  backgroundColor: palette.success,
  color: palette.textWhite,
  padding: '16px 24px',
  borderRadius: '12px',
  fontSize: '14px',
  fontWeight: '600',
  boxShadow: palette.shadows.modal,
  zIndex: 1001,
  maxWidth: '300px',
  animation: 'slideInRight 0.3s ease',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
  },

  warningNotification: {
  position: 'fixed',
  bottom: '20px',
  right: '20px',
  backgroundColor: palette.warning,
  color: palette.textWhite,
  padding: '16px 24px',
  borderRadius: '12px',
  fontSize: '14px',
  fontWeight: '600',
  boxShadow: palette.shadows.modal,
  zIndex: 1001,
  maxWidth: '300px',
  animation: 'slideInRight 0.3s ease',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
  },

  // Badges d'optimisation
  optimizationBadge: {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  backgroundColor: palette.success,
  color: palette.textWhite,
  padding: '4px 10px',
  borderRadius: '12px',
  fontSize: '11px',
  fontWeight: '600',
  border: `1px solid rgba(255, 255, 255, 0.2)`
  },

  utilizationBadge: {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  backgroundColor: palette.primary,
  color: palette.textWhite,
  padding: '3px 8px',
  borderRadius: '8px',
  fontSize: '10px',
  fontWeight: '600'
  }
};
