# Custom Placeholders in Media Chrome

## Quick Start

Media Chrome components use **slots** (placeholders) that clients can override with custom content.

### Basic Example

```html
<!-- Default: Uses built-in icons -->
<media-play-button></media-play-button>

<!-- Custom: Override with your own content -->
<media-play-button>
  <span slot="play">▶ Play</span>
  <span slot="pause">⏸ Pause</span>
</media-play-button>
```

## How It Works

1. **Component defines slots** in its Shadow DOM:
   ```javascript
   <slot name="play">Default Play Icon</slot>
   <slot name="pause">Default Pause Icon</slot>
   ```

2. **Client overrides slots** by providing elements with `slot` attributes:
   ```html
   <media-play-button>
     <custom-icon slot="play">Play</custom-icon>
   </media-play-button>
   ```

3. **Browser projects content** from light DOM into shadow DOM slots

## Common Use Cases

### 1. Custom Icons
Replace default icons with your brand's icon set:
```html
<media-play-button>
  <svg slot="play"><!-- custom play icon --></svg>
  <svg slot="pause"><!-- custom pause icon --></svg>
</media-play-button>
```

### 2. Text Labels
Use text instead of icons:
```html
<media-play-button>
  <span slot="play">Start</span>
  <span slot="pause">Stop</span>
</media-play-button>
```

### 3. Placeholder Images
Show a blur hash while poster loads:
```html
<media-poster-image
  src="poster.jpg"
  placeholdersrc="data:image/jpeg;base64,..."
></media-poster-image>
```

### 4. Custom Theme Slots
Define your own slots in themes:
```html
<template id="my-theme">
  <media-controller>
    <slot name="media" slot="media"></slot>
    <slot name="watermark">Default Watermark</slot>
    <media-control-bar>
      <media-play-button></media-play-button>
    </media-control-bar>
  </media-controller>
</template>

<media-theme template="my-theme">
  <video slot="media" src="video.mp4"></video>
  <div slot="watermark">© My Brand</div>
</media-theme>
```

## Available Slots by Component

- **media-play-button**: `play`, `pause`, `icon`
- **media-mute-button**: `mute`, `unmute`, `icon`
- **media-fullscreen-button**: `enter`, `exit`, `icon`
- **media-controller**: `media`, `poster`, `centered-chrome`, `top-chrome`, `middle-chrome`
- **media-poster-image**: Uses `placeholdersrc` attribute
- **media-theme**: Custom slots you define

## Resources

- [Custom Placeholders Example](../../examples/vanilla/custom-placeholders.html)
- [Full Documentation](../../docs/src/pages/docs/en/custom-placeholders-guide.md)
- [Slots Demo](../../examples/vanilla/slots-demo.html)
- [MDN: Using Slots](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_templates_and_slots)

## Creating Your Own Components with Slots

When building custom components, follow this pattern:

```javascript
const template = document.createElement('template');
template.innerHTML = `
  <slot name="custom-content">
    <div class="default">Default Content</div>
  </slot>
`;

class MyComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }
}

customElements.define('my-component', MyComponent);
```

Then export it for clients:
```javascript
export { MyComponent };
export default MyComponent;
```

Clients can use it with custom content:
```html
<my-component>
  <div slot="custom-content">My Custom Content</div>
</my-component>
```
