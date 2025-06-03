declare class Scroll {
    private _root;
    private _target;
    private _current;
    private _touchStart;
    private _touchDelta;
    private _offsets;
    private _observer;
    private _triggers;
    private _plugins;
    private _progressListeners;
    private _willSaveScroll;
    private _slowLerp;
    constructor({ root, lerp, slowLerp, offset, plugins, }?: {
        root?: HTMLElement;
        lerp?: number;
        slowLerp?: number;
        offset?: number | [number, number];
        plugins?: any[];
    });
    private _formatOffset;
    private _onResize;
    private _onWheel;
    private _onTouchStart;
    private _onTouchMove;
    private _onTouchEnd;
    private _onKeyDown;
    private _handleIntersection;
    private _updateTriggers;
    private _animate;
    private _applyScroll;
    private _saveScroll;
    getCurrent(): {
        x: number;
        y: number;
    };
    getOffsets(): [number, number, number, number];
    getRoot(): HTMLElement;
    getProgress(): {
        x: number;
        y: number;
    };
    getBounds(): {
        x: {
            start: number;
            end: number;
        };
        y: {
            start: number;
            end: number;
        };
    };
    scrollTo(target: number | Element, { offset, lerp }?: {
        offset?: number | undefined;
        lerp?: number | undefined;
    }): void;
    trigger(element: HTMLElement, callback: any, opts?: {
        offset: number | [number, number];
        forever?: boolean;
    }): void;
    onProgress(callback: (progress: {
        x: number;
        y: number;
    }, current: {
        x: number;
        y: number;
    }, bounds: {
        x: {
            start: number;
            end: number;
        };
        y: {
            start: number;
            end: number;
        };
    }) => void): void;
}
declare function intersectionPlugin(Scroll: any): void;
declare function stickyPlugin(Scroll: any): void;
declare function speedPlugin(Scroll: any): void;
declare function maskPlugin(Scroll: any): void;
declare function scrollBarPlugin(styles?: {
    scrollBar: {};
    scrollBarThumb: {};
}): (Scroll: any) => void;

export { Scroll as default, intersectionPlugin as intersection, maskPlugin as mask, scrollBarPlugin as scrollBar, speedPlugin as speed, stickyPlugin as sticky };
