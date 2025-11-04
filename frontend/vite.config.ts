import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue()],
    css: {
      postcss: './postcss.config.js',
    },
    server: {
      allowedHosts: [env.VITE_APP_HOST],
    },
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    build: {
      rollupOptions: {
        external: [],
      }
    }
  }
})
