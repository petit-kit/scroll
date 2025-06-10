import { parseTranslate, mergeTransform } from "../helpers";

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

    return (scroll: any) => {
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

      const r = mergeTransform(
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

export default stickyPlugin;
