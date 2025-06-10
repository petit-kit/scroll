import { getBlockPolygonPart } from "../helpers";

function maskPlugin(Scroll: any) {
  function mask(trigger: any) {
    const { invert = false, targets } = trigger.opts || {};
    if (trigger.element.style.willChange) {
      trigger.element.style.willChange =
        trigger.element.style.willChange + " clipPath";
    }

    return (scroll: any) => {
      const { element } = trigger;
      const elementOffset = element.offsetTop;

      const offsets = scroll.getOffsets();
      const root = scroll.getRoot();
      const totalWidth = root.offsetWidth;
      const totalHeight = root.offsetHeight;

      if (invert) {
        const parts = targets.map((target: HTMLElement) =>
          getBlockPolygonPart(
            scroll.getRoot(),
            target,
            elementOffset,
            scroll.getCurrent().y,
            offsets,
            true
          )
        );

        element.style.clipPath = `polygon(${parts.join(",")})`;
      } else {
        const parts = targets.map((target: HTMLElement) =>
          getBlockPolygonPart(
            scroll.getRoot(),
            target,
            elementOffset,
            scroll.getCurrent().y,
            offsets,
            false
          )
        );
        const clip = `polygon(0% 0%, ${parts.join(
          ","
        )}, 0 ${totalHeight}px,${totalWidth}px ${totalHeight}px,${totalWidth}px 0%)`;
        element.style.clipPath = clip;
      }
    };
  }

  Scroll.mask = (
    element: HTMLElement,
    targets: HTMLElement | HTMLElement[],
    invert = false
  ) => {
    const targetsArray = Array.isArray(targets) ? targets : [targets];
    Scroll.trigger(element, mask, {
      targets: targetsArray,
      invert,
      forever: true,
    });
  };
}

export default maskPlugin;
