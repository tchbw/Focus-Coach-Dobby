import type { Config } from "tailwindcss";

const config = {
  darkMode: [`class`],
  content: [`./src/renderer/**/*.{ts,tsx}`],
  prefix: ``,
  theme: {
    container: {
      center: true,
      padding: `2rem`,
      screens: {
        "2xl": `1400px`,
      },
    },
    extend: {
      fontFamily: {
        round: [`Varela Round`, `sans-serif`],
      },
      colors: {
        border: `hsl(var(--border))`,
        input: `hsl(var(--input))`,
        ring: `hsl(var(--ring))`,
        background: `hsl(var(--background))`,
        foreground: `hsl(var(--foreground))`,
        primary: {
          DEFAULT: `hsl(var(--primary))`,
          foreground: `hsl(var(--primary-foreground))`,
        },
        secondary: {
          DEFAULT: `hsl(var(--secondary))`,
          foreground: `hsl(var(--secondary-foreground))`,
        },
        destructive: {
          DEFAULT: `hsl(var(--destructive))`,
          foreground: `hsl(var(--destructive-foreground))`,
        },
        muted: {
          DEFAULT: `hsl(var(--muted))`,
          foreground: `hsl(var(--muted-foreground))`,
        },
        accent: {
          DEFAULT: `hsl(var(--accent))`,
          foreground: `hsl(var(--accent-foreground))`,
        },
        popover: {
          DEFAULT: `hsl(var(--popover))`,
          foreground: `hsl(var(--popover-foreground))`,
        },
        card: {
          DEFAULT: `hsl(var(--card))`,
          foreground: `hsl(var(--card-foreground))`,
        },
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: `calc(var(--radius) - 4px)`,
      },
      keyframes: {
        "accordion-down": {
          from: { height: `0` },
          to: { height: `var(--radix-accordion-content-height)` },
        },
        "accordion-up": {
          from: { height: `var(--radix-accordion-content-height)` },
          to: { height: `0` },
        },
        blob: {
          "0%": { transform: `rotate(0.3deg) scale(1)` },
          "100%": { transform: `rotate(-0.3deg) scale(0.99)` },
        },
        character: {
          "0%": { transform: `translateY(0)` },
          "100%": { transform: `translateY(3px)` },
        },
        scaleUp: {
          "0%": { transform: `scale(0.8)`, opacity: `0` },
          "100%": { transform: `scale(1)`, opacity: `1` },
        },
        fadeCharacter: {
          "0%": {
            transform: `perspective(2rem) rotateX(1deg) rotateZ(0deg) translateX(20%) translateY(-45%) scale(0.8)`,
            opacity: `0`,
          },
          "100%": {
            transform: `perspective(2rem) rotateX(1deg) rotateZ(-6deg) translateX(20%) translateY(-45%) scale(1)`,
            opacity: `1`,
          },
        },
      },
      animation: {
        "accordion-down": `accordion-down 0.2s ease-out`,
        "accordion-up": `accordion-up 0.2s ease-out`,
        blob: `blob 1.5s cubic-bezier(0.37, 0, 0.63, 1) infinite alternate`,
        character: `character 0.6s cubic-bezier(0.37, 0, 0.63, 1) infinite alternate`,
        scaleUp: `scaleUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 1s forwards`,
        fadeCharacter: `fadeCharacter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 1s forwards`,
      },
    },
  },
  plugins: [require(`tailwindcss-animate`)],
} satisfies Config;

export default config;
