const parseTranslate = (transform: string) => {
  if (transform.includes("translate3d")) {
    return parseTranslate3d(transform);
  } else if (transform.includes("translateX")) {
    return parseTranslateX(transform);
  } else if (transform.includes("translateY")) {
    return parseTranslateY(transform);
  } else if (transform.includes("translate")) {
    return parseTranslate2d(transform);
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

const mergeTransform = (
  a: { x: number; y: number },
  b: { x: number; y: number },
  subtract = false
) => ({
  x: a.x + (subtract ? -b.x : b.x),
  y: a.y + (subtract ? -b.y : b.y),
});

function getBlockPolygonPart(
  root: any,
  target: any,
  elementOffset: number,
  current: number,
  offsets: [number, number, number, number],
  invert = false
) {
  const targetParentOffset = target.parentElement.offsetTop;
  const height = target.offsetHeight;
  const wh = window.innerHeight;
  const targetTranslate = parseTranslate(target.style.transform);
  const topOffset = offsets[1] * wh - targetTranslate.y;
  const bottomOffset = offsets[3] * wh - targetTranslate.y;

  const top =
    target.offsetTop - elementOffset - current + targetParentOffset - topOffset;

  const totalWidth = root.offsetWidth;

  if (invert) {
    return `0 ${top}px,${totalWidth}px ${top}px,${totalWidth}px ${
      top + height
    }px,0 ${top + height}px`;
  } else {
    const bottom =
      target.offsetTop +
      target.offsetHeight -
      current +
      targetParentOffset -
      bottomOffset;

    return `0 ${top}px,0 ${bottom}px,0 ${top}px,${totalWidth}px ${top}px,${totalWidth}px ${bottom}px,0 ${bottom}px`;
  }
}

export { parseTranslate, mergeTransform, getBlockPolygonPart };
