// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'VirtualDev',
			locales: {
				root: { label: 'Français', lang: 'fr' },
			},
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/LD2Studio/VirtualDev' }],
			sidebar: [
				{
					label: 'Prise en main de VirtualDev',
					autogenerate: { directory: 'virtualdev'}
				},
				{
					label: 'Guides',
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'Example Guide', slug: 'guides/example' },
					],
				},
				{
					label: 'Reference',
					autogenerate: { directory: 'reference' },
				},
			],
		}),
	],
});
