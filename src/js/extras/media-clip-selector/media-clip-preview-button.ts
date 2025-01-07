import { MediaChromeButton } from '../../media-chrome-button.js';
import { globalThis, document } from '../../utils/server-safe-globals.js';
import { getNumericAttr, setNumericAttr, getStringAttr } from '../../utils/element-utils.js';
import { MediaUIEvents, MediaUIAttributes } from '../../constants.js';
import { MediaClipUIAttributes } from './constants.js';
import { tooltipLabels,verbs } from '../../labels/labels.js';
import { getBooleanAttr, setBooleanAttr } from '../../utils/element-utils.js';

export const MediaClipButtonAttributes = {
  MEDIA_CLIP_EDGE: 'mediaclipedge',
};

const previewIcon = `
<svg height="100" viewBox="0 0 100 100" width="100" xmlns="http://www.w3.org/2000/svg"><g style="stroke:#fff;stroke-width:4;fill:none;fill-rule:evenodd;stroke-linecap:round;stroke-linejoin:round" transform="matrix(-1 0 0 1 98 2)"><circle cx="48" cy="48" r="48"/>
  <path d="m69 28v40h-12v-40z"/><path d="m56.2890625 48-28.2890625 20v-40z"/></g>
</svg>
`;

const slotTemplate = document.createElement('template');
slotTemplate.innerHTML = /*html*/ `
  <style>
		 .animate-spin {
		   animation: spin 1s linear infinite;
		 }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
  </style>

	<slot name="icon">${previewIcon}</slot>
`;

const tooltipContent = /*html*/ `
  <slot name="tooltip-preview">Preview the clip</slot>
`;

const updateAriaLabel = (el: any): void => {
  const label = el.mediaClipEdge;
  el.setAttribute('aria-label', label);
};

/**
 * @attr {string} mediacurrenttime - (read-only) Set to the media current time.
 * @attr {string} direction - (read-only) use left(start) or right (end) time.
 *
 * @cssproperty [--media-clip-button-display = inline-flex] - `display` property of button.
 * @cssproperty --media-clip-button-icon-color - `fill` and `color` of not live button icon.
 * @cssproperty --media-clip-button-indicator-color - `fill` and `color` of live button icon.
 */
class MediaClipPreviewButton extends MediaChromeButton {
  #playing: boolean;

  static get observedAttributes(): string[] {
    return [
		  ...super.observedAttributes,
			MediaUIAttributes.MEDIA_CURRENT_TIME,
		  MediaClipUIAttributes.MEDIA_CLIP_START_TIME,
		  MediaClipUIAttributes.MEDIA_CLIP_END_TIME,
		];
  }

  constructor(options: object = {}) {
    super({ slotTemplate, tooltipContent, ...options });
  }

  connectedCallback(): void {
	  updateAriaLabel(this);
    super.connectedCallback();
  }

  attributeChangedCallback(
    attrName: string,
    oldValue: string | null,
    newValue: string | null
  ): void {
		if (attrName === MediaUIAttributes.MEDIA_CURRENT_TIME) {
      this.checkShouldStop();
    }
    super.attributeChangedCallback(attrName, oldValue, newValue);
  }

	/**
   * The current time in seconds
   */
  get mediaCurrentTime(): number {
    return getNumericAttr(this, MediaUIAttributes.MEDIA_CURRENT_TIME);
  }

  set mediaCurrentTime(time: number) {
    setNumericAttr(this, MediaUIAttributes.MEDIA_CURRENT_TIME, time);
  }

	/**
   *
   */
	get clipStartTime(): number {
    return getNumericAttr(this, MediaClipUIAttributes.MEDIA_CLIP_START_TIME, 0);
  }

  set clipStartTime(value: number) {
    setNumericAttr(this, MediaClipUIAttributes.MEDIA_CLIP_START_TIME, value);
  }

  get clipEndTime(): number {
    return getNumericAttr(this, MediaClipUIAttributes.MEDIA_CLIP_END_TIME, 0);
  }

  set clipEndTime(value: number) {
    setNumericAttr(this, MediaClipUIAttributes.MEDIA_CLIP_END_TIME, value);
  }

  handleClick(): void {
		if (this.#playing) return;
		this.#playing = true;
		if (this.mediaCurrentTime != this.clipStartTime) {
			this.dispatchEvent(
        new globalThis.CustomEvent(MediaUIEvents.MEDIA_SEEK_REQUEST, {
          composed: true,
          bubbles: true,
          detail: this.clipStartTime,
        })
		  );
		}

    this.dispatchEvent(
      new globalThis.CustomEvent(MediaUIEvents.MEDIA_PLAY_REQUEST, { composed: true, bubbles: true })
    );

		// add animation
		const icon = this.shadowRoot.querySelector("svg");
    icon.classList.add("animate-spin");
  }

	checkShouldStop(): void {
	  if (!this.#playing) return;
		if (this.clipEndTime > 0 && this.mediaCurrentTime >= this.clipEndTime) {
			this.#playing = false;
      this.dispatchEvent(
        new globalThis.CustomEvent(MediaUIEvents.MEDIA_PAUSE_REQUEST, { composed: true, bubbles: true })
      );
		  // remove animation
	  	const icon = this.shadowRoot.querySelector("svg");
      icon.classList.remove("animate-spin");
		}
	}
}

if (!globalThis.customElements.get('media-clip-preview-button')) {
  globalThis.customElements.define('media-clip-preview-button', MediaClipPreviewButton);
}

export default MediaClipPreviewButton;
