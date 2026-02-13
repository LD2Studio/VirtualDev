export class PanelTexture extends Panel {
    constructor(name: any);
    currentBitmap: any;
    sourceAspect: number;
    drawLabelOverlay(): void;
    /**
     * Set the source texture aspect ratio for proper display
     * @param width - Source texture width
     * @param height - Source texture height
     */
    setSourceSize(width: any, height: any): void;
    updateTexture(bitmap: any): void;
    setLabel(label: any): void;
    /**
     * Dispose of resources
     */
    dispose(): void;
}
import { Panel } from "./panel.js";
//# sourceMappingURL=panelTexture.d.ts.map