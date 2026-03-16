# Créer votre première application avec VirtualDev

1. Ouvrir le projet `mon-projet-virtualdev` avec Visual Studio Code.

```bash
cd mon-projet-virtualdev
code .
```
![alt text](../images/vscode-open-virtualdev-project.png)

2. Créer un nouveau fichier qu'on nommera `index.html`.

![alt text](../images/vscode-new-file.png)

![alt text](../images/vscode-new-index-html.png)

Ce fichier est le point d'entrée de votre application Web exécutée par le navigateur.

Plaçer dans ce fichier le code miminal pour afficher une sphère blanche dans une page Web.

```html
<script type="module">
    import * as THREE from 'three'
    import { App } from 'virtualdev'

    const app = new App(THREE)

    const cube = new THREE.Mesh(
        new THREE.SphereGeometry(),
        new THREE.MeshBasicMaterial()
    )

    app.scene.add(cube)

</script>
```
3. Exécuter l'application Web dans un navigateur.

Ouvrir une console dans VSCode (Menu `Terminal` > `Nouvelle Console` ou le raccourci `CTRL+J`). Taper la commande suivante :

```bash
npx vite
```
Un serveur de développement Web est lancé pour servir l'application Web sur l'URL http://localhost:5173/. Ouvrir ce lien dans un navigateur Web.

Le navigateur doit afficher une sphère blanche sur fond noir dans une page Web.
