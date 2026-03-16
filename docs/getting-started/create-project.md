# Créer un projet VirtualDev

## Prérequis

Pour pouvoir créer un projet VirtualDev, vous devez avoir la commande `npm` disponible dans une console (ou un terminal). Celle-ci est disponible en installant [Node.js](https://nodejs.org/fr/download) sur votre machine.

## Créer un nouveau projet VirtualDev

1. Créer un dossier dans lequel le projet sera créé.

```bash
mkdir mon-projet-virtualdev
cd mon-projet-virtualdev
```
2. Initialiser le projet VirtualDev.

```bash
npm init -y
```
Un fichier `package.json` apparaitra dans le dossier `mon-projet-virtualdev`.

3. Installer le paquet `Vite` qui permettra de construire l'application Web.

```bash
npm install -D vite
```
4. Installer le framework `VirtualDev`.

```bash
npm install git+https://github.com/LD2Studio/VirtualDev.git
```
Un sous-dossier `node_modules` ainsi qu'un fichier `package.json` apparaitront dans le dossier `mon-projet-virtualdev`.

```txt
.
└── mon-projet-virtualdev
    ├── node_modules
    ├── package.json
    └── package-lock.json
```
Votre dossier `mon-projet-virtualdev` est maintenant configuré pour créer votre première application Web avec VirtualDev.

