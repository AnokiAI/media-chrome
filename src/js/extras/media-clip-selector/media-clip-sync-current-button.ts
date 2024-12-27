import { MediaChromeButton } from '../../media-chrome-button.js';
import { globalThis, document } from '../../utils/server-safe-globals.js';
import { getNumericAttr, setNumericAttr } from '../../utils/element-utils.js';
import { MediaUIEvents, MediaUIAttributes } from '../../constants.js';
import { tooltipLabels,verbs } from '../../labels/labels.js';
import { getBooleanAttr, setBooleanAttr } from '../../utils/element-utils.js';

export const MediaClipButtonAttributes = {
  MEDIA_CLIP_EDGE: 'mediaclipedge',
};

const syncLeftIcon = `
<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#5f6368">
	<path d="M360-144v-672h72v672h-72Zm144-144v-384l192 192-192 192Z"/>
</svg>
`;
const syncRightIcon = `
<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#5f6368">
  <path d="M456-288v-384L264-480l192 192Zm72 144h72v-672h-72v672Z"/>
</svg>
`

const slotTemplate = document.createElement('template');
slotTemplate.innerHTML = /*html*/ `
  <style>
    :host([${MediaClipButtonAttributes.MEDIA_CLIP_EDGE}=start]) slot[name=right],
    :host([${MediaClipButtonAttributes.MEDIA_CLIP_EDGE}=end]) slot[name=left] {
      display: none !important;
    }

    :host([${MediaClipButtonAttributes.MEDIA_CLIP_EDGE}=start]) slot[name=tooltip-right],
    :host([${MediaClipButtonAttributes.MEDIA_CLIP_EDGE}=end]) slot[name=tooltip-left] {
      display: none;
    }
  </style>

	<slot name="icon">
    <slot name="left">${syncLeftIcon}</slot>
    <slot name="right">${syncRightIcon}</slot>
	</slot>
`;

const tooltipContent = /*html*/ `
  <slot name="tooltip-right">sync to end time</slot>
  <slot name="tooltip-left">sync to start time</slot>
`;

const updateAriaLabel = (el: any): void => {
  const label = el.mediaPaused ? verbs.PLAY() : verbs.PAUSE();
  el.setAttribute('aria-label', label);
};

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
 * @attr {string} mediacurrenttime - (read-only) Set to the media current time.
 * @attr {string} direction - (read-only) use left(start) or right (end) time.
 *
 * @cssproperty [--media-clip-button-display = inline-flex] - `display` property of button.
 * @cssproperty --media-clip-button-icon-color - `fill` and `color` of not live button icon.
 * @cssproperty --media-clip-button-indicator-color - `fill` and `color` of live button icon.
 */
class MediaClipSyncCurrentButton extends MediaChromeButton {
  static get observedAttributes(): string[] {
    return [
		  ...super.observedAttributes,
		  MediaUIAttributes.MEDIA_CURRENT_TIME,
			MediaUIAttributes.MEDIA_PAUSED
		];
  }

  constructor(options: object = {}) {
    super({ slotTemplate, ...options });
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
		if (attrName === MediaUIAttributes.MEDIA_PAUSED) {
      updateAriaLabel(this);
    }
    super.attributeChangedCallback(attrName, oldValue, newValue);
  }

	/**
   *
   */
  get mediaCurrentTime(): number | undefined {
    return getNumericAttr(this, MediaUIAttributes.MEDIA_DURATION);
  }

  set mediaCurrentTime(value: number | undefined) {
    setNumericAttr(this, MediaUIAttributes.MEDIA_DURATION, value);
  }

	/**
   * Is the media paused
   */
  get mediaPaused(): boolean {
    return getBooleanAttr(this, MediaUIAttributes.MEDIA_PAUSED);
  }

  set mediaPaused(value: boolean) {
    setBooleanAttr(this, MediaUIAttributes.MEDIA_PAUSED, value);
  }

	/*
  handleClick(): void {
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
  }
	*/
}

if (!globalThis.customElements.get('media-clip-sync-current-button')) {
  globalThis.customElements.define('media-clip-sync-current-button', MediaClipSyncCurrentButton);
}

export default MediaClipSyncCurrentButton;
