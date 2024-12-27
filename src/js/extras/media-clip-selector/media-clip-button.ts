import { MediaChromeButton } from '../../media-chrome-button.js';
import { globalThis, document } from '../../utils/server-safe-globals.js';
import { getNumericAttr, setNumericAttr } from '../../utils/element-utils.js';
import { MediaUIEvents, MediaUIAttributes } from '../../constants.js';
import { verbs } from '../../labels/labels.js';
import { getBooleanAttr, setBooleanAttr } from '../../utils/element-utils.js';

export const Attributes = {
  MEDIA_CLIP_START_TIME: 'mediaclipstarttime',
  MEDIA_CLIP_END_TIME : 'mediaclipendtime',	
};

const clipIcon = `
<svg slot="icon" viewBox="0 -960 960 960" fill="#5f6368">
  <use class="svg-shadow" xlink:href="#clip-icon"></use>
  <path
    id="clip-icon"
    d="M744-144 480-407l-87 88q8 16 11.5 32.85 3.5 16.86 3.5 33.71 0 65.44-45 110.94T252-96q-64.35 0-110.18-45.5Q96-187 96-252t45.5-110.5Q187-408 252.44-408q16.85 0 33.71 4Q303-400 319-392l88-87-88-88q-16 8-32.85 11.5-16.86 3.5-33.71 3.5-65.44 0-110.94-45.5T96-708q0-65 45.5-110.5T252-864q65 0 110.5 45.5T408-707.56q0 16.85-3.5 33.71Q401-657 393-641l471 469v28H744ZM595-520l-74-74 223-222h120v28L595-520ZM252.25-624q34.75 0 59.25-24.75t24.5-59.5q0-34.75-24.75-59.25t-59.5-24.5q-34.75 0-59.25 24.75t-24.5 59.5q0 34.75 24.75 59.25t59.5 24.5ZM480-456q9.6 0 16.8-7.2 7.2-7.2 7.2-16.8 0-9.6-7.2-16.8-7.2-7.2-16.8-7.2-9.6 0-16.8 7.2-7.2 7.2-7.2 16.8 0 9.6 7.2 16.8 7.2 7.2 16.8 7.2ZM252.25-168q34.75 0 59.25-24.75t24.5-59.5q0-34.75-24.75-59.25t-59.5-24.5q-34.75 0-59.25 24.75t-24.5 59.5q0 34.75 24.75 59.25t59.5 24.5Z"
  />
</svg>
`;

const slotTemplate = document.createElement('template');
slotTemplate.innerHTML = /*html*/ `
  <style>
  :host { --media-tooltip-display: none; }
  
  </style>

  <slot name="icon">${clipIcon}</slot>
`;

/*const updateAriaAttributes = (el: MediaClipButton): void => {
  const isPausedOrNotLive = el.mediaPaused || !el.mediaTimeIsLive;
  const label = isPausedOrNotLive ? verbs.SEEK_LIVE() : verbs.PLAYING_LIVE();

  el.setAttribute('aria-label', label);

  isPausedOrNotLive
    ? el.removeAttribute('aria-disabled')
    : el.setAttribute('aria-disabled', 'true');
};
*/

/**
 * @attr {string} mediaduration - (read-only) Set to the media duration.
 * @attr {string} clipStartTime - 
 * @attr {string} clipEndTime - 
 *
 * @cssproperty [--media-clip-button-display = inline-flex] - `display` property of button.
 * @cssproperty --media-cliplive-button-icon-color - `fill` and `color` of not live button icon.
 * @cssproperty --media-cliplive-button-indicator-color - `fill` and `color` of live button icon.
 */
class MediaClipButton extends MediaChromeButton {
  static get observedAttributes(): string[] {
    return [
		  ...super.observedAttributes,
		  MediaUIAttributes.MEDIA_DURATION,
			Attributes.MEDIA_CLIP_START_TIME,
			Attributes.MEDIA_CLIP_END_TIME
		];
  }

  constructor(options: object = {}) {
    super({ slotTemplate, ...options });
  }

  connectedCallback(): void {
    //updateAriaAttributes(this);
		this.clipStartTime = getNumericAttr(
      this,
      Attributes.MEDIA_CLIP_START_TIME,
      0
    );
		this.clipEndTime = getNumericAttr(
      this,
      Attributes.MEDIA_CLIP_END_TIME,
      0
    );
    super.connectedCallback();
  }

  attributeChangedCallback(
    attrName: string,
    oldValue: string | null,
    newValue: string | null
  ): void {
		if (attrName === Attributes.MEDIA_CLIP_START_TIME) {
		  this.clipStartTime = getNumericAttr(        
        this,                                     
        Attributes.MEDIA_CLIP_START_TIME,         
        0                                         
      );        
		}
		if (attrName === Attributes.MEDIA_CLIP_END_TIME) {
		  this.clipEndTime = getNumericAttr(        
        this,                                     
        Attributes.MEDIA_CLIP_END_TIME,         
        0                                         
      );        
		}
    super.attributeChangedCallback(attrName, oldValue, newValue);
    //updateAriaAttributes(this);
  }

	/**
   *
   */
  get mediaDuration(): number | undefined {
    return getNumericAttr(this, MediaUIAttributes.MEDIA_DURATION);
  }

  set mediaDuration(value: number | undefined) {
    setNumericAttr(this, MediaUIAttributes.MEDIA_DURATION, value);
  }

	/**
   * 
   */
  get clipStartTime(): number {
    return getNumericAttr(this, Attributes.MEDIA_CLIP_START_TIME, 0);
  }

  set clipStartTime(value: number) {
    setNumericAttr(this, Attributes.MEDIA_CLIP_START_TIME, value);
  }

  get clipEndTime(): number {
    return getNumericAttr(this, Attributes.MEDIA_CLIP_END_TIME, 0);
  }

  set clipEndTime(value: number) {
    setNumericAttr(this, Attributes.MEDIA_CLIP_END_TIME, value);
  }

  handleClick(): void {
    // If we're live and not paused, don't allow seek to live
    //if (!this.mediaPaused && this.mediaTimeIsLive) return;
		setBooleanAttr(this, 'disabled', true);

		/*
    this.dispatchEvent(
      new globalThis.CustomEvent('mediacliprequest', {
        composed: true,
        bubbles: true,
				detail: {
					startTime: this.clipStartTime,
				  endTime: this.clipEndTime,
				},
      })
    );
		*/
  }
}

if (!globalThis.customElements.get('media-clip-button')) {
  globalThis.customElements.define('media-clip-button', MediaClipButton);
}

export default MediaClipButton;
