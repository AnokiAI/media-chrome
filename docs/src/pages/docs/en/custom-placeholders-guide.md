---
title: Custom Placeholders Guide
description: Learn how to use and create custom placeholders in Media Chrome components
layout: ../../../../layouts/MainLayout.astro
---

# Custom Placeholders in Media Chrome

Media Chrome uses the web platform's [slot mechanism](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot) to provide customization points (placeholders) that clients can override. This guide explains how this pattern works and how to leverage it in your applications.

## Overview

The placeholder pattern in Media Chrome works as follows:

1. **Components define slots** - Media Chrome components expose named slots in their Shadow DOM
2. **Components export** - Components are packaged and exported as web components  
3. **Clients integrate** - Clients import components and use them in their HTML
4. **Clients customize** - Clients optionally override slots with custom content

## Understanding Slots

Slots are part of the Web Components standard and act as placeholders within a component's Shadow DOM. They allow external content (from the "light DOM") to be projected into specific locations within the component.

### Basic Slot Usage

```html
<!-- Component provides default content in a slot -->
<media-play-button></media-play-button>

<!-- Client overrides the slot with custom content -->
<media-play-button>
  <span slot="play">▶ Play</span>
  <span slot="pause">⏸ Pause</span>
</media-play-button>
```

## Component-Level Customization

Most Media Chrome components expose slots for customization. Here are common examples:

### Play Button Slots

The `<media-play-button>` component exposes three slots:

- `play` - Content shown when media is paused
- `pause` - Content shown when media is playing  
- `icon` - Single element that represents both states

```html
<!-- Text-based override -->
<media-play-button>
  <span slot="play">Start Video</span>
  <span slot="pause">Stop Video</span>
</media-play-button>

<!-- Custom icon override -->
<media-play-button>
  <svg slot="play" viewBox="0 0 24 24">
    <path d="m6 21 15-9L6 3v18Z"/>
  </svg>
  <svg slot="pause" viewBox="0 0 24 24">
    <path d="M6 20h4V4H6v16Zm8-16v16h4V4h-4Z"/>
  </svg>
</media-play-button>
```

### Mute Button Slots

Similar to the play button, `<media-mute-button>` provides:

- `mute` - Content shown when audio is playing
- `unmute` - Content shown when audio is muted
- `icon` - Single element for both states

### Poster Image Placeholders

The `<media-poster-image>` component supports a placeholder image (often a blur hash) that displays while the main poster loads:

```html
<media-poster-image
  slot="poster"
  src="https://example.com/poster.jpg"
  placeholdersrc="data:image/jpeg;base64,..."
></media-poster-image>
```

## Theme-Level Customization

When creating custom themes, you can define your own slots that clients can fill with custom content.

### Creating a Theme with Custom Slots

```html
<template id="my-custom-theme">
  <media-controller>
    <!-- Forward the media slot -->
    <slot name="media" slot="media"></slot>
    
    <!-- Custom watermark slot -->
    <slot name="watermark" slot="centered-chrome">
      <div class="default-watermark">Default Brand</div>
    </slot>
    
    <!-- Custom CTA slot -->
    <slot name="cta" slot="top-chrome"></slot>
    
    <!-- Standard controls -->
    <media-control-bar>
      <media-play-button></media-play-button>
      <media-time-range></media-time-range>
      <media-fullscreen-button></media-fullscreen-button>
    </media-control-bar>
  </media-controller>
</template>
```

### Using the Theme with Custom Content

```html
<media-theme template="my-custom-theme">
  <!-- Required: media element -->
  <video slot="media" src="video.mp4"></video>
  
  <!-- Optional: override the watermark -->
  <div slot="watermark" class="my-watermark">
    © 2024 My Company
  </div>
  
  <!-- Optional: add a call-to-action -->
  <a slot="cta" href="/subscribe" class="cta-button">
    Subscribe Now!
  </a>
</media-theme>
```

## Creating Components with Custom Slots

If you're building your own custom components based on Media Chrome, you can follow the same pattern:

### 1. Define Slots in Your Component

```javascript
const template = document.createElement('template');
template.innerHTML = `
  <style>
    /* Component styles */
  </style>
  
  <!-- Default slot with fallback content -->
  <slot name="custom-placeholder">
    <div class="default-content">Default Content</div>
  </slot>
`;

class MyCustomComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }
}

customElements.define('my-custom-component', MyCustomComponent);
```

### 2. Export the Component

```javascript
// Export for client use
export { MyCustomComponent };
export default MyCustomComponent;
```

### 3. Document Available Slots

Make sure to document the slots your component exposes:

```javascript
/**
 * @slot custom-placeholder - Slot for custom content
 * 
 * @cssproperty --my-custom-color - Custom color property
 */
class MyCustomComponent extends HTMLElement {
  // ...
}
```

## Best Practices

### 1. Provide Sensible Defaults

Always provide default content in your slots so components work out of the box:

```html
<slot name="icon">
  <!-- Default icon SVG -->
  <svg>...</svg>
</slot>
```

### 2. Use Descriptive Slot Names

Choose clear, semantic names for your slots:

✅ Good: `play`, `pause`, `watermark`, `cta`  
❌ Bad: `slot1`, `slot2`, `content`

### 3. Document All Slots

Document every slot your component exposes, including:
- Slot name
- Purpose/use case
- Expected content type
- Whether it's required or optional

### 4. Group Related Slots

For components with multiple states, group related slots:

```html
<!-- Grouped by state -->
<slot name="play">Play Icon</slot>
<slot name="pause">Pause Icon</slot>

<!-- Or use a single slot for state management -->
<slot name="icon">Icon that changes with state</slot>
```

### 5. Support Both Slots and Attributes

For simple customization, provide both slot and attribute-based APIs:

```html
<!-- Via slot -->
<media-poster-image slot="poster">
  <img src="poster.jpg">
</media-poster-image>

<!-- Via attribute -->
<media-poster-image
  src="poster.jpg"
  placeholdersrc="blur-hash-data-url"
></media-poster-image>
```

## Common Patterns

### Pattern 1: State-Based Slots

Components with different states expose slots for each state:

```html
<media-play-button>
  <span slot="play">Play</span>    <!-- Shown when paused -->
  <span slot="pause">Pause</span>   <!-- Shown when playing -->
</media-play-button>
```

### Pattern 2: Placeholder + Main Content

Load a placeholder while main content loads:

```html
<media-poster-image
  src="high-res-poster.jpg"
  placeholdersrc="low-res-blur-hash"
></media-poster-image>
```

### Pattern 3: Forwarding Slots

Themes forward slots from parent to child components:

```html
<template id="theme">
  <media-controller>
    <!-- Forward media slot -->
    <slot name="media" slot="media"></slot>
  </media-controller>
</template>
```

### Pattern 4: Multiple Customization Levels

Provide slots at multiple levels for fine-grained control:

```html
<!-- Theme level -->
<slot name="controls">
  <!-- Component level -->
  <media-play-button>
    <!-- Icon level -->
    <slot name="play">Default Icon</slot>
  </media-play-button>
</slot>
```

## Troubleshooting

### Slot Content Not Showing

**Problem:** Your custom content isn't appearing in the slot.

**Solutions:**
1. Check the slot name matches exactly (case-sensitive)
2. Ensure the slotted element is a direct child of the component
3. Verify the component's Shadow DOM is set up correctly

### Multiple Elements in One Slot

**Problem:** You want to put multiple elements in a single slot.

**Solution:** Wrap them in a container:

```html
<media-play-button>
  <div slot="play">
    <img src="icon.svg">
    <span>Play Video</span>
  </div>
</media-play-button>
```

### Styling Slotted Content

**Problem:** Your styles aren't applying to slotted content.

**Solution:** Remember that slotted content lives in the light DOM, so style it from the parent document:

```css
/* In your page's CSS, not component CSS */
media-play-button [slot="play"] {
  color: red;
}
```

## Examples

For live examples demonstrating these patterns, see:

- [Custom Placeholders Example](/examples/vanilla/custom-placeholders.html)
- [Slots Demo](/examples/vanilla/slots-demo.html)
- [Custom Slots in Themes](/docs/en/themes/custom-slots)

## Related Documentation

- [Web Components: Using Slots (MDN)](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_templates_and_slots)
- [Media Chrome Themes](/docs/en/themes/)
- [Component Reference](/docs/en/components/)
