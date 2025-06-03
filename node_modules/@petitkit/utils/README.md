# 🎛️ Utility Functions for Numeric Mapping & Color Interpolation

A lightweight utility module for common operations in animation, data normalization, and color blending.

## ✨ Features

- Map numbers from one range to another
- Clamp values and interpolate smoothly
- Extract min/max from arrays with custom selectors
- Perform non-linear mapping
- Interpolate between RGB/RGBA colors

---

## 🚀 Usage

### 📐 Range Mapping

### `mapRange(inMin, inMax, input, outMin, outMax)`
### `mapRangeClamp(inMin, inMax, input, outMin, outMax)`

Linearly maps a number from one range to another.

```ts
mapRange(0, 100, 50, 0, 1); // 0.5
mapRangeClamp(0, 100, 150, 0, 1); // 1
```

### 🔁 Interpolation

### `lerp(start, end, amount)`

Linear interpolation between two values.

```ts
lerp(0, 100, 0.25); // 25
```

### 🔒 Clamping

### `clamp(min, input, max)`

Restricts a number to stay within a defined range.

```ts
clamp(0, 120, 100); // 100
clamp(0, -10, 100); // 0
```

### 🌀 Non-linear Mapping

### `nonLinearMap(value, arrayIn, arrayOut)`

Interpolates between two corresponding arrays using piecewise linear mapping.

```ts
nonLinearMap(15, [0, 10, 20], [0, 100, 200]); // 150
```

### 📊 Array Utilities

### `extend(array, selector?)`

Returns the min and max of an array. Optional selector function defaults to identity.

---

### `min(array, selector?)`

Returns the minimum value from an array using optional selector.

---

### `max(array, selector?)`

Returns the maximum value from an array using optional selector.

```ts
extend([5, 10, 2]); // [2, 10]
min([5, 10, 2]); // 2
max([5, 10, 2]); // 10
```

You can also pass a selector:

```ts
min([{ x: 3 }, { x: 8 }], (d) => d.x); // 3
```

### 🎨 Color Interpolation

### `mergeRGB(color1, color2, progress)`

Blends two RGB or RGBA colors by progress (0 to 1).

```ts
mergeRGB('rgb(255, 0, 0)', 'rgb(0, 0, 255)', 0.5); // 'rgb(128, 0, 128)'
mergeRGB('rgba(0, 0, 0, 0.5)', 'rgba(255, 255, 255, 1)', 0.5); // 'rgba(128, 128, 128, 0.75)'
```

## 📄 License

MIT — use freely in personal or commercial projects.
