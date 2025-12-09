import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'   // ← changed this line only
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
