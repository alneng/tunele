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
				},
			},
		},
	},
	plugins: [],
};
