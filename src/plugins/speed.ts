function speedPlugin(Scroll: any) {
  function speed(trigger: any) {
    const { speed = 1, centered = true } = trigger.opts || {};

    return (scroll: any) => {
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

export default speedPlugin;
