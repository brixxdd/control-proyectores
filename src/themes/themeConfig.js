export const themeGradients = {
  default: {
    gradient: 'from-blue-600 to-blue-800',
    hover: 'hover:from-blue-700 hover:to-blue-900',
    border: 'border-blue-500',
    text: 'text-blue-600 dark:text-blue-400',
    background: 'bg-blue-100 dark:bg-blue-900/30'
  },
  purple: {
    gradient: 'from-purple-600 to-purple-900',
    hover: 'hover:from-purple-700 hover:to-purple-900',
    border: 'border-purple-500',
    text: 'text-purple-600 dark:text-purple-400',
    background: 'bg-purple-100 dark:bg-purple-900/30'
  },
  green: {
    gradient: 'from-emerald-600 to-emerald-900',
    hover: 'hover:from-emerald-700 hover:to-emerald-900',
    border: 'border-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
    background: 'bg-emerald-100 dark:bg-emerald-900/30'
  },
  ocean: {
    gradient: 'from-cyan-600 to-blue-900',
    hover: 'hover:from-cyan-700 hover:to-blue-900',
    border: 'border-cyan-500',
    text: 'text-cyan-600 dark:text-cyan-400',
    background: 'bg-cyan-100 dark:bg-cyan-900/30'
  },
  sunset: {
    gradient: 'from-orange-500 to-pink-800',
    hover: 'hover:from-orange-600 hover:to-pink-900',
    border: 'border-orange-500',
    text: 'text-orange-500 dark:text-orange-400',
    background: 'bg-orange-100 dark:bg-orange-900/30'
  }
};

// Helper para obtener el gradiente actual
export const getCurrentThemeStyles = (currentTheme) => {
  return themeGradients[currentTheme] || themeGradients.default;
}; 