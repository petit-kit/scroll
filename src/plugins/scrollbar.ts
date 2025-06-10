import {
  debounce,
  objectToStyle,
  hexToRgba,
  addEvent,
  mapRangeClamp,
} from "@petit-kit/utils";

function scrollBarPlugin(
  styles = {
    scrollBar: {},
    scrollBarThumb: {},
    inactiveOpacity: 0.2,
    activeOpacity: 1,
  }
) {
  const localStyles = {
    inactiveOpacity: styles.inactiveOpacity || 0.25,
    activeOpacity: styles.activeOpacity || 1,
    scrollBar: {
      position: "fixed",
      zIndex: 2000,
      top: 0,
      right: "0px",
      width: "9px",
      height: "100%",
      backgroundColor: "transparent",
      transition: "width 0.25s ease-in-out, background-color 0.25s ease-in-out",

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
      transition: "opacity 0.5s ease-in-out, background-color 0.5s ease-in-out",
      cursor: "grab",
      opacity: 0,
      ...styles.scrollBarThumb,
    },
  };

  const scrollBarStyle = objectToStyle(localStyles.scrollBar);
  const scrollBarThumbStyle = objectToStyle(localStyles.scrollBarThumb);

  const scrollBar = `<div id="ptk-scroll-bar" style="${scrollBarStyle}">
    <div class="ptk-scroll-bar-thumb" style="${scrollBarThumbStyle}"></div>
  </div>`;

  document.body.insertAdjacentHTML("beforeend", scrollBar);

  const $scrollBar: any = document.body.querySelector("#ptk-scroll-bar");
  const $scrollBarThumb: any = $scrollBar?.querySelector(
    ".ptk-scroll-bar-thumb"
  );

  let dragging = false;
  let hovered = false;
  let onMouseMove: any;

  const onHover = () => {
    $scrollBar.style.backgroundColor = hexToRgba(
      localStyles.scrollBarThumb.backgroundColor,
      0.15
    );
    $scrollBarThumb.style.opacity = `${localStyles.activeOpacity}`;
    $scrollBar.style.width = `${12}px`;
    hovered = true;
  };
  const hide = () => {
    if (hovered) return;
    $scrollBar.style.backgroundColor = "transparent";
    $scrollBarThumb.style.opacity = `${localStyles.inactiveOpacity}`;
    $scrollBar.style.width = localStyles.scrollBar.width;
  };
  const endScroll = debounce(hide, 500);
  const onLeave = () => {
    if (dragging) return;
    hovered = false;
    endScroll();
    hide();
  };

  addEvent($scrollBar, "mouseenter", onHover);
  addEvent($scrollBar, "mouseleave", onLeave);

  const stopDragging = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    dragging = false;
    hovered = false;
    $scrollBarThumb.style.cursor = "grab";
    document.body.style.cursor = "default";
    document.body.style.userSelect = "auto";
    onLeave();
    window.removeEventListener("mouseup", stopDragging);
    window.removeEventListener("mousemove", onMouseMove);
    setTimeout(() => {
      disableGlobalClick = false;
    }, 1);
  };

  let disableGlobalClick = false;
  let partUpToClick = 0;
  let partDownToClick = 0;
  addEvent($scrollBarThumb, "mousedown", (e: any) => {
    disableGlobalClick = true;
    dragging = true;
    hovered = true;
    const thumbBb = $scrollBarThumb.getBoundingClientRect();
    partUpToClick = e.clientY - thumbBb.top;
    partDownToClick = thumbBb.height - partUpToClick;

    $scrollBarThumb.style.cursor = "grabbing";
    document.body.style.cursor = "grabbing";
    document.body.style.userSelect = "none";

    window.addEventListener("mouseup", stopDragging, { passive: false });
    window.addEventListener("mousemove", onMouseMove);
    $scrollBar.removeEventListener("click", onMouseOut);
  });
  const onMouseOut = (event: any) => {
    if (!event.relatedTarget && !event.toElement) {
      stopDragging(event);
    }
  };
  document.addEventListener("mouseout", onMouseOut);

  let onScrollBarClick: any = () => {};
  $scrollBar.addEventListener("click", (e: MouseEvent) => {
    if (!disableGlobalClick) {
      onScrollBarClick(e);
    }
  });

  return function Scrollbar(Scroll: any) {
    const $scrollBar = document.querySelector("#ptk-scroll-bar");
    const $scrollBarThumb: any = $scrollBar?.querySelector(
      ".ptk-scroll-bar-thumb"
    );

    onScrollBarClick = (e: MouseEvent) => {
      const bounds = Scroll.getBounds();

      const target = mapRangeClamp(
        0,
        window.innerHeight,
        e.clientY,
        bounds.y.start,
        bounds.y.end
      );
      window.scrollTo(0, target);
    };

    onMouseMove = (e: MouseEvent) => {
      const bounds = Scroll.getBounds();

      const target = mapRangeClamp(
        partUpToClick,
        window.innerHeight - partDownToClick,
        e.clientY,
        bounds.y.start,
        bounds.y.end
      );

      window.scrollTo(0, target);
    };

    const hideScrollbar = `
      <style>
        html::-webkit-scrollbar, 
        body::-webkit-scrollbar {
          width: 0px;
        }

        html, body {
          scrollbar-width: none;
        }
      </style>
    `;
    const styles = document.createElement("style");
    styles.id = "ptk-scroll-bar-styles";
    styles.textContent = hideScrollbar;
    document.head.appendChild(styles);

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

export default scrollBarPlugin;
