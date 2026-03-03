# How Custom Placeholders Work in Media Chrome

## Summary

This implementation demonstrates how Media Chrome components use the Web Components **slot mechanism** to expose customization points (placeholders) that clients can override.

## The Pattern

### 1. Component Definition (In media-chrome library)

Components define slots in their Shadow DOM with default content:

```javascript
// Example from media-play-button.ts
const slotTemplate = document.createElement('template');
slotTemplate.innerHTML = `
  <slot name="icon">
    <slot name="play">${playIcon}</slot>
    <slot name="pause">${pauseIcon}</slot>
  </slot>
`;
```

**What this does:**
- Defines named slots: `icon`, `play`, `pause`
- Provides default content (SVG icons)
- Encapsulates implementation in Shadow DOM

### 2. Component Export (In media-chrome library)

```javascript
export { MediaPlayButton };
export default MediaPlayButton;
```

**What this does:**
- Makes the component available for clients to import
- Published as npm package: `media-chrome`

### 3. Client Integration

Clients import and use the components:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/media-chrome@4/+esm"></script>

<!-- Default usage - uses built-in icons -->
<media-play-button></media-play-button>
```

### 4. Client Customization (Override Placeholders)

Clients can override slots with custom content:

```html
<!-- Custom text -->
<media-play-button>
  <span slot="play">Start</span>
  <span slot="pause">Stop</span>
</media-play-button>

<!-- Custom icons -->
<media-play-button>
  <svg slot="play"><!-- custom play icon --></svg>
  <svg slot="pause"><!-- custom pause icon --></svg>
</media-play-button>
```

**What happens:**
- Browser's slot mechanism projects client's content into component's Shadow DOM
- Component functionality remains intact
- Visual appearance is customized

## Real-World Example: Theme with Custom Slots

### Library Author Creates Theme

```html
<!-- In library: define a theme with custom slots -->
<template id="branded-theme">
  <media-controller>
    <!-- Standard media slot -->
    <slot name="media" slot="media"></slot>
    
    <!-- Custom watermark slot with default -->
    <slot name="watermark" slot="centered-chrome">
      <div class="default-watermark">Media Chrome</div>
    </slot>
    
    <!-- Custom CTA slot (empty by default) -->
    <slot name="cta" slot="top-chrome"></slot>
    
    <media-control-bar>
      <media-play-button></media-play-button>
      <media-time-range></media-time-range>
    </media-control-bar>
  </media-controller>
</template>
```

### Client Uses Theme with Custom Content

```html
<media-theme template="branded-theme">
  <!-- Required: media element -->
  <video slot="media" src="video.mp4"></video>
  
  <!-- Optional: override watermark -->
  <div slot="watermark" class="my-brand">
    © 2024 My Company
  </div>
  
  <!-- Optional: add call-to-action -->
  <a slot="cta" href="/subscribe" class="promo">
    Subscribe Now! 50% Off
  </a>
</media-theme>
```

## Benefits of This Approach

1. **Flexibility**: Clients can customize appearance without modifying library code
2. **Encapsulation**: Component logic stays protected in Shadow DOM
3. **Standards-based**: Uses native Web Components slots
4. **Progressive enhancement**: Works with defaults, customizable when needed
5. **Framework-agnostic**: Works with vanilla JS, React, Angular, Vue, etc.

## Files Added

1. **`examples/vanilla/custom-placeholders.html`**
   - 5 interactive examples showing the pattern in action
   - Demonstrates component-level and theme-level customization
   - Shows text, SVG, and complex content overrides

2. **`docs/src/pages/docs/en/custom-placeholders-guide.md`**
   - Comprehensive guide with detailed explanations
   - Best practices and troubleshooting
   - Multiple patterns and use cases

3. **`CUSTOM_PLACEHOLDERS.md`**
   - Quick reference for developers
   - Code snippets for common scenarios
   - Component slots reference table

4. **`README.md` (updated)**
   - Added link to Custom Placeholders Guide

## How to Use

### For Library Users (Clients)

1. **Use defaults:**
   ```html
   <media-play-button></media-play-button>
   ```

2. **Override when needed:**
   ```html
   <media-play-button>
     <span slot="play">▶ Play</span>
   </media-play-button>
   ```

### For Library Developers

1. **Define slots in components:**
   ```javascript
   template.innerHTML = `
     <slot name="custom-slot">Default Content</slot>
   `;
   ```

2. **Document slots:**
   ```javascript
   /**
    * @slot custom-slot - Description of what goes here
    */
   ```

3. **Export component:**
   ```javascript
   export { MyComponent };
   ```

## Components with Slots

- `media-play-button`: `play`, `pause`, `icon`
- `media-mute-button`: `mute`, `unmute`, `icon`
- `media-fullscreen-button`: `enter`, `exit`, `icon`
- `media-controller`: `media`, `poster`, `centered-chrome`, `top-chrome`, `middle-chrome`
- `media-poster-image`: `placeholdersrc` attribute for blur hash
- `media-theme`: Custom slots defined in your template

## Next Steps

- View the [interactive examples](./examples/vanilla/custom-placeholders.html)
- Read the [full documentation](./docs/src/pages/docs/en/custom-placeholders-guide.md)
- Check the [quick reference](./CUSTOM_PLACEHOLDERS.md)
- Explore the [slots demo](./examples/vanilla/slots-demo.html)

## Questions Answered

> "Tell me how it will work if I want to add custom placeholder so that client can override it."

**Answer:** 
1. Define named `<slot>` elements in your component's Shadow DOM template
2. Provide default content inside the slots
3. Export your component
4. Clients add elements with `slot="name"` attributes as children of your component
5. Browser automatically projects client content into your component's slots
6. Result: Client gets customization, you maintain control of logic

This is the standard Web Components pattern that Media Chrome uses throughout its component library!
