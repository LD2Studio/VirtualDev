export class Input {
    _actions: any[];
    actionState: {};
    pointer: {
        x: number;
        y: number;
    };
    /**
     * Sets the actions for this input manager
     *
     * @param {Object[]} newActions - The new actions to set
     *
     * Each action is an object with the following properties:
     * - name: The name of the action
     * - keys: An array of keys that will trigger the action
     */
    set actions(newActions: any[]);
    isPressed(actionName: any): any;
    isJustPressed(actionName: any): boolean;
    _down(key: any): void;
    _up(key: any): void;
}
//# sourceMappingURL=inputs.d.ts.map