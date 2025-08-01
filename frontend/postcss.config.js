import tailwindcss from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'

export default {
  plugins: [
    tailwindcss(),      // ← you’re directly calling the plugin
    autoprefixer(),
  ],
}