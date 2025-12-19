export const colors = {
    primary: {
        DEFAULT: '#B32624', // Crimson Red (Simrik) - Adjusted to darker shade
        foreground: '#FFFFFF',
    },
    secondary: {
        DEFAULT: '#DAA520', // Golden/Mustard (Goura) - Represents wealth and prosperity
        foreground: '#1A1A1A',
    },
    tertiary: {
        DEFAULT: '#E2725B', // Terracotta (Mato) - Earthy tone from sculptures/bricks
        foreground: '#FFFFFF',
    },
    neutral: {
        white: '#FDFBF7', // Off-White (Dugdh)
        black: '#1A1A1A', // Deep Black (Kaalo)
        gray: '#808080',
    },
    accent: {
        blue: '#003366', // Deep Blue (Nil)
    },
    semantic: {
        success: '#2E7D32', // Verified, Completed, Active, Delivered
        warning: '#FF6F00', // Pending, Processing, Held
        error: '#C62828',   // Rejected, Failed, Cancelled, Disputed
        info: '#0277BD',    // General Information
    },
} as const;
