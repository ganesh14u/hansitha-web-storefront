import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import scrollbarHide from "tailwind-scrollbar-hide";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Merienda", "sans-serif"],
      },
      colors: {
        brand: {
          blue: "#03B9F0",
          pink: "#C5499A",
        },
        primary: {
          DEFAULT: "#03B9F0",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#C5499A",
          foreground: "#ffffff",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        dark: "#1C212E",
        green: "#16BF78",
        sand: "#fbbf24",
        "primary-light": "#f87171",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "blue-pink": "linear-gradient(90deg, #03B9F0 0%, #C5499A 100%)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // 🚚 Truck animation keyframes
        truck: {
          "10%, 30%": { transform: "translateX(-164px)" },
          "40%": { transform: "translateX(-104px)" },
          "60%": { transform: "translateX(-224px)" },
          "75%, 100%": { transform: "translateX(24px)" },
        },
        lines: {
          "0%, 30%": { opacity: "0", transform: "scaleY(0.7) translateX(0)" },
          "35%, 65%": { opacity: "1" },
          "70%": { opacity: "0" },
          "100%": { transform: "scaleY(0.7) translateX(-400px)" },
        },
        box: {
          "8%, 10%": { transform: "translateX(40px)", opacity: "1" },
          "25%": { transform: "translateX(112px)", opacity: "1" },
          "26%": { transform: "translateX(112px)", opacity: "0" },
          "27%, 100%": { transform: "translateX(0px)", opacity: "0" },
        },
      },
      animation: {
        marquee: "marquee 20s linear infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        bounce: "bounce 1s infinite",
        // 🚚 Truck animation classes
        truck: "truck 10s ease forwards",
        lines: "lines 10s ease forwards",
        box: "box 10s ease forwards",
      },
    },
  },
  plugins: [animate, scrollbarHide],
};

export default config;
