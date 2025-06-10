# Scroll

A smooth scrolling library with inertia and plugin support for modern web applications.

## Features

- Smooth scrolling with inertia
- Plugin system for extended functionality
- Intersection observer integration
- Progress tracking
- Customizable lerp (linear interpolation) values
- Support for both horizontal and vertical scrolling
- Built-in plugins for sticky elements, intersection detection, speed control, masking, and scrollbar customization

## Installation

```bash
npm install @petit-kit/scroll
```

## Basic Usage

```javascript
import Scroll from '@petit-kit/scroll';

// Initialize with default options
const scroll = new Scroll();

// Initialize with custom options
const scroll = new Scroll({
  root: document.querySelector('.scroll-container'),
  lerp: 0.25, // Smoothness factor (0-1)
  offsets: [0, 0], // [x, y] offset values
  plugins: [] // Optional plugins
});
```

## API

### Constructor Options

- `root` (HTMLElement, default: document.body): The root element to scroll
- `lerp` (number, default: 0.25): Linear interpolation factor (0-1)
- `offsets` (number[] | number, default: [0, 0]): Scroll offset values % of the viewport height
- `plugins` (array, default: []): Array of plugins to initialize

### Methods

#### `getRoot()`
Returns the root element being scrolled.

#### `getOffsets()`
Returns the current offset values.

#### `getProgress()`
Returns the current scroll progress as an object with `x` and `y` values (0-1).

#### `getCurrent()`
Returns the current scroll position as an object with `x` and `y` values.

#### `getTarget()`
Returns the target scroll position as an object with `x` and `y` values.

#### `getBounds()`
Returns the scroll boundaries as an object with `x` and `y` ranges.

#### `scrollXTo(target, options)`
Scroll horizontally to a target position or element.
- `target`: number | Element
- `options`: { offset?: number, lerp?: number }

#### `scrollYTo(target, options)`
Scroll vertically to a target position or element.
- `target`: number | Element
- `options`: { offset?: number, lerp?: number }

#### `trigger(element, callback, options)`
Set up an intersection trigger for an element.
- `element`: HTMLElement
- `callback`: Function
- `options`: { offset?: number | [number, number], forever?: boolean }

#### `onProgress(callback)`
Add a progress listener.
- `callback`: Function(progress, current, bounds)

## Plugins

The library comes with several built-in plugins that enhance the scrolling experience:

### Sticky Plugin

The sticky plugin allows elements to stick to a specific position while scrolling.

```javascript
import Scroll, { sticky } from '@petit-kit/scroll';

const scroll = new Scroll({
  plugins: [sticky]
});

// Make an element sticky
scroll.sticky(element, {
  parent: containerElement, // Optional parent element
  offset: [0, 0] // Optional offset values [x, y]
});
```

Options:
- `parent` (HTMLElement): The parent element to stick relative to
- `offset` (number | [number, number]): Offset values for the sticky position
- `willChange` (boolean, default: true): Whether to enable hardware acceleration

### Intersection Plugin

The intersection plugin provides detailed intersection information for elements during scroll.

```javascript
import Scroll, { intersection } from '@petit-kit/scroll';

const scroll = new Scroll({
  plugins: [intersection]
});

// Track element intersection
scroll.intersection(element, (data) => {
  const { intersection, overlapping, bb } = data;
  // intersection: { x, y, top, bottom } - Intersection ratios
  // overlapping: { x, y } - Overlapping ratios
  // bb: DOMRect - Element's bounding box
});
```

### Speed Plugin

The speed plugin creates parallax-like effects by moving elements at different speeds during scroll.

```javascript
import Scroll, { speed } from '@petit-kit/scroll';

const scroll = new Scroll({
  plugins: [speed]
});

// Apply speed effect to element
scroll.speed(element, {
  speed: 0.5, // Speed multiplier
  centered: true // Whether to center the effect
});
```

Options:
- `speed` (number): Speed multiplier (1 = normal scroll speed)
- `centered` (boolean, default: true): Whether to center the effect relative to viewport

### Mask Plugin

The mask plugin creates scroll-based masking effects using clip-path.

```javascript
import Scroll, { mask } from '@petit-kit/scroll';

const scroll = new Scroll({
  plugins: [mask]
});

// Apply mask effect
scroll.mask(element, targetElements, false);
```

Parameters:
- `element` (HTMLElement): The element to apply the mask to
- `targets` (HTMLElement | HTMLElement[]): Target elements to mask against
- `invert` (boolean, default: false): Whether to invert the mask effect

### Scrollbar Plugin

The scrollbar plugin provides a customizable scrollbar with smooth interactions.

```javascript
import Scroll, { scrollbar } from '@petit-kit/scroll';

const scroll = new Scroll({
  plugins: [scrollbar()]
});

// With custom styles
const scroll = new Scroll({
  plugins: [scrollbar({
    scrollBar: {
      width: '12px',
      backgroundColor: 'rgba(0, 0, 0, 0.1)'
    },
    scrollBarThumb: {
      backgroundColor: '#000',
      borderRadius: '6px'
    },
    inactiveOpacity: 0.2,
    activeOpacity: 1
  })]
});
```

Options:
- `scrollBar` (object): Styles for the scrollbar container
- `scrollBarThumb` (object): Styles for the scrollbar thumb
- `inactiveOpacity` (number, default: 0.2): Opacity when inactive
- `activeOpacity` (number, default: 1): Opacity when active/hovered

Features:
- Smooth hover effects
- Draggable thumb
- Click-to-scroll
- Customizable appearance
- Automatic hiding when inactive

## Example

```javascript
import Scroll from '@petit-kit/scroll';

const scroll = new Scroll({
  lerp: 0.1, // Smoother scrolling
  offsets: [0.05, 0.05] // Add some padding
});

// Scroll to an element
scroll.scrollYTo(document.querySelector('#section-2'), {
  offset: 0.05, // Offset by 100px
  lerp: 0.05 // Slower, smoother scroll
});

// Track scroll progress
scroll.onProgress((progress, current, bounds) => {
  console.log('Scroll progress:', progress);
  console.log('Current position:', current);
  console.log('Scroll bounds:', bounds);
});

// Set up an intersection trigger
scroll.trigger(
  document.querySelector('.animate-on-scroll'),
  (trigger) => (scroll) => {
    if (trigger.active) {
      trigger.element.classList.add('visible');
    }
  },
  { offset: 0.05 }
);
```

## License

MIT
