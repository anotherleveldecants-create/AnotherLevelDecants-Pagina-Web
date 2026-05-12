import { defineConfig } from 'vite'
import { copyFileSync, mkdirSync } from 'fs'
import { join } from 'path'

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    minify: 'terser'
  },
  plugins: [
    {
      name: 'copy-data',
      apply: 'build',
      writeBundle() {
        const srcDir = join(process.cwd(), 'data')
        const destDir = join(process.cwd(), 'dist', 'data')
        
        mkdirSync(destDir, { recursive: true })
        copyFileSync(join(srcDir, 'perfumes.json'), join(destDir, 'perfumes.json'))
        copyFileSync(join(srcDir, 'packs.json'), join(destDir, 'packs.json'))
      }
    }
  ]
})
