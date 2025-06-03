# Smooth Scroll Library

A comprehensive smooth scrolling library that replaces native browser scrolling with customizable, smooth animations and advanced features.

## Features

- **Smooth Scrolling**: Lerp-based smooth scrolling with customizable easing
- **Touch Support**: Full touch gesture support with inertia
- **Keyboard Navigation**: Arrow keys, space bar, and modifier key combinations
- **Scroll Persistence**: Automatic scroll position saving/restoration
- **Plugin System**: Extensible architecture with built-in plugins
- **TypeScript**: Full TypeScript support with proper typing

## Installation

```bash
npm install @petitkit/scroll
```

## Basic Usage

```javascript
import Scroll from './scroll';

// Initialize with default settings
const scroll = new Scroll();

// Initialize with custom options
const scroll = new Scroll({
  root: document.querySelector('.scroll-container'),
  lerp: 0.1,
  slowLerp: 0.05,
  offset: [0, 100], // [top, right, bottom, left] or [vertical, horizontal]
  plugins: [sticky, intersection, speed]
});
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `root` | HTMLElement | `document.body` | The scrollable container element |
| `lerp` | number | `0.25` | Linear interpolation factor for smooth scrolling |
| `slowLerp` | number | `0.1` | Slower lerp factor for keyboard navigation |
| `offset` | number \\| [number, number] | `[0, 0]` | Scroll offset values |
| `plugins` | Plugin[] | `[]` | Array of plugins to enable |

## API Methods

### Core Methods

```javascript
// Get current scroll position
const current = scroll.getCurrent(); // { x: number, y: number }

// Get scroll progress (0-1)
const progress = scroll.getProgress(); // { x: number, y: number }

// Get scroll bounds
const bounds = scroll.getBounds(); 
// { x: { start: number, end: number }, y: { start: number, end: number } }

// Scroll to position or element
scroll.scrollTo(500); // Scroll to Y position
scroll.scrollTo(element, { offset: 100, lerp: 0.1 });
```

### Event Listeners

```javascript
// Listen to scroll progress changes
scroll.onProgress((progress, current, bounds) => {
  console.log('Scroll progress:', progress.y);
});
```

### Trigger System

```javascript
// Add scroll-based triggers
scroll.trigger(element, (trigger) => (scroll) => {
  // Custom trigger logic
  console.log('Element in view:', trigger.active);
}, {
  offset: [0.1, 0.1], // Trigger offsets
  forever: true // Keep triggering even when out of view
});
```

## Built-in Plugins

### Intersection Plugin

Provides intersection-based animations and callbacks.

```javascript
import { intersection } from './scroll';

const scroll = new Scroll({
  plugins: [intersection]
});

// Use intersection detection
scroll.intersection(element, ({ intersection, overlapping, bb }) => {
  // intersection: { x: number, y: number } - intersection ratios
  // overlapping: { x: number, y: number } - overlap amounts
  // bb: DOMRect - bounding box
});
```

### Sticky Plugin

Creates sticky positioning effects.

```javascript
import { sticky } from './scroll';

const scroll = new Scroll({
  plugins: [sticky]
});

// Make element sticky
scroll.sticky(element, {
  parent: containerElement, // Optional parent container
  offset: [0, 100] // Offset from viewport edges
});
```

### Speed Plugin

Enables parallax and speed-based effects.

```javascript
import { speed } from './scroll';

const scroll = new Scroll({
  plugins: [speed]
});

// Apply speed effect (parallax)
scroll.speed(element, {
  speed: 0.5, // 0.5 = half speed, 2 = double speed
  centered: true // Center-based calculation
});
```

### Mask Plugin

Creates clipping/masking effects based on scroll position.

```javascript
import { mask } from './scroll';

const scroll = new Scroll({
  plugins: [mask]
});

// Apply mask effect
scroll.mask(maskElement, targetElement, false); // invert = false
```

### ScrollBar Plugin

Adds a custom scrollbar with smooth animations.

```javascript
import { scrollBar } from './scroll';

const scroll = new Scroll({
  plugins: [scrollBar({
    scrollBar: {
      right: '5px',
      width: '8px'
    },
    scrollBarThumb: {
      backgroundColor: '#333',
      borderRadius: '4px'
    }
  })]
});
```

## Keyboard Controls

- **Arrow Keys**: Navigate in small increments
- **Space**: Page down (Shift+Space for page up)
- **Cmd/Ctrl + Arrow Up**: Jump to top
- **Cmd/Ctrl + Arrow Down**: Jump to bottom
- **Cmd/Shift + R**: Disable scroll saving on refresh

## Touch Gestures

- **Swipe**: Natural touch scrolling with momentum
- **Inertia**: Continues scrolling after touch release
- **Multi-touch**: Prevents accidental zooming

## Browser Support

- Modern browsers with ES6+ support
- Touch-enabled devices
- Intersection Observer API support

## Performance Notes

- Uses `requestAnimationFrame` for smooth 60fps animations
- Automatically manages `will-change` properties
- Debounced resize handling
- Optimized transform calculations

## License

MIT License
```

This README provides comprehensive documentation for your smooth scrolling library, covering all the main features, plugins, and usage examples. The library appears to be a sophisticated solution for creating smooth, customizable scrolling experiences with extensive plugin support.