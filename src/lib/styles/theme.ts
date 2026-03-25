export const THEME = {
  fonts: {
    heading: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },

  colors: {
    primary: {
      DEFAULT: "oklch(0.67 0.14 210)",
      hex: "#06B6D4",
      light: "oklch(0.75 0.12 210)",
      dark: "oklch(0.55 0.16 210)",
    },
    success: {
      DEFAULT: "oklch(0.65 0.17 150)",
      hex: "#10B981",
    },
    warning: {
      DEFAULT: "oklch(0.75 0.15 85)",
      hex: "#F59E0B",
    },
    error: {
      DEFAULT: "oklch(0.62 0.21 25)",
      hex: "#EF4444",
    },
  },

  gradients: {
    primary: "from-primary/10 to-primary/5",
    hero: "from-black/60 via-black/20 to-transparent",
  },

  layout: {
    mobileMaxWidth: "480px",
    bottomNavHeight: "64px",
    topBarHeight: "56px",
    sidebarWidth: "256px",
  },

  spacing: {
    cardPadding: { mobile: "p-4", desktop: "md:p-6" },
    sectionGap: "space-y-4 md:space-y-6",
    pageContainer: "p-4 md:p-6",
  },
} as const;
