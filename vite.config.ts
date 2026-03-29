import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// If you want the compiler, you pass an object to react()
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://dietvite-server.onrender.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  plugins: [
    react({
      babel: {
        plugins: [
          // If you have the compiler installed, it's usually added here
          // ['babel-plugin-react-compiler', { /* options */ }],
        ],
      },
    }),
  ],
})