import { clamp, sum, debounce } from "@petitkit/utils";

class LerpWithInertia {
  private _current: number;
  private _target: number;
  private _lerp: number;
  private _originLerp: number;
  private _bounds = { start: 0, end: 0 };
  private _inertia = 0;
  private _values: number[] = [];

  constructor(start: number, lerp = 0.25) {
    this._current = start;
    this._target = start;
    this._lerp = lerp;
    this._originLerp = lerp;
  }
  shouldTick() {
    const diff = this._current - (this._target + this._inertia);
    return Math.abs(diff) > 0.1;
  }
  setCurrent(current: number) {
    this._current = current;
  }
  setBounds(start: number, end: number) {
    this._bounds = { start, end };
    this._current = clamp(this._bounds.start, this._current, this._bounds.end);
    this._target = clamp(this._bounds.start, this._target, this._bounds.end);
  }
  setTarget(target: number, lerp = this._originLerp) {
    this._target = clamp(this._bounds.start, target, this._bounds.end);
    this._lerp = lerp;
  }
  setDelta(delta: number, lerp = this._originLerp) {
    this.setTarget(this._target + delta, lerp);
  }
  tick() {
    this._inertia *= 0.955;
    this._target += this._inertia;
    this._current += (this._target - this._current) * this._lerp;
    this._current = clamp(this._bounds.start, this._current, this._bounds.end);
    return this._current;
  }
  resetInertia() {
    this._inertia = 0;
    this._values = [];
  }
  incrementInertia(value: number) {
    this._values.push(value);
    if (this._values.length > 20) this._values.shift();
  }
  computeInertia() {
    this._inertia = this._values.length
      ? sum(this._values) / this._values.length
      : 0;
  }
  getTarget() {
    return this._target;
  }
  getCurrent() {
    return this._current;
  }
  getBounds() {
    return this._bounds;
  }
  getProgress() {
    return this._current / (this._bounds.end - this._bounds.start) || 0;
  }
}

class Scroll {
  private _root: HTMLElement;
  private _target = { x: new LerpWithInertia(0), y: new LerpWithInertia(0) };
  private _current = { x: 0, y: 0 };
  private _touchStart = { x: 0, y: 0 };
  private _touchDelta = { x: 0, y: 0 };
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
  private _willSaveScroll: boolean = true;
  private _slowLerp: number = 0.1;

  constructor({
    root = document.body,
    lerp = 0.25,
    slowLerp = 0.1,
    offset = [0, 0],
    plugins = [],
  }: {
    root?: HTMLElement;
    lerp?: number;
    slowLerp?: number;
    offset?: number | [number, number];
    plugins?: any[];
  } = {}) {
    window.scrollTo(0, 0);
    document.documentElement.style.overflow = "hidden";

    history.scrollRestoration = "auto";
    const {
      scrollX = 0,
      scrollY = 0,
      targetX = 0,
      targetY = 0,
    } = history.state || {};

    this._root = root;
    // this._root.style.willChange = "transform";
    this._slowLerp = slowLerp;

    this._offsets = this._formatOffset(offset);
    this._target = {
      x: new LerpWithInertia(scrollX, lerp),
      y: new LerpWithInertia(scrollY, lerp),
    };
    this._current = {
      x: scrollX,
      y: scrollY,
    };
    this._onResize();

    this._target.x.setTarget(targetX);
    this._target.y.setTarget(targetY);
    this._applyScroll();

    const events = [
      ["wheel", this._onWheel],
      ["keydown", this._onKeyDown],
      ["touchstart", this._onTouchStart],
      ["touchmove", this._onTouchMove],
      ["touchend", this._onTouchEnd],
      ["resize", this._onResize],
      ["beforeunload", this._saveScroll],
      [
        "DOMContentLoaded",
        () => {
          this._onResize();
          this._target.x.setCurrent(scrollX);
          this._target.y.setCurrent(scrollY);
          this._target.x.setTarget(targetX);
          this._target.y.setTarget(targetY);
          this._applyScroll();
        },
      ],
    ] as const;

    new ResizeObserver(this._onResize).observe(this._root);

    events.forEach(([event, handler]) =>
      window.addEventListener(event, handler as any, { passive: false })
    );

    this._observer = new IntersectionObserver(this._handleIntersection);
    requestAnimationFrame(this._animate);

    this._plugins = plugins;
    this._plugins.forEach((plugin: any) => plugin(this));

    document.body.style.visibility = "visible";

    let lastTouch = 0;
    document.addEventListener(
      "touchend",
      function (event) {
        const now = new Date().getTime();
        if (now - lastTouch <= 300) {
          event.preventDefault();
        }
        lastTouch = now;
      },
      { passive: false }
    );
  }

  private _formatOffset(value: any): [number, number, number, number] {
    if (typeof value === "number") return [value, value, value, value];
    if (Array.isArray(value) && value.length === 2)
      return [value[0], value[1], value[0], value[1]];
    return value;
  }

  private _onResize = () => {
    this._target.x.setBounds(0, this._root.offsetWidth - window.innerWidth);
    this._target.y.setBounds(0, this._root.offsetHeight - window.innerHeight);
    this._applyScroll();
    this._updateTriggers();
  };

  private _onWheel = (e: WheelEvent) => {
    e.preventDefault();
    this._target.x.setDelta(e.deltaX);
    this._target.y.setDelta(e.deltaY);
  };

  private _onTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    this._touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    this._touchDelta = { x: 0, y: 0 };
    this._target.x.resetInertia();
    this._target.y.resetInertia();
  };

  private _onTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    this._touchDelta = {
      x: this._touchStart.x - e.touches[0].clientX,
      y: this._touchStart.y - e.touches[0].clientY,
    };
    this._touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    ["x", "y"].forEach((axis) => {
      this._target[axis as "x" | "y"].setDelta(
        this._touchDelta[axis as "x" | "y"]
      );
      this._target[axis as "x" | "y"].incrementInertia(
        this._touchDelta[axis as "x" | "y"]
      );
    });
  };

  private _onTouchEnd = (e: TouchEvent) => {
    e.preventDefault();
    if (this._touchDelta.x !== 0 || this._touchDelta.y !== 0) {
      e.stopImmediatePropagation();
      e.stopPropagation();
      e.preventDefault();
    }
    this._target.x.computeInertia();
    this._target.y.computeInertia();
  };

  private _onKeyDown = (e: KeyboardEvent) => {
    const vh = window.innerHeight;
    const isModified = e.metaKey || e.ctrlKey;

    const actions: Record<string, [number, number]> = {
      ArrowUp: [0, -0.25 * vh],
      ArrowDown: [0, 0.25 * vh],
      ArrowLeft: [-0.25 * vh, 0],
      ArrowRight: [0.25 * vh, 0],
      Space: [0, 0.5 * vh * (e.shiftKey ? -1 : 1)],
    };

    if (e.code === "ArrowUp" && isModified) {
      this._target.y.setTarget(0, this._slowLerp);
    }
    if (e.code === "ArrowDown" && isModified) {
      this._target.y.setTarget(this._target.y.getBounds().end, this._slowLerp);
    }

    if (actions[e.code]) {
      e.preventDefault();
      this._target.x.setDelta(actions[e.code][0], this._slowLerp);
      this._target.y.setDelta(actions[e.code][1], this._slowLerp);
    }

    if (e.code === "KeyR" && e.metaKey && e.shiftKey) {
      this._willSaveScroll = false;
    }
  };

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

  private _animate = () => {
    if (window.scrollY !== 0) window.scrollTo(0, 0);

    if (this._target.x.shouldTick() || this._target.y.shouldTick()) {
      this._target.x.tick();
      this._target.y.tick();
      this._applyScroll();
      this._updateTriggers();
    }

    requestAnimationFrame(this._animate);
  };

  private _applyScroll = () => {
    this._current = {
      x: this._target.x.getCurrent(),
      y: this._target.y.getCurrent(),
    };
    this._progressListeners.forEach((callback) =>
      callback(this.getProgress(), this.getCurrent(), this.getBounds())
    );
    this._root.style.transform = `translate3D(${this._current.x}px, ${-this
      ._current.y}px, 0)`;
  };

  private _saveScroll = () => {
    let state = this._willSaveScroll
      ? {
          scrollX: Math.floor(this._target.x.getCurrent()) || 0,
          scrollY: Math.floor(this._target.y.getCurrent()) || 0,
          targetX: Math.floor(this._target.x.getTarget()) || 0,
          targetY: Math.floor(this._target.y.getTarget()) || 0,
        }
      : {};
    history.replaceState(state, document.title);
  };

  getCurrent() {
    return this._current;
  }
  getOffsets() {
    return this._offsets;
  }
  getRoot() {
    return this._root;
  }
  getProgress() {
    return {
      x: this._target.x.getProgress(),
      y: this._target.y.getProgress(),
    };
  }
  getBounds() {
    return {
      x: this._target.x.getBounds(),
      y: this._target.y.getBounds(),
    };
  }
  scrollTo(
    target: number | Element,
    { offset = 0, lerp = this._slowLerp } = {}
  ) {
    this._target.y.setTarget(
      typeof target === "number"
        ? target + offset
        : target.getBoundingClientRect().top +
            this._target.y.getCurrent() +
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

const parseTranslate = (transform: string) => {
  if (transform.includes("translate3d")) {
    return parseTranslate3d(transform);
  } else if (transform.includes("translate")) {
    return parseTranslate2d(transform);
  } else if (transform.includes("translateX")) {
    return parseTranslateX(transform);
  } else if (transform.includes("translateY")) {
    return parseTranslateY(transform);
  }
  return { x: 0, y: 0 };
};

const parseTranslate3d = (transform: string) => {
  if (!transform) return { x: 0, y: 0 };
  const v = transform
    .replace("translate3d(", "")
    .split(",")
    .map((d) => parseFloat(d));
  return {
    x: v[0],
    y: v[1],
  };
};

const parseTranslate2d = (transform: string) => {
  if (!transform) return { x: 0, y: 0 };
  const v = transform
    .replace("translate(", "")
    .split(",")
    .map((d) => parseFloat(d));
  return { x: v[0], y: v[1] };
};

const parseTranslateX = (transform: string) => {
  const x = parseFloat(transform.replace("translateX(", ""));
  return { x, y: 0 };
};

const parseTranslateY = (transform: string) => {
  const y = parseFloat(transform.replace("translateY(", ""));
  return { x: 0, y };
};

const _mergeTransform = (
  a: { x: number; y: number },
  b: { x: number; y: number },
  subtract = false
) => ({
  x: a.x + (subtract ? -b.x : b.x),
  y: a.y + (subtract ? -b.y : b.y),
});

function intersectionPlugin(Scroll: any) {
  function intersection(callback: (e: any) => void) {
    return (trigger: any) => (scroll: Scroll) => {
      const { element } = trigger;
      const rect = element.getBoundingClientRect();
      const { width, height, top, left } = rect;
      const wh = window.innerHeight;
      const y = scroll.getCurrent().y;
      const offset = trigger.opts.offset || scroll.getOffsets();
      const oTop = offset[1] * wh;
      const oBottom = offset[3] * wh;

      const xRatio = clamp(0, -left / width, 1);
      const fromTopRatio = clamp(0, -(top - oTop) / height, 1);
      const bottomRatio = (element.offsetTop - (y + wh - oBottom)) / height;
      const topRatio = 1 + (element.offsetTop - (y + oTop)) / height;
      const maxVisible = Math.min(height, wh - (oTop + oBottom)) / height;
      const visiblePart = clamp(
        0,
        Math.min(-bottomRatio, Math.min(maxVisible, topRatio)),
        1
      );

      callback({
        intersection: {
          x: xRatio,
          y:
            fromTopRatio ||
            -clamp(0, 1 - (y + wh - element.offsetTop - oBottom) / height, 1),
        },
        overlapping: { x: 1 - Math.abs(xRatio), y: visiblePart },
        bb: rect,
      });
    };
  }

  Scroll.intersection = (element: HTMLElement, callback: (e: any) => void) => {
    Scroll.trigger(element, intersection(callback));
  };
}

function stickyPlugin(Scroll: any) {
  function sticky(trigger: any) {
    const options = Object.assign(
      {
        willChange: true,
      },
      trigger.opts
    );

    const willChange = options.willChange;
    if (options.parent) options.parent.style.position = "relative";
    if (willChange) {
      if (!trigger.element.style.willChange.includes("transform")) {
        trigger.element.style.willChange += " transform";
      }
    }

    if (!trigger.element.oldTransform)
      trigger.element.oldTransform = parseTranslate(
        trigger.element.style.transform
      );

    return (scroll: Scroll) => {
      const { element } = trigger;

      const parent = options.parent || scroll.getRoot();
      const offset = options.offset || scroll.getOffsets();
      const offsetTop = offset[1] * window.innerHeight;

      const start =
        element.offsetTop + parent.offsetTop + element.oldTransform.y;
      const end =
        parent.offsetTop +
        (parent.offsetHeight - offsetTop) -
        element.offsetHeight;
      let diff = start - offsetTop - scroll.getCurrent().y;
      diff = Math.min(diff, 0);
      diff -= Math.min(0, end - scroll.getCurrent().y);
      let top = 0;
      top = -diff;

      const r = _mergeTransform(
        {
          x: 0,
          y: top,
        },
        element.oldTransform,
        false
      );

      element.style.transform = `translate3D(${r.x}px, ${r.y}px, 0px)`;
    };
  }

  Scroll.sticky = (
    element: HTMLElement,
    opts?: { parent?: HTMLElement; offset: number | [number, number] }
  ) => {
    Scroll.trigger(element, sticky, opts);
  };
}

function speedPlugin(Scroll: any) {
  function speed(trigger: any) {
    const { speed = 1, centered = true } = trigger.opts || {};

    return (scroll: Scroll) => {
      const { element } = trigger;
      const y = scroll.getCurrent().y;
      const offset = centered
        ? (element.offsetTop - y - window.innerHeight / 2) * speed
        : y * speed;

      element.style.transform = `translate3D(0, ${offset}px, 0)`;
    };
  }

  Scroll.speed = (
    element: HTMLElement,
    opts?: { speed: number; centered: boolean }
  ) => {
    Scroll.trigger(element, speed, { ...opts, forever: true });
  };
}

function maskPlugin(Scroll: any) {
  function mask(trigger: any) {
    const { invert = false, target } = trigger.opts || {};
    if (trigger.element.style.willChange) {
      trigger.element.style.willChange =
        trigger.element.style.willChange + " clipPath";
    }

    return (scroll: Scroll) => {
      const { element } = trigger;
      const elementOffset = element.offsetTop;
      const targetParentOffset = target.parentElement.offsetTop;
      const wh = window.innerHeight;
      const height = target.offsetHeight;

      const offsets = scroll.getOffsets();
      const targetTranslate = parseTranslate(target.style.transform);
      const topOffset = offsets[1] * wh - targetTranslate.y;
      const bottomOffset = offsets[3] * wh - targetTranslate.y;

      const top =
        target.offsetTop -
        elementOffset -
        scroll.getCurrent().y +
        targetParentOffset -
        topOffset;
      const bottom =
        target.offsetTop +
        target.offsetHeight -
        scroll.getCurrent().y +
        targetParentOffset -
        bottomOffset;

      if (invert) {
        const clip = `polygon(0 ${top}px,100% ${top}px,100% ${
          top + height
        }px,0 ${top + height}px)`;
        element.style.clipPath = clip;
      } else {
        const clip = `polygon(0% 0%,0 ${top}px,0 ${bottom}px,0 ${top}px,100% ${top}px,100% ${bottom}px,0 ${bottom}px,0 100%,100% 100%,100% 0%)`;
        element.style.clipPath = clip;
      }
    };
  }

  Scroll.mask = (element: HTMLElement, target: HTMLElement, invert = false) => {
    Scroll.trigger(element, mask, { target, invert, forever: true });
  };
}

function scrollBarPlugin(styles = { scrollBar: {}, scrollBarThumb: {} }) {
  const localstyles = {
    scrollBar: {
      position: "fixed",
      zIndex: 2000,
      top: 0,
      right: "1px",
      width: "10px",
      height: "100%",
      ...styles.scrollBar,
    },
    scrollBarThumb: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "calc(100% - 4px)",
      height: "calc(100% - 2px)",
      backgroundColor: "#babac0",
      borderRadius: "10px",
      marginLeft: "2px",
      boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.2)",
      transition: "opacity 0.5s ease-in-out",
      opacity: 0,
      ...styles.scrollBarThumb,
    },
  };

  const scrollBarStyle = objectToStyle(localstyles.scrollBar);
  const scrollBarThumbStyle = objectToStyle(localstyles.scrollBarThumb);

  const scrollBar = `<div id="ptk-scroll-bar" style="${scrollBarStyle}">
    <div class="ptk-scroll-bar-thumb" style="${scrollBarThumbStyle}"></div>
  </div>`;

  document.body.insertAdjacentHTML("beforeend", scrollBar);

  return function Scrollbar(Scroll: any) {
    const $scrollBar = document.querySelector("#ptk-scroll-bar");
    const $scrollBarThumb: any = $scrollBar?.querySelector(
      ".ptk-scroll-bar-thumb"
    );

    const endScroll = debounce(() => {
      $scrollBarThumb.style.opacity = "0.1";
    }, 1000);

    const onProgress = (
      progress: { x: number; y: number },
      _: { x: number; y: number },
      bounds: {
        x: { start: number; end: number };
        y: { start: number; end: number };
      }
    ) => {
      const height = window.innerHeight;
      const totalHeight = bounds.y.end - bounds.y.start;

      const thumbRatio = height / totalHeight;
      const thumbHeight = thumbRatio * height;
      const viewportPart =
        3 + progress.y * totalHeight + progress.y * (height - 6 - thumbHeight);

      $scrollBarThumb.style.height = `${thumbHeight}px`;
      $scrollBarThumb.style.transform = `translateY(${viewportPart}px)`;
      $scrollBarThumb.style.willChange = "transform";
      $scrollBarThumb.style.opacity = "1";

      endScroll();
    };

    Scroll.onProgress(onProgress);
    onProgress(Scroll.getProgress(), Scroll.getCurrent(), Scroll.getBounds());
  };
}

const objectToStyle = (object: Record<string, any>) => {
  return Object.entries(object)
    .map(
      ([key, value]) =>
        `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value}`
    )
    .join(";");
};

export default Scroll;
export {
  stickyPlugin as sticky,
  intersectionPlugin as intersection,
  speedPlugin as speed,
  maskPlugin as mask,
  scrollBarPlugin as scrollBar,
};
