
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
				// Custom colors
				brown: {
					50: '#FAF6F1',
					100: '#F0E6D9',
					200: '#E1D0B4',
					300: '#D2B990',
					400: '#C3A36B',
					500: '#8B5A2B',
					600: '#7A4E26',
					700: '#5C3B1D',
					800: '#3D2713',
					900: '#1E140A'
				},
				cream: {
					50: '#FFFFFE',
					100: '#FCFCF7',
					200: '#F9F9EF',
					300: '#F5F5DC', // Main cream
					400: '#F0F0D0',
					500: '#EBEBC1',
					600: '#D6D6B1',
					700: '#A7A78A',
					800: '#787864',
					900: '#3C3C32'
				},
				blue: {
					50: '#F0F8FF',
					100: '#E3F1FF',
					200: '#C7E2FF',
					300: '#AAD4FF',
					400: '#8EC5FF',
					500: '#4A90E2', // Main blue
					600: '#3A73B5',
					700: '#2B5688',
					800: '#1D3A5B',
					900: '#0E1D2E'
				},
				pink: {
					50: '#FFF0F3',
					100: '#FFDEE2', // Soft pink
					200: '#FFBDC6',
					300: '#FF9BAA',
					400: '#FF7A8D',
					500: '#FF5871',
					600: '#FF3654',
					700: '#FF1438',
					800: '#F0001F',
					900: '#D30018'
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
