/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "Inter", "Segoe UI", "sans-serif"],
        montserrat: ["Montserrat", "Segoe UI", "sans-serif"],
        ropaSans: ["Ropa Sans", "Segoe UI", "sans-serif"],
        inter: ["Inter", "Segoe UI", "sans-serif"],
        nunito: ["Nunito", "Segoe UI", "sans-serif"],
      },
      screens: {
        "desktop-100": { raw: "(min-width: 1280px) and (max-width: 1865px)" },
        "desktop-125": { raw: "(min-width: 1601px)" },
      },
      width: {
        "3xl": "1865px",
        "2xl": "1280px",
      },
      backgroundColor: {
        beluBlue: "#7ECCFA",
        blueOcean: "#177CD8",
        "blueOcean-lighter": "#297FFD",
      },
      backgroundImage: {
        "green-to-white": "linear-gradient(to bottom, #177CD8 50%, white 0%)",
        belugradient:
          "linear-gradient(228deg, rgba(23,124,216,1) 0%, rgba(41,127,253,1) 44%, rgba(126,204,250,1) 100%)",
      },
      textColor: {
        blueOcean: "#177CD8",
        beluBlue: "#7ECCFA",
      },
      colors: {
        blueOcean: "",
      },
      keyframes: {
        ring: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(10deg)" },
          "75%": { transform: "rotate(-10deg)" },
        },
        slideIn: {
          "0%": {
            transform: "translateY(-300%)",
          },
          "100%": {
            transform: "translateY(0%)",
          },
        },
        slideOut: {
          "0%": { transform: "translateY(0%)" },
          "100%": { transform: "translateY(-300%)" },
        },
      },
      animation: {
        ring: "ring 0.5s ease-in-out infinite",
        "slide-in": "slideIn 0.3s ease-in-out forwards",
        "slide-out": "slideOut 0.3s ease-in-out forwards",
      },
    },
  },
  important: "#root",
  plugins: [],
};
