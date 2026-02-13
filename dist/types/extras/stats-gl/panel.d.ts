export class Panel {
    constructor(name: any, fg: any, bg: any);
    id: number;
    name: any;
    fg: any;
    bg: any;
    gradient: CanvasGradient;
    PR: number;
    WIDTH: number;
    HEIGHT: number;
    TEXT_X: number;
    TEXT_Y: number;
    GRAPH_X: number;
    GRAPH_Y: number;
    GRAPH_WIDTH: number;
    GRAPH_HEIGHT: number;
    canvas: OffscreenCanvas | HTMLCanvasElement;
    context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
    createGradient(): CanvasGradient;
    initializeCanvas(): void;
    update(value: any, maxValue: any, decimals?: number, suffix?: string): void;
    updateGraph(valueGraph: any, maxGraph: any): void;
}
//# sourceMappingURL=panel.d.ts.map