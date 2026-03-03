---
title: Custom Placeholders Guide
description: Complete guide to understanding and implementing custom placeholders in Media Chrome
layout: ../../../layouts/MainLayout.astro
---

# Custom Placeholders Guide

Media Chrome uses Web Components' [slot mechanism](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_templates_and_slots) to allow clients to customize and override default content. This guide explains how the custom placeholder system works from both the client and component developer perspectives.

## Overview

**Custom placeholders** in Media Chrome are implemented using **named slots** in the Shadow DOM. This pattern allows:

- **Clients** to override default icons, text, or entire UI sections
- **Component developers** to define customization points in their components
- **Light DOM** content to be styled by the client's CSS while still being integrated into the component's Shadow DOM

## How It Works

### Architecture

When a component defines a slot, it creates a "placeholder" that can accept client content:

```html
<!-- Component's Shadow DOM template -->
<slot name="icon">
  <!-- Default content shown if client doesn't provide custom content -->
  <svg>...</svg>
</slot>
```

Clients can then override this placeholder by providing an element with a matching `slot` attribute:

```html
<!-- Client's usage -->
<media-play-button>
  <img slot="icon" src="my-custom-icon.png" />
</media-play-button>
```

### Key Concepts

1. **Slotted content exists in the Light DOM** - This means client CSS can style it directly
2. **Slots can be nested** - Allows hierarchical customization (e.g., `icon` slot containing `play` and `pause` slots)
3. **Conditional visibility** - CSS in Shadow DOM controls which slot is visible based on component state

## For Clients: Using Custom Placeholders

### Basic Usage

Most Media Chrome components expose slots for customization. Check each component's documentation for available slots.

#### Example: Customizing Play Button Icons

```html
<media-controller>
  <video slot="media" src="video.mp4"></video>
  
  <!-- Use separate slots for play and pause states -->
  <media-play-button>
    <span slot="play">▶️ Play</span>
    <span slot="pause">⏸️ Pause</span>
  </media-play-button>
</media-controller>
```

#### Example: Using a Single Animated Icon

```html
<media-controller>
  <video slot="media" src="video.mp4"></video>
  
  <!-- Use the icon slot for a single element that represents both states -->
  <media-play-button>
    <svg slot="icon" class="animated-icon">
      <!-- Your custom animated SVG -->
    </svg>
  </media-play-button>
</media-controller>
```

### Finding Available Slots

Check the component's documentation or source code for `@slot` JSDoc comments:

```typescript
/**
 * @slot play - An element shown when media is paused
 * @slot pause - An element shown when media is playing
 * @slot icon - An element for representing both states
 */
```

### Styling Slotted Content

Since slotted content lives in the Light DOM, you can style it with regular CSS:

```css
/* Style your custom icons */
media-play-button [slot="play"] {
  color: green;
  font-size: 24px;
}

media-play-button [slot="pause"] {
  color: red;
  font-size: 24px;
}
```

## For Component Developers: Adding Custom Placeholders

### Step 1: Define Slots in Your Template

Create slots in your component's Shadow DOM template:

```typescript
const slotTemplate = document.createElement('template');
slotTemplate.innerHTML = `
  <style>
    /* Control slot visibility based on component state */
    :host([mediapaused]) slot[name=pause],
    :host(:not([mediapaused])) slot[name=play] {
      display: none !important;
    }
  </style>

  <!-- Outer slot for complete replacement -->
  <slot name="icon">
    <!-- Inner slots for state-specific customization -->
    <slot name="play">
      <!-- Default play icon SVG -->
    </slot>
    <slot name="pause">
      <!-- Default pause icon SVG -->
    </slot>
  </slot>
`;
```

### Step 2: Document Your Slots

Use JSDoc `@slot` tags to document available slots:

```typescript
/**
 * @slot icon - An element for representing both play and pause states
 * @slot play - An element shown when the media is paused
 * @slot pause - An element shown when the media is playing
 */
class MediaPlayButton extends MediaChromeButton {
  // ...
}
```

### Step 3: Attach the Template

In your component's constructor or `connectedCallback`:

```typescript
class MediaPlayButton extends MediaChromeButton {
  constructor() {
    super({ slotTemplate });
  }
}
```

### Design Patterns

#### Hierarchical Slots

Provide both complete replacement and granular customization:

```html
<!-- Template design -->
<slot name="icon">
  <slot name="play">${defaultPlayIcon}</slot>
  <slot name="pause">${defaultPauseIcon}</slot>
</slot>
```

This allows clients to either:
- Replace the entire icon: `<svg slot="icon">...</svg>`
- Replace individual states: `<svg slot="play">...</svg>`

#### State-Based Visibility

Use CSS to show/hide slots based on component attributes:

```css
/* Hide pause slot when media is paused */
:host([mediapaused]) slot[name=pause] {
  display: none !important;
}

/* Hide play slot when media is playing */
:host(:not([mediapaused])) slot[name=play] {
  display: none !important;
}
```

#### Multiple State Variations

For components with many states (e.g., volume levels):

```html
<slot name="icon">
  <slot name="off">${volumeOffIcon}</slot>
  <slot name="low">${volumeLowIcon}</slot>
  <slot name="medium">${volumeMediumIcon}</slot>
  <slot name="high">${volumeHighIcon}</slot>
</slot>
```

```css
:host([mediavolumelevel="off"]) slot[name=low],
:host([mediavolumelevel="off"]) slot[name=medium],
:host([mediavolumelevel="off"]) slot[name=high] {
  display: none !important;
}

:host([mediavolumelevel="low"]) slot[name=off],
:host([mediavolumelevel="low"]) slot[name=medium],
:host([mediavolumelevel="low"]) slot[name=high] {
  display: none !important;
}

/* ... similar for medium and high */
```

## Best Practices

### For Clients

1. **Check documentation first** - Review available slots before customizing
2. **Keep accessibility in mind** - Ensure custom content is accessible
3. **Test in different states** - Verify your custom content works in all component states
4. **Use semantic HTML** - Prefer appropriate HTML elements over generic `<div>`/`<span>`

### For Component Developers

1. **Document all slots** - Always use `@slot` JSDoc comments
2. **Provide sensible defaults** - Default content should work well without customization
3. **Use semantic slot names** - Names should clearly indicate purpose (e.g., `play`, `pause`, not `slot1`, `slot2`)
4. **Consider hierarchies** - Offer both complete and granular customization when appropriate
5. **Use `!important` for visibility** - Ensures state-based display rules can't be accidentally overridden
6. **Test with custom content** - Verify that custom slotted content works as expected

## Common Patterns

### Theme Customization

Create custom slots in themes to allow further customization:

```html
<template id="my-theme">
  <media-controller>
    <slot name="media" slot="media"></slot>
    <slot name="cta" slot="centered-chrome"></slot>
    <media-control-bar>
      <media-play-button></media-play-button>
      <!-- other controls -->
    </media-control-bar>
  </media-controller>
</template>

<media-theme template="my-theme">
  <video slot="media" src="video.mp4"></video>
  <a slot="cta" href="/subscribe" class="button">Subscribe!</a>
</media-theme>
```

### Layout Slots

Components can define layout slots for positioning:

```html
<!-- media-controller offers multiple layout slots -->
<media-controller>
  <video slot="media" src="video.mp4"></video>
  
  <div slot="top-chrome">
    <!-- Content positioned at top -->
  </div>
  
  <div slot="centered-chrome">
    <!-- Content centered over video -->
  </div>
  
  <media-control-bar>
    <!-- Default slot (bottom chrome) -->
  </media-control-bar>
</media-controller>
```

## Examples

### Complete Example: Custom Mute Button

#### Client Usage

```html
<media-controller>
  <audio slot="media" src="audio.mp3"></audio>
  
  <media-mute-button>
    <!-- Custom icons for different volume levels -->
    <span slot="high">🔊</span>
    <span slot="medium">🔉</span>
    <span slot="low">🔈</span>
    <span slot="off">🔇</span>
  </media-mute-button>
</media-controller>
```

#### Component Implementation (Reference)

```typescript
const slotTemplate = document.createElement('template');
slotTemplate.innerHTML = `
  <style>
    :host([mediavolumelevel="high"]) slot[name=off],
    :host([mediavolumelevel="high"]) slot[name=low],
    :host([mediavolumelevel="high"]) slot[name=medium] {
      display: none !important;
    }
    /* ... similar rules for other states ... */
  </style>

  <slot name="icon">
    <slot name="high">${volumeHighIcon}</slot>
    <slot name="medium">${volumeMediumIcon}</slot>
    <slot name="low">${volumeLowIcon}</slot>
    <slot name="off">${volumeOffIcon}</slot>
  </slot>
`;

/**
 * @slot icon - An element for representing all volume states
 * @slot high - An element shown when volume is high
 * @slot medium - An element shown when volume is medium
 * @slot low - An element shown when volume is low
 * @slot off - An element shown when volume is off/muted
 */
class MediaMuteButton extends MediaChromeButton {
  constructor() {
    super({ slotTemplate });
  }
}
```

## Related Documentation

- [Custom Slots in Themes](./themes/custom-slots.md)
- [Component Styling](./styling.mdx)
- [Media Controller Slots](./components/media-controller.md)
- [Custom Placeholders Example](/examples/vanilla/custom-placeholders.html)
- [Slots Demo Example](/examples/vanilla/slots-demo.html)

## Further Reading

- [MDN: Using templates and slots](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_templates_and_slots)
- [MDN: slot element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot)
- [Web Components Best Practices](https://web.dev/articles/custom-elements-best-practices)
