import LerpWithInertia from './lerp.js';
export { default as sticky } from './plugins/sticky.js';
export { default as intersection } from './plugins/intersection.js';
export { default as speed } from './plugins/speed.js';
export { default as mask } from './plugins/mask.js';
export { default as scrollbar } from './plugins/scrollbar.js';

declare class Scroll {
    current: {
        x: LerpWithInertia;
        y: LerpWithInertia;
    };
    private _root;
    private _lerp;
    private _slowLerp;
    private _offsets;
    private _observer;
    private _triggers;
    private _plugins;
    private _progressListeners;
    constructor({ root, lerp, offsets, plugins, }: {
        root?: HTMLElement | undefined;
        lerp?: number | undefined;
        offsets?: number[] | undefined;
        plugins?: never[] | undefined;
    });
    private _saveScroll;
    private _onScroll;
    private _onResize;
    private _animate;
    private _applyScroll;
    private _formatOffset;
    private _handleIntersection;
    private _updateTriggers;
    getRoot(): HTMLElement;
    getOffsets(): [number, number, number, number];
    getProgress(): {
        x: number;
        y: number;
    };
    getCurrent(): {
        x: number;
        y: number;
    };
    getTarget(): {
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
    scrollXTo(target: number | Element, { offset, lerp }?: {
        offset?: number | undefined;
        lerp?: number | undefined;
    }): void;
    scrollYTo(target: number | Element, { offset, lerp }?: {
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

export { Scroll as default };
