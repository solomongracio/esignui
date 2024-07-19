/** @type {import('tailwindcss').Config} */

const defaultTheme = require("tailwindcss/defaultTheme");
const feConfig = require("./frontend.config.json");

module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: feConfig.structure.breakpoints,
    mainColWidths: feConfig.structure.container,
    innerGutters: feConfig.structure.gutters.inner,
    outerGutters: feConfig.structure.gutters.outer,
    columnCount: feConfig.structure.columns,
    fontFamilies: feConfig.typography.families,
    typesets: feConfig.typography.typesets,
    ratios: feConfig.ratios,
    components: feConfig.components,
    css: feConfig.css,
    borderRadius: {
      ...defaultTheme.borderRadius,
      "3xl": "1.875rem",
    },
    extend: {
      fontFamily: {
        sans: ["degular", ...defaultTheme.fontFamily.sans],
        body: ["adelle-sans", ...defaultTheme.fontFamily.sans],
      },
      transitionProperty: {
        "clip-path": "clip-path",
        height: "height",
        width: "width",
        dimensions: "width, height",
      },
      boxShadow: {
        // ...defaultTheme.boxShadow,
        DEFAULT: "4px 4px 2px rgba(0, 0, 0, 0.05)",
        md: "-3px 4px 0px rgba(0, 0, 0, 0.07)",
        lg: "-6px 6px 2px rgba(0, 0, 0, 0.1)",
        xl: "-12px 12px 2px rgba(0, 0, 0, 0.2)",
      },
      colors: feConfig.colors,
    },
  },
  plugins: [],
};
