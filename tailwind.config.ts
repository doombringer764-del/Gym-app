 import type { Config } from "tailwindcss";
 
 export default {
   darkMode: ["class"],
   content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
   prefix: "",
   theme: {
     container: {
       center: true,
       padding: "2rem",
       screens: {
         "2xl": "1400px",
       },
     },
     extend: {
       colors: {
         border: "hsl(var(--border))",
         input: "hsl(var(--input))",
         ring: "hsl(var(--ring))",
         background: "hsl(var(--background))",
         foreground: "hsl(var(--foreground))",
         primary: {
           DEFAULT: "hsl(var(--primary))",
           foreground: "hsl(var(--primary-foreground))",
         },
         secondary: {
           DEFAULT: "hsl(var(--secondary))",
           foreground: "hsl(var(--secondary-foreground))",
         },
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
         // Readiness state colors
         recovering: "hsl(var(--recovering))",
         caution: "hsl(var(--caution))",
         ready: "hsl(var(--ready))",
         primed: "hsl(var(--primed))",
         // Progress zone colors
         "zone-low": "hsl(var(--zone-low))",
         "zone-optimal": "hsl(var(--zone-optimal))",
         "zone-high": "hsl(var(--zone-high))",
         "zone-overtrained": "hsl(var(--zone-overtrained))",
         // Focus card
         "focus-bg": "hsl(var(--focus-bg))",
         "focus-border": "hsl(var(--focus-border))",
         "focus-glow": "hsl(var(--focus-glow))",
       },
       borderRadius: {
         lg: "var(--radius-lg)",
         md: "var(--radius-md)",
         sm: "var(--radius-sm)",
         "2xl": "1.5rem",
         "3xl": "2rem",
       },
       boxShadow: {
         soft: "var(--shadow-soft)",
         card: "var(--shadow-card)",
         focus: "var(--shadow-focus)",
       },
       fontFamily: {
         sans: ['Inter', 'system-ui', 'sans-serif'],
       },
       fontSize: {
         "metric": ["3rem", { lineHeight: "1", fontWeight: "700" }],
         "metric-sm": ["2rem", { lineHeight: "1.1", fontWeight: "700" }],
       },
       keyframes: {
         "accordion-down": {
           from: { height: "0" },
           to: { height: "var(--radix-accordion-content-height)" },
         },
         "accordion-up": {
           from: { height: "var(--radix-accordion-content-height)" },
           to: { height: "0" },
         },
         "pulse-glow": {
           "0%, 100%": { opacity: "0.6" },
           "50%": { opacity: "1" },
         },
         "slide-up": {
           from: { transform: "translateY(10px)", opacity: "0" },
           to: { transform: "translateY(0)", opacity: "1" },
         },
         "scale-in": {
           from: { transform: "scale(0.95)", opacity: "0" },
           to: { transform: "scale(1)", opacity: "1" },
         },
         "fill-progress": {
           from: { width: "0" },
         },
       },
       animation: {
         "accordion-down": "accordion-down 0.2s ease-out",
         "accordion-up": "accordion-up 0.2s ease-out",
         "pulse-glow": "pulse-glow 2s ease-in-out infinite",
         "slide-up": "slide-up 0.4s ease-out",
         "scale-in": "scale-in 0.3s ease-out",
         "fill-progress": "fill-progress 0.8s ease-out",
       },
     },
   },
   plugins: [require("tailwindcss-animate")],
 } satisfies Config;
