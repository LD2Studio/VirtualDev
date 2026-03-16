import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "VirtualDev Docs",
  description: "Framework VirtualDev Documentation",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Accueil', link: '/' },
      { text: 'Exemples', link: '/examples/' }
    ],

    sidebar: [
      {
        text: 'Prise en main',
        items: [
          { text: 'Qu\'est-ce que VirtualDev ?', link: '/getting-started/about' },
          { text: 'Créer un nouveau projet', link: '/getting-started/create-project' },
          { text: 'Créer une application simple avec VirtualDev', link: '/getting-started/create-simple-app' },
        ]
      },
      {
        text: 'Exemples',
        items: [
          { text: 'Liste des exemples', link: '/examples/' },
          { text: 'Exemple 1', link: '/examples/example-1' },
          { text: 'Exemple 2', link: '/examples/example-2' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/LD2Studio/VirtualDev' }
    ]
  },
  ignoreDeadLinks: 'localhostLinks'
})
