import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    sourcemap: true,
    minify: false,
    lib: {
      entry: [
        resolve(__dirname, 'src/virtualdev.js')
      ], // Point d'entrée de ton module
      name: 'vdev', // Nom global si tu veux supporter l'usage en tant que variable globale
      fileName: (format, entryName) => `${entryName}.${format}.js` // Nom du fichier de sortie
    },
    rollupOptions: {
      external: [
        'three',
        'tweakpane',
      ],
      output: {
        globals: {
          three: 'THREE',
          tweakpane: 'tweakpane',
        },
      }
    }
  },
});
