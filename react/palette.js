import React from 'react';

/**
 * Module de gestion des couleurs
 */
class Palette {
  static MODERN_COLORS = {
    // Couleurs primaires (tons sombres élégants)
    primary: '#1a1a2e',      // Bleu marine foncé
    secondary: '#16213e',     // Bleu ardoise
    accent: '#0f3460',        // Bleu profond
   
    // Couleurs d'action (gradients modernes)
    success: '#764ba2',
    warning: '#f5576c',
    info: '#00f2fe',
    danger: '#fee140',
   
    // Arrière-plans (tons neutres sophistiqués)
    bg_primary: '#f8fafc',    // Blanc cassé
    bg_secondary: '#e2e8f0',  // Gris clair
    bg_card: '#ffffff',       // Blanc pur
    bg_glass: 'rgba(255, 255, 255, 0.1)',  // Effet glassmorphism
   
    // Texte
    text_primary: '#2d3748',
    text_secondary: '#718096',
    text_white: '#ffffff'
  };

  constructor() {
    this.MODERN_COLORS = Palette.MODERN_COLORS;
  }

  // Méthodes utilitaires pour la gestion des couleurs
  getColor(colorKey) {
    return this.MODERN_COLORS[colorKey] || '#000000';
  }

  // Génère une couleur avec opacité
  getColorWithOpacity(colorKey, opacity = 1) {
    const color = this.getColor(colorKey);
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return color;
  }

  // Génère un gradient entre deux couleurs
  createGradient(color1Key, color2Key, direction = 'to right') {
    const color1 = this.getColor(color1Key);
    const color2 = this.getColor(color2Key);
    return `linear-gradient(${direction}, ${color1}, ${color2})`;
  }

  // Génère des styles pour effet glassmorphism
  getGlassStyle(opacity = 0.1) {
    return {
      background: `rgba(255, 255, 255, ${opacity})`,
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '12px'
    };
  }

  // Génère des styles pour les cartes modernes
  getCardStyle() {
    return {
      backgroundColor: this.MODERN_COLORS.bg_card,
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(0, 0, 0, 0.05)',
      transition: 'all 0.3s ease'
    };
  }

  // Génère des styles pour les boutons
  getButtonStyle(type = 'primary', variant = 'solid') {
    const baseStyle = {
      border: 'none',
      borderRadius: '8px',
      padding: '12px 24px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '14px'
    };

    if (variant === 'solid') {
      return {
        ...baseStyle,
        backgroundColor: this.MODERN_COLORS[type],
        color: this.MODERN_COLORS.text_white,
        boxShadow: `0 2px 4px ${this.getColorWithOpacity(type, 0.3)}`
      };
    } else if (variant === 'outline') {
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        color: this.MODERN_COLORS[type],
        border: `2px solid ${this.MODERN_COLORS[type]}`
      };
    } else if (variant === 'ghost') {
      return {
        ...baseStyle,
        backgroundColor: this.getColorWithOpacity(type, 0.1),
        color: this.MODERN_COLORS[type],
        border: 'none'
      };
    }

    return baseStyle;
  }

  // Génère des styles pour les inputs
  getInputStyle() {
    return {
      border: `1px solid ${this.MODERN_COLORS.bg_secondary}`,
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '14px',
      backgroundColor: this.MODERN_COLORS.bg_card,
      color: this.MODERN_COLORS.text_primary,
      transition: 'all 0.3s ease',
      outline: 'none',
      '&:focus': {
        borderColor: this.MODERN_COLORS.primary,
        boxShadow: `0 0 0 3px ${this.getColorWithOpacity('primary', 0.1)}`
      }
    };
  }
}

// Composant de démonstration de la palette
const PaletteDemo = () => {
  const palette = new Palette();

  const colorGrid = Object.entries(Palette.MODERN_COLORS).map(([key, value]) => ({
    name: key,
    value: value,
    category: key.startsWith('bg_') ? 'Background' : 
              key.startsWith('text_') ? 'Text' : 
              ['primary', 'secondary', 'accent'].includes(key) ? 'Primary' : 'Action'
  }));

  const categories = ['Primary', 'Action', 'Background', 'Text'];

  return (
    <div style={{
      padding: '20px',
      backgroundColor: palette.MODERN_COLORS.bg_primary,
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          ...palette.getCardStyle(),
          padding: '30px',
          textAlign: 'center',
          marginBottom: '30px',
          background: palette.createGradient('primary', 'secondary')
        }}>
          <h1 style={{
            margin: 0,
            color: palette.MODERN_COLORS.text_white,
            fontSize: '32px',
            fontWeight: '700'
          }}>
            🎨 Palette de Couleurs Moderne
          </h1>
          <p style={{
            margin: '10px 0 0 0',
            color: palette.getColorWithOpacity('text_white', 0.9),
            fontSize: '16px'
          }}>
            Module de gestion des couleurs pour l'application
          </p>
        </div>

        {/* Grille de couleurs par catégorie */}
        {categories.map(category => (
          <div key={category} style={{
            ...palette.getCardStyle(),
            padding: '25px',
            marginBottom: '25px'
          }}>
            <h2 style={{
              margin: '0 0 20px 0',
              color: palette.MODERN_COLORS.text_primary,
              fontSize: '20px',
              fontWeight: '600'
            }}>
              {category === 'Primary' ? '🔵 Couleurs Primaires' :
               category === 'Action' ? '⚡ Couleurs d\'Action' :
               category === 'Background' ? '🎭 Arrière-plans' :
               '📝 Couleurs de Texte'}
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px'
            }}>
              {colorGrid
                .filter(color => color.category === category)
                .map(color => (
                  <div key={color.name} style={{
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    transition: 'transform 0.2s ease'
                  }}>
                    <div style={{
                      backgroundColor: color.value,
                      height: '80px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {color.name.includes('text_white') && (
                        <span style={{ color: color.value, fontSize: '24px' }}>Aa</span>
                      )}
                    </div>
                    <div style={{
                      padding: '12px',
                      backgroundColor: 'white'
                    }}>
                      <div style={{
                        fontWeight: '600',
                        fontSize: '14px',
                        color: palette.MODERN_COLORS.text_primary,
                        marginBottom: '4px'
                      }}>
                        {color.name.replace(/_/g, ' ').toUpperCase()}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: palette.MODERN_COLORS.text_secondary,
                        fontFamily: 'monospace'
                      }}>
                        {color.value}
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        ))}

        {/* Démonstration des styles */}
        <div style={{
          ...palette.getCardStyle(),
          padding: '25px'
        }}>
          <h2 style={{
            margin: '0 0 20px 0',
            color: palette.MODERN_COLORS.text_primary,
            fontSize: '20px',
            fontWeight: '600'
          }}>
            🎯 Démonstration des Styles
          </h2>

          {/* Boutons */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ 
              color: palette.MODERN_COLORS.text_primary,
              marginBottom: '15px' 
            }}>
              Boutons
            </h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button style={palette.getButtonStyle('primary', 'solid')}>
                Primary Solid
              </button>
              <button style={palette.getButtonStyle('success', 'solid')}>
                Success Solid
              </button>
              <button style={palette.getButtonStyle('warning', 'outline')}>
                Warning Outline
              </button>
              <button style={palette.getButtonStyle('info', 'ghost')}>
                Info Ghost
              </button>
            </div>
          </div>

          {/* Inputs */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ 
              color: palette.MODERN_COLORS.text_primary,
              marginBottom: '15px' 
            }}>
              Champs de saisie
            </h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                placeholder="Input normal"
                style={palette.getInputStyle()}
              />
              <input 
                type="email" 
                placeholder="Email"
                style={palette.getInputStyle()}
              />
            </div>
          </div>

          {/* Effet Glass */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ 
              color: palette.MODERN_COLORS.text_primary,
              marginBottom: '15px' 
            }}>
              Effet Glassmorphism
            </h3>
            <div style={{
              ...palette.getGlassStyle(0.15),
              padding: '20px',
              background: palette.createGradient('primary', 'secondary')
            }}>
              <div style={{
                ...palette.getGlassStyle(),
                padding: '15px',
                color: palette.MODERN_COLORS.text_white
              }}>
                Ceci est un exemple d'effet glassmorphism avec arrière-plan flou
              </div>
            </div>
          </div>

          {/* Gradients */}
          <div>
            <h3 style={{ 
              color: palette.MODERN_COLORS.text_primary,
              marginBottom: '15px' 
            }}>
              Gradients
            </h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{
                background: palette.createGradient('primary', 'secondary'),
                padding: '20px',
                borderRadius: '8px',
                color: 'white',
                minWidth: '150px',
                textAlign: 'center'
              }}>
                Primary → Secondary
              </div>
              <div style={{
                background: palette.createGradient('success', 'info'),
                padding: '20px',
                borderRadius: '8px',
                color: 'white',
                minWidth: '150px',
                textAlign: 'center'
              }}>
                Success → Info
              </div>
              <div style={{
                background: palette.createGradient('warning', 'danger', 'to bottom'),
                padding: '20px',
                borderRadius: '8px',
                color: 'white',
                minWidth: '150px',
                textAlign: 'center'
              }}>
                Warning → Danger
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          padding: '20px',
          color: palette.MODERN_COLORS.text_secondary,
          fontSize: '14px'
        }}>
          Module Palette - Gestion des couleurs modernes
        </div>
      </div>
    </div>
  );
};

export { Palette };
export default PaletteDemo;