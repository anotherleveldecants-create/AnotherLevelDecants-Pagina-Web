import { defineConfig } from 'vite'
import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs'
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
    },
    {
      name: 'copy-html-pages',
      apply: 'build',
      writeBundle() {
        const rootDir = process.cwd()
        const destDir = join(rootDir, 'dist')

        for (const entry of readdirSync(rootDir)) {
          if (!entry.endsWith('.html')) continue

          const sourcePath = join(rootDir, entry)
          if (!statSync(sourcePath).isFile()) continue

          copyFileSync(sourcePath, join(destDir, entry))
        }
      }
    }
  ]
})
