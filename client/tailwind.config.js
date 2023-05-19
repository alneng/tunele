/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/components/**/*.tsx"],
	theme: {
		extend: {
			fontFamily: {
				"sf-pro": ["SF Pro", "sans-serif"],
			},
			colors: {
				gray: {
					300: "#8E8EA0",
					500: "#3F3F3F",
					800: "#232323",
				},
				yellow: "#fcd53f",
				red: "#f8312f",
				green: "#00d26a",
			},
		},
	},
	plugins: [],
};
