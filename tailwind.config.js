/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}","./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        navbar: '#369E4E', // Warna untuk menu navbar icon dan text dan button
        gradientStart: '#40A858', // Warna awal untuk gradient background
        gradientEnd: '#2B9444', // Warna akhir untuk gradient background
      },
    },
  },
  plugins: [],
}