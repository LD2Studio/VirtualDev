import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    // sourcemap: true,
    minify: false,
    lib: {
      entry: [
        resolve(__dirname, 'src/vdev.webgl.js'),
        resolve(__dirname, 'src/vdev.webgpu.js'),
      ], // Point d'entrée de ton module
      name: 'vdev', // Nom global si tu veux supporter l'usage en tant que variable globale
      fileName: (format, entryName) => `${entryName}.${format}.js` // Nom du fichier de sortie
    },
    rollupOptions: {
      external: [
        'three',
        'three/addons/controls/OrbitControls',  
      ],
      output: {
        globals: {
          three: 'THREE'
        },
      }
    }
  },
});
