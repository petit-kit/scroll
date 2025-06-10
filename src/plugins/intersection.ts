import { clamp } from "@petit-kit/utils";

function intersectionPlugin(Scroll: any) {
  function intersection(callback: (e: any) => void) {
    return (trigger: any) => (scroll: any) => {
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
          top: fromTopRatio,
          bottom: bottomRatio,
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

export default intersectionPlugin;
