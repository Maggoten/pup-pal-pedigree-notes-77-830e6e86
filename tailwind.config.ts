import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'cinzel': ['Cinzel', 'serif'],
				'lato': ['Lato', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// New custom colors based on the style guide
				greige: {
					DEFAULT: '#ECE8E1', // Background
					50: '#FAF9F7',
					100: '#F7F5F2',
					200: '#ECE8E1', // Main greige
					300: '#D6CFC7', // Secondary background
					400: '#C0B8AE',
					500: '#AAA195',
					600: '#8E8577',
					700: '#726A5E',
					800: '#564F45',
					900: '#3A352E'
				},
				moss: {
					DEFAULT: '#4A5A3C', // Primary color
					50: '#EFF2EC',
					100: '#DFE4D9',
					200: '#BFC9B4',
					300: '#9FAE8F',
					400: '#7F936A',
					500: '#5F7845',
					600: '#4A5A3C', // Main moss green
					700: '#394429',
					800: '#272E1C',
					900: '#16190F'
				},
				rust: {
					DEFAULT: '#A8673F', // Accent color
					50: '#F7F0EC',
					100: '#F0E2D9',
					200: '#E1C5B2',
					300: '#D2A88C',
					400: '#C38B65',
					500: '#B46E3F',
					600: '#A8673F', // Main rust brown
					700: '#7D4D2F',
					800: '#53331F',
					900: '#291A10'
				},
				darkgray: {
					DEFAULT: '#4A4A4A', // Secondary color
					50: '#EFEFEF',
					100: '#DFDFDF',
					200: '#BFBFBF',
					300: '#9F9F9F',
					400: '#7F7F7F',
					500: '#5F5F5F',
					600: '#4A4A4A', // Main dark gray
					700: '#373737',
					800: '#252525',
					900: '#121212'
				},
				// Keep the previous color schemes for compatibility
				cream: {
					50: '#FFFDF7',
					100: '#FFF8E8',
					200: '#FFF2D0',
					300: '#FFECB8',
					400: '#FFE59F',
					500: '#FFDF87',
					600: '#D4B86F',
					700: '#AA9257',
					800: '#7F6B3F',
					900: '#554628'
				},
				sage: {
					50: '#F5F7F3',
					100: '#E7EDE3',
					200: '#D0DCCC',
					300: '#B8CAB4',
					400: '#A0B89C',
					500: '#88A684',
					600: '#6A8768',
					700: '#4D684D',
					800: '#304832',
					900: '#192419'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
