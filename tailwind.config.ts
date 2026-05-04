
import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-bengali)", "sans-serif"],
                ekush: ["var(--font-ekush)", "sans-serif"],
                baraka: ["var(--font-baraka)", "sans-serif"],
            },
        },
    },
    plugins: [],
};
export default config;