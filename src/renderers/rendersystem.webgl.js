import {
    WebGLRenderer
} from 'three'

/**
 * This renderer uses WebGL 2 to dispay scenes.
 * 
 * @augments WebGLRenderer
 */
class RenderSystem extends WebGLRenderer{
    constructor() {
        super();

        this.setSize(window.innerWidth, window.innerHeight, false);
        this.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        this.domElement.style.width = '100%';
        this.domElement.style.height = '100%';
        document.body.appendChild( this.domElement );
        const canvas = this.domElement;

        if ( canvas.parentNode.localName === 'body') {
            canvas.parentNode.style.margin = 0;
            canvas.parentNode.style.height = '100vh';
        }
    }
}

export { RenderSystem };