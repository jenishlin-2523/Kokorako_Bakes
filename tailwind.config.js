/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                bakery: {
                    cream: '#FDFBF7',
                    cocoa: '#3D2B1F',
                    pink: '#F8D7DA',
                    gold: '#D4AF37',
                    warm: '#F5E6D3',
                }
            },
            fontFamily: {
                sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
                serif: ['Lora', 'Georgia', 'serif'],
                hanoble: ['Hanoble', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
