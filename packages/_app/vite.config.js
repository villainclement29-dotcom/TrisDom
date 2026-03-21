import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../..')

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    dedupe: ['react', 'react-dom'],
    alias: {
      react: path.resolve(root, 'node_modules/react'),
      'react-dom': path.resolve(root, 'node_modules/react-dom'),
      '@agentix/util': path.resolve(root, 'packages/util'),
      '@agentix/ai': path.resolve(root, 'packages/ai'),
      '@agentix/base': path.resolve(root, 'packages/base'),
      '@agentix/canvas': path.resolve(root, 'packages/canvas'),
      '@agentix/store': path.resolve(root, 'packages/store'),
      '@agentix/content-box': path.resolve(root, 'packages/content-box'),
    },
  },
})
