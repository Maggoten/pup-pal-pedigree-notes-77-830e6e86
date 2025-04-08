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
				'le-jour': ['"Le Jour Serif"', 'serif'],
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
				// Custom colors
				sage: {
					50: '#F5F7F3',
					100: '#E7EDE3',
					200: '#D0DCCC',
					300: '#B8CAB4',
					400: '#A0B89C',
					500: '#88A684', // Main sage green
					600: '#6A8768',
					700: '#4D684D',
					800: '#304832',
					900: '#192419'
				},
				greige: {
					50: '#F8F6F2',
					100: '#F0EDE5',
					200: '#E1DACB',
					300: '#D2C8B1',
					400: '#C3B597',
					500: '#B4A37D',
					600: '#9A8A67',
					700: '#7A6E52',
					800: '#5B523C',
					900: '#2D2A1E'
				},
				brown: {
					50: '#F9F6F3',
					100: '#F0E9E2',
					200: '#E1D2C6',
					300: '#D2BCAA',
					400: '#C3A58D',
					500: '#B48F71',
					600: '#9A765A',
					700: '#7A5E48',
					800: '#5B4735',
					900: '#2D231A'
				},
				blush: {
					50: '#FFF0F5',
					100: '#FFDEE8',
					200: '#FFBDD1',
					300: '#FF9CBA',
					400: '#FF7BA3',
					500: '#FF5A8C',
					600: '#FF3975',
					700: '#FF175E',
					800: '#E60046',
					900: '#B3003A'
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
