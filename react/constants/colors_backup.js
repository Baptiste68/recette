// constants/colors.js

export const palette = {
  // Couleurs primaires modernes avec tons sombres élégants
  primary: '#667eea',
  secondary: '#764ba2',
  accent: '#f093fb',
  
  // Couleurs d'action avec gradients modernes
  success: '#4facfe',
  warning: '#f093fb',
  info: '#43e97b',
  danger: '#fa709a',
  
  // Arrière-plans avec design moderne
  bgPrimary: '#fafbfc',
  bgSecondary: '#f1f3f6',
  bgCard: '#ffffff',
  bgGlass: 'rgba(255, 255, 255, 0.25)',
  bgDark: '#1a1a2e',
  
  // Texte avec meilleur contraste
  textPrimary: '#2d3748',
  textSecondary: '#718096',
  textWhite: '#ffffff',
  textMuted: '#a0aec0',
  
  // Couleurs de statut pour l'expiration (plus modernes)
  expired: '#ff6b6b',
  expiringSoon: '#feca57',
  fresh: '#48dbfb',
  undefined: '#95a5a6',
  
  // Gradients modernes et visuellement attrayants
  gradients: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    warning: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    info: 'linear-gradient(135deg, #43e97b 0%, #52fafe 100%)',
    danger: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    glass: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.3))',
    dark: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
  },
  
  // Ombres modernes avec plus de profondeur
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    card: '0 4px 6px rgba(0, 0, 0, 0.07), 0 1px 3px rgba(0, 0, 0, 0.06)',
    button: '0 2px 4px rgba(0, 0, 0, 0.15)',
    modal: '0 25px 50px rgba(0, 0, 0, 0.25)',
    float: '0 10px 15px rgba(0, 0, 0, 0.15)',
    glow: '0 0 20px rgba(102, 126, 234, 0.3)'
  },
  
  // Couleurs spécifiques aux catégories d'aliments
  foodCategories: {
    fruits: '#ff6b6b',
    vegetables: '#51cf66',
    dairy: '#74c0fc',
    meat: '#ff8787',
    seafood: '#4dabf7',
    grains: '#ffd43b',
    nuts: '#d0bfff',
    beverages: '#845ef7',
    condiments: '#69db7c',
    snacks: '#ffa94d'
  },
  
  // Couleurs d'état pour les animations
  states: {
    hover: 'rgba(102, 126, 234, 0.1)',
    active: 'rgba(102, 126, 234, 0.2)',
    disabled: 'rgba(160, 174, 192, 0.6)',
    focus: 'rgba(102, 126, 234, 0.4)'
  },
  
  // Bordures modernes
  borders: {
    light: '#e2e8f0',
    medium: '#cbd5e0',
    dark: '#4a5568',
    accent: '#667eea'
  }
};