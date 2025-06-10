import LerpWithInertia from "./lerp";

import stickyPlugin from "./plugins/sticky";
import intersectionPlugin from "./plugins/intersection";
import speedPlugin from "./plugins/speed";
import maskPlugin from "./plugins/mask";
import scrollBarPlugin from "./plugins/scrollbar";

class Scroll {
  current: { x: LerpWithInertia; y: LerpWithInertia };
  private _root: HTMLElement;
  private _lerp: number = 0.25;
  private _slowLerp: number = 0.1;
  private _offsets: [number, number, number, number] = [0, 0, 0, 0];
  private _observer: IntersectionObserver;
  private _triggers: Map<HTMLElement, any> = new Map();
  private _plugins: any[] = [];
  private _progressListeners: ((
    progress: { x: number; y: number },
    current: { x: number; y: number },
    bounds: {
      x: { start: number; end: number };
      y: { start: number; end: number };
    }
  ) => void)[] = [];

  constructor({
    root = document.body,
    lerp = 0.25,
    offsets = [0, 0],
    plugins = [],
  }) {
    this._root = root;
    document.documentElement.style.height = document.body.scrollHeight + "px";
    document.body.style.position = "fixed";

    this._lerp = lerp;
    this._offsets = this._formatOffset(offsets);
    this.current = {
      x: new LerpWithInertia(window.scrollX, lerp),
      y: new LerpWithInertia(window.scrollY, lerp),
    };

    this._onResize();
    this._applyScroll();

    window.addEventListener("scroll", this._onScroll);
    window.addEventListener("resize", this._onResize);
    window.addEventListener("beforeunload", this._saveScroll);

    new ResizeObserver(this._onResize).observe(this._root);

    this._observer = new IntersectionObserver(this._handleIntersection);
    requestAnimationFrame(this._animate.bind(this));

    this._plugins = plugins;
    this._plugins.forEach((plugin: any) => plugin(this));

    document.body.style.visibility = "visible";
  }

  private _saveScroll = () => {
    window.scrollTo(this.current.x.getCurrent(), this.current.y.getCurrent());
  };

  private _onScroll = (e: Event) => {
    e.preventDefault();
    this.current.y.setTarget(window.scrollY, this._lerp);
  };

  private _onResize = () => {
    document.documentElement.style.setProperty(
      "--vh",
      `${window.innerHeight * 0.01}px`
    );
    document.documentElement.style.height = document.body.scrollHeight + "px";
    this.current.x.setBounds(0, this._root.offsetWidth - window.innerWidth);
    this.current.y.setBounds(0, this._root.offsetHeight - window.innerHeight);
    this._applyScroll();
    this._updateTriggers();
  };

  private _animate() {
    if (this.current.x.shouldTick() || this.current.y.shouldTick()) {
      this.current.x.tick();
      this.current.y.tick();
      this._applyScroll();
      this._updateTriggers();
    }

    requestAnimationFrame(this._animate.bind(this));
  }

  private _applyScroll = () => {
    const current = this.getCurrent();
    document.body.style.transform = `translate3d(${
      current.x
    }px, ${-current.y}px, 0)`;
    this._progressListeners.forEach((callback) =>
      callback(this.getProgress(), this.getCurrent(), this.getBounds())
    );
  };

  private _formatOffset(value: any): [number, number, number, number] {
    if (typeof value === "number") return [value, value, value, value];
    if (Array.isArray(value) && value.length === 2)
      return [value[0], value[1], value[0], value[1]];
    return value;
  }

  private _handleIntersection = (entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      const triggers = this._triggers.get(entry.target as HTMLElement);
      if (triggers) {
        triggers.forEach((trigger: any) => {
          trigger.active = entry.isIntersecting;
          trigger.entry = entry;
        });
      }
    });
  };

  private _updateTriggers = () => {
    this._triggers.forEach((triggers: any) => {
      triggers.forEach((trigger: any) => {
        if (trigger.active || trigger.forever) {
          trigger.callback(trigger)(this);
        }
      });
    });
  };

  getRoot() {
    return this._root;
  }
  getOffsets() {
    return this._offsets;
  }
  getProgress() {
    return {
      x: this.current.x.getProgress(),
      y: this.current.y.getProgress(),
    };
  }
  getCurrent() {
    return {
      x: this.current.x.getCurrent(),
      y: this.current.y.getCurrent(),
    };
  }
  getTarget() {
    return {
      x: this.current.x.getTarget(),
      y: this.current.y.getTarget(),
    };
  }
  getBounds() {
    return {
      x: this.current.x.getBounds(),
      y: this.current.y.getBounds(),
    };
  }
  scrollXTo(
    target: number | Element,
    { offset = 0, lerp = this._slowLerp } = {}
  ) {
    this.current.x.setTarget(
      typeof target === "number"
        ? target + offset
        : target.getBoundingClientRect().left +
            this.current.x.getCurrent() +
            offset,
      lerp
    );
  }
  scrollYTo(
    target: number | Element,
    { offset = 0, lerp = this._slowLerp } = {}
  ) {
    this.current.y.setTarget(
      typeof target === "number"
        ? target + offset
        : target.getBoundingClientRect().top +
            this.current.y.getCurrent() +
            offset,
      lerp
    );
  }
  trigger(
    element: HTMLElement,
    callback: any,
    opts?: { offset: number | [number, number]; forever?: boolean }
  ) {
    const trigger = {
      element,
      active: false,
      forever: opts?.forever,
      entry: null,
      opts: { ...opts, offset: this._formatOffset(opts?.offset) },
      callback,
    };

    this._observer.observe(element);
    this._triggers.set(element, this._triggers.get(element) || []);
    this._triggers.get(element)?.push(trigger);
    trigger.callback(trigger)(this);
  }
  onProgress(
    callback: (
      progress: { x: number; y: number },
      current: { x: number; y: number },
      bounds: {
        x: { start: number; end: number };
        y: { start: number; end: number };
      }
    ) => void
  ) {
    this._progressListeners.push(callback);
  }
}

export default Scroll;
export {
  stickyPlugin as sticky,
  intersectionPlugin as intersection,
  speedPlugin as speed,
  maskPlugin as mask,
  scrollBarPlugin as scrollbar,
};
