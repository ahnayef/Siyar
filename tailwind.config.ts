
import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'], 
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'archivo': ['"Archivo Black"', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'space-mono': ['"Space Mono"', 'monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        'neutral-status': {
          DEFAULT: 'hsl(var(--neutral-status))',
          foreground: 'hsl(var(--neutral-status-foreground))',
        },
        'complete-status': {
          DEFAULT: 'hsl(var(--complete-status))',
          foreground: 'hsl(var(--complete-status-foreground))',
        },
        'overdue-status': {
          DEFAULT: 'hsl(var(--overdue-status))',
          foreground: 'hsl(var(--overdue-status-foreground))',
        },
        border: 'hsl(var(--border))',
        'strong-border-color': 'hsl(var(--strong-border-color))',
        input: {
          DEFAULT: 'hsl(var(--input))',
          border: 'hsl(var(--input-border))', 
        },
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)', 
        md: 'calc(var(--radius) - 0.1rem)', 
        sm: 'calc(var(--radius) - 0.15rem)',
        '4px': '4px', // specific radius from guide
        none: '0px',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'event-entry': {
          '0%': { opacity: '0', transform: 'translateY(20px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'event-entry': 'event-entry 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
      },
      boxShadow: {
        // As per guide: Drop shadow offset (5px, 5px) for Timeline Card
        // Using --strong-border-color for the shadow color
        'neo': '5px 5px 0px 0px hsl(var(--strong-border-color))',
        'neo-hover': '3px 3px 0px 0px hsl(var(--strong-border-color))', // Example hover
        'neo-active': '1px 1px 0px 0px hsl(var(--strong-border-color))', // Example active
      }
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
    