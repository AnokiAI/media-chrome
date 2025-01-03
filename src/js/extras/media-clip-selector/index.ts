import { globalThis, document } from '../../utils/server-safe-globals.js';
import { MediaUIEvents, MediaUIAttributes } from '../../constants.js';
import { formatTime } from '../../utils/time.js';
import '../../media-preview-time-display.js';

//export * as constants from './constants.js';

const template: HTMLTemplateElement = document.createElement('template');

const HANDLE_W = 8;

const Z = {
  100: 100,
  200: 200,
  300: 300,
};

function lockBetweenZeroAndOne(num: number): number {
  return Math.max(0, Math.min(1, num));
}

template.innerHTML = `
  <style>
    :host {
      --_media-range-padding: var(--media-range-padding, var(--media-control-padding, 10px));
      display: inline-flex;
      align-items: center;
      ${
        /* Don't horizontal align w/ justify-content! #container can go negative on the x-axis w/ small width. */ ''
      }
      vertical-align: middle;
      box-sizing: border-box;
    }

    #selectorContainer {
      background-color: transparent;
      height: 44px;
      width: 100%;
      display: flex;
      position: relative;
    }

    #timeline {
      width: var(--media-range-track-width, 100%);
      height: 10px;
      background: #ccc;
      position: absolute;
      top: 16px;
      z-index: ${Z['100']};
    }

    #startHandle, #endHandle {
      cursor: pointer;
      height: 80%;
      width: ${HANDLE_W}px;
      border-radius: 4px;
      background-color: royalblue;
    }

    #playhead {
      height: 100%;
      width: 3px;
      background-color: #aaa;
      position: absolute;
      display: none;
      z-index: ${Z['300']};
    }

    #selection {
      display: flex;
      z-index: ${Z['200']};
      width: 100%;
      height: 100%;
      align-items: center;
    }

    #leftTrim {
      width: 0%;
    }

    #spacer {
      flex: 1;
      background-color: cornflowerblue;
      height: 40%;
    }

    #wrapper {
      padding-left: var(--media-range-padding-left, var(--_media-range-padding));
      padding-right: var(--media-range-padding-right, var(--_media-range-padding));
      width: 100%;
    }

    #thumbnailContainer {
      display: none;
      position: absolute;
      top: 0;
    }

    media-preview-thumbnail {
      position: absolute;
      bottom: 10px;
      border: 2px solid #fff;
      border-radius: 2px;
      background-color: #000;
      width: 160px;
      height: 90px;

      /* Negative offset of half to center on the handle */
      margin-left: -80px;
    }

    /* Can't get this working. Trying a downward triangle. */
    /* media-preview-thumbnail::after {
      content: "";
      display: block;
      width: 300px;
      height: 300px;
      margin: 100px;
      background-color: #ff0;
    } */

    :host(:hover) #thumbnailContainer.enabled {
      display: block;
      animation: fadeIn ease 0.5s;
    }

    #preview-rail {
      display: flex;
      align-content: center;
      justify-content: center;
      width: 100%;
      position: relative;
      left: 0;
      bottom: 50%;
      pointer-events: none;
      will-change: transform;
    }
    #endHandle > #preview-rail {
      bottom: 100%;
    }

    ::slotted(media-preview-time-display),
      #mediaTimeDisplayClipStart,
      #mediaTimeDisplayClipEnd {
      font-size: var(--media-font-size, 13px);
      color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
      line-height: 17px;
      min-width: 0;
      ${
        /* delay changing these CSS props until the preview box transition is ended */ ''
      }
      transition: min-width 0s, border-radius 0s;
      transition-delay: calc(var(--media-preview-transition-delay-out, 0s) + var(--media-preview-transition-duration-out, .25s));
      background: var(--media-preview-time-background, var(--_preview-background));
      border-radius: var(--media-preview-time-border-radius,
        var(--media-preview-border-radius) var(--media-preview-border-radius)
        var(--media-preview-border-radius) var(--media-preview-border-radius));
      padding: var(--media-preview-time-padding, 3.5px 9px);
      margin: var(--media-preview-time-margin, 0);
      text-shadow: var(--media-preview-time-text-shadow, 0 0 4px rgb(0 0 0 / .75));
      transform: translateX(min(
        max(calc(50% - var(--_box-width) / 2),
        calc(var(--_box-shift, 0))),
        calc(var(--_box-width) / 2 - 50%)
      ));
    }

    @keyframes fadeIn {
      0% {
        /* transform-origin: bottom center; */
        /* transform: scale(0.7); */
        margin-top: 10px;
        opacity: 0;
      }
      100% {
        /* transform-origin: bottom center; */
        /* transform: scale(1); */
        margin-top: 0;
        opacity: 1;
      }
    }
  </style>
  <div id="thumbnailContainer">
    <media-preview-thumbnail></media-preview-thumbnail>
  </div>
  <div id="wrapper">
    <div id="selectorContainer">
      <div id="timeline"></div>
      <div id="playhead"></div>
      <div id="leftTrim"></div>
      <div id="selection">
        <div id="startHandle">
          <div id="preview-rail">
            <slot id="mediaTimeDisplayClipStart"></slot>
          </div>
        </div>
        <div id="spacer"></div>
        <div id="endHandle">
          <div id="preview-rail">
            <slot id="mediaTimeDisplayClipEnd"></slot>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

/**
 *
 */
class MediaClipSelector extends globalThis.HTMLElement {
  static get observedAttributes() {
    return [
      'thumbnails',
      MediaUIAttributes.MEDIA_DURATION,
      MediaUIAttributes.MEDIA_CURRENT_TIME,
    ];
  }

  draggingEl: HTMLElement | null;
  wrapper: HTMLElement;
  selection: HTMLElement;
  playhead: HTMLElement;
  leftTrim: HTMLElement;
  spacerFirst: HTMLElement;
  startHandle: HTMLElement;
  spacerMiddle: HTMLElement;
  endHandle: HTMLElement;
  spacerLast: HTMLElement;
  initialX: number;
  thumbnailPreview: HTMLElement;
  mediaTimeDisplayClipStart: HTMLElement;
  mediaTimeDisplayClipEnd: HTMLElement;

  startTime: number;
  endTime: number;

  _clickHandler: () => void;
  _dragStart: () => void;
  _dragEnd: () => void;
  _drag: () => void;

  constructor() {
    super();

    if (!this.shadowRoot) {
      // Set up the Shadow DOM if not using Declarative Shadow DOM.
      this.attachShadow({ mode: 'open' });
      // @ts-ignore
      this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    this.draggingEl = null;

    this.wrapper = this.shadowRoot.querySelector('#selectorContainer');
    this.selection = this.shadowRoot.querySelector('#selection');
    this.playhead = this.shadowRoot.querySelector('#playhead');
    this.leftTrim = this.shadowRoot.querySelector('#leftTrim');
    this.spacerFirst = this.shadowRoot.querySelector('#spacerFirst');
    this.startHandle = this.shadowRoot.querySelector('#startHandle');
    this.spacerMiddle = this.shadowRoot.querySelector('#spacerMiddle');
    this.endHandle = this.shadowRoot.querySelector('#endHandle');
    this.spacerLast = this.shadowRoot.querySelector('#spacerLast');
    this.mediaTimeDisplayClipStart = this.shadowRoot.querySelector('#mediaTimeDisplayClipStart');
    this.mediaTimeDisplayClipEnd = this.shadowRoot.querySelector('#mediaTimeDisplayClipEnd');

    this._clickHandler = this.handleClick.bind(this);
    this._dragStart = this.dragStart.bind(this);
    this._dragEnd = this.dragEnd.bind(this);
    this._drag = this.drag.bind(this);

    this.wrapper.addEventListener('click', this._clickHandler, false);

    this.wrapper.addEventListener('touchstart', this._dragStart, false);
    globalThis.window?.addEventListener('touchend', this._dragEnd, false);
    this.wrapper.addEventListener('touchmove', this._drag, false);

    this.wrapper.addEventListener('mousedown', this._dragStart, false);
    globalThis.window?.addEventListener('mouseup', this._dragEnd, false);
    globalThis.window?.addEventListener('mousemove', this._drag, false);

    this.enableThumbnails();

    this.startTime = 0;
    this.endTime = this.mediaDuration || -1;
  }

  connectedCallback() {
    this.endTime = this.mediaDuration || -1;
  }

  get mediaDuration(): number {
    return +this.getAttribute(MediaUIAttributes.MEDIA_DURATION);
  }

  set mediaDuration(value: number) {
    const attrName = MediaUIAttributes.MEDIA_DURATION;
    const nextNumericValue = +value;

    // Treat null, undefined, and NaN as "nothing values", so unset if value is currently set.
    if (value == null || Number.isNaN(nextNumericValue)) {
      if (this.hasAttribute(attrName)) {
        this.removeAttribute(attrName);
      }
      return;
    }

    // if (getNumericAttr(el, attrName, undefined) === nextNumericValue) return;
    this.setAttribute(MediaUIAttributes.MEDIA_DURATION, `${nextNumericValue}`);
  }

  get mediaCurrentTime(): number {
    return +this.getAttribute(MediaUIAttributes.MEDIA_CURRENT_TIME);
  }

  set mediaCurrentTime(value: number) {
    const attrName = MediaUIAttributes.MEDIA_CURRENT_TIME
    const nextNumericValue = +value;

    // Treat null, undefined, and NaN as "nothing values", so unset if value is currently set.
    if (value == null || Number.isNaN(nextNumericValue)) {
      if (this.hasAttribute(attrName)) {
        this.removeAttribute(attrName);
      }
      return;
    }

    // if (getNumericAttr(el, attrName, undefined) === nextNumericValue) return;
    this.setAttribute(MediaUIAttributes.MEDIA_CURRENT_TIME, `${nextNumericValue}`);
  }

  /*
   * pass in a mouse event (evt.clientX)
   * calculates the percentage progress based on the bounding rectang
   * converts the percentage progress into a duration in seconds
   */
  getPlayheadBasedOnMouseEvent(evt: MouseEvent): number {
    const duration = this.mediaDuration;
    if (!duration) return;
    const mousePercent = lockBetweenZeroAndOne(this.getMousePercent(evt));
    return mousePercent * duration;
  }

  getXPositionFromMouse(evt: any): number {
    let clientX;

    if (['touchstart', 'touchmove'].includes(evt.type)) {
      clientX = evt.touches[0].clientX;
    }

    return clientX || evt.clientX;
  }

  getMousePercent(evt: MouseEvent): number {
    const rangeRect = this.wrapper.getBoundingClientRect();
    const mousePercent =
      (this.getXPositionFromMouse(evt) - rangeRect.left) / rangeRect.width;
    return lockBetweenZeroAndOne(mousePercent);
  }

  dragStart(evt: MouseEvent): void {
    if (evt.target === this.startHandle) {
      this.draggingEl = this.startHandle;
    }
    if (evt.target === this.endHandle) {
      this.draggingEl = this.endHandle;
    }

    this.initialX = this.getXPositionFromMouse(evt);
  }

  dragEnd(): void {
    this.initialX = null;
    this.draggingEl = null;
  }

  setSelectionWidth(selectionPercent: number, fullTimelineWidth: number): void {
    let percent = selectionPercent;

    const minWidthPx = HANDLE_W * -1;
    const minWidthPercent = lockBetweenZeroAndOne(
      minWidthPx / fullTimelineWidth
    );

    if (percent < minWidthPercent) {
      percent = minWidthPercent;
    }

    /*
     * The selection can never be smaller than the width
     * of 3 handles
    if (percent === 0) {
      percent = minWidthPercent;
    }
     */

    this.selection.style.width = `${percent * 100}%`;
  }

  drag(evt: MouseEvent): void {
    if (!this.draggingEl) {
      return;
    }
    evt.preventDefault();

    const rangeRect = this.wrapper.getBoundingClientRect();
    const fullTimelineWidth = rangeRect.width;

    const endXPosition = this.getXPositionFromMouse(evt);
    const xDelta = endXPosition - this.initialX;
    const percent = this.getMousePercent(evt);
    const selectionW = this.selection.getBoundingClientRect().width;

    /*
     * When dragging the start handle, change the leftTrim width
     * and the selection width
     */
    if (this.draggingEl === this.startHandle) {
      this.initialX = this.getXPositionFromMouse(evt);
      this.leftTrim.style.width = `${percent * 100}%`;

      const selectionPercent = lockBetweenZeroAndOne(
        (selectionW - xDelta) / fullTimelineWidth
      );
      this.setSelectionWidth(selectionPercent, fullTimelineWidth);
    }
    /*
     * When dragging the end handle all we need to do is change
     * the selection width
     */
    if (this.draggingEl === this.endHandle) {
      this.initialX = this.getXPositionFromMouse(evt);
      const selectionPercent = lockBetweenZeroAndOne(
        (selectionW + xDelta) / fullTimelineWidth
      );
      this.setSelectionWidth(selectionPercent, fullTimelineWidth);
    }
    this.dispatchUpdate();
  }

  updatePlayHandle(name: string, playHead: number): void {
    const rangeRect = this.wrapper.getBoundingClientRect();
    const fullTimelineWidth = rangeRect.width;
    if (this.endTime == -1) {
      this.endTime = this.mediaDuration
    }
    if (name === "start") {
      const percent = lockBetweenZeroAndOne(playHead/this.mediaDuration)
      this.leftTrim.style.width = `${percent * 100}%`;
      const selectionPercent = lockBetweenZeroAndOne(
        (this.endTime - playHead) / this.mediaDuration
      );
      this.setSelectionWidth(selectionPercent, fullTimelineWidth);
    }
    if (name === "end") {
      const selectionPercent = lockBetweenZeroAndOne(
        (playHead - this.startTime) / this.mediaDuration
      );
      this.setSelectionWidth(selectionPercent, fullTimelineWidth);
    }
    this.dispatchUpdate();
  }

  dispatchUpdate(): void {
    const detail = this.getCurrentClipBounds();
    const updateEvent = new CustomEvent('update', {
      detail: detail, //this.getCurrentClipBounds(),
    });
    this.startTime = detail.startTime;
    this.endTime = detail.endTime;

    this.mediaTimeDisplayClipStart.textContent = formatTime(this.startTime);
    this.mediaTimeDisplayClipEnd.textContent = formatTime(this.endTime);
    this.dispatchEvent(updateEvent);
  }

  getCurrentClipBounds(): { startTime: number; endTime: number } {
    const rangeRect = this.wrapper.getBoundingClientRect();
    const leftTrimRect = this.leftTrim.getBoundingClientRect();
    const selectionRect = this.selection.getBoundingClientRect();

    const percentStart = lockBetweenZeroAndOne(
      leftTrimRect.width / rangeRect.width
    );
    const percentEnd = lockBetweenZeroAndOne(
      (leftTrimRect.width + selectionRect.width) / rangeRect.width
    );

    /*
     * Currently we round to the nearest integer? Might want to change later to round to 1 or 2 decimails?
     */
    return {
      startTime: Math.round(percentStart * this.mediaDuration),
      endTime: Math.round(percentEnd * this.mediaDuration),
    };
  }

  isTimestampInBounds(timestamp: number): boolean {
    const { startTime, endTime } = this.getCurrentClipBounds();
    return startTime <= timestamp && endTime >= timestamp;
  }

  handleClick(evt: MouseEvent): void {
    const mousePercent = this.getMousePercent(evt);
    const timestampForClick = mousePercent * this.mediaDuration;

    /*
     * Clicking outside the selection (out of bounds), does not change the
     * currentTime of the underlying media, only clicking in bounds does that
     */
    if (this.isTimestampInBounds(timestampForClick)) {
      this.dispatchEvent(
        new globalThis.CustomEvent(MediaUIEvents.MEDIA_SEEK_REQUEST, {
          composed: true,
          bubbles: true,
          detail: timestampForClick,
        })
      );
    }
  }

  mediaCurrentTimeSet(): void {
    const percentComplete = lockBetweenZeroAndOne(
      this.mediaCurrentTime / this.mediaDuration
    );
    // const fullW = this.wrapper.getBoundingClientRect().width;
    // const progressW = percentComplete * fullW;

    this.playhead.style.left = `${percentComplete * 100}%`;
    this.playhead.style.display = 'block';

    /*
     * if paused, we don't need to do anything else, but if it is playing
     * we want to loop within the selection range
     */
    // @ts-ignore
    if (!this.mediaPaused) {
      const { startTime, endTime } = this.getCurrentClipBounds();

      if (
        this.mediaCurrentTime < startTime ||
        this.mediaCurrentTime > endTime
      ) {
        this.dispatchEvent(
          new globalThis.CustomEvent(MediaUIEvents.MEDIA_SEEK_REQUEST, {
            composed: true,
            bubbles: true,
            detail: startTime,
          })
        );
      }
    }
  }

  mediaUnsetCallback(media: HTMLVideoElement): void {
    // @ts-ignore
    super.mediaUnsetCallback(media);

    this.wrapper.removeEventListener('touchstart', this._dragStart);
    this.wrapper.removeEventListener('touchend', this._dragEnd);
    this.wrapper.removeEventListener('touchmove', this._drag);

    this.wrapper.removeEventListener('mousedown', this._dragStart);
    globalThis.window?.removeEventListener('mouseup', this._dragEnd);
    globalThis.window?.removeEventListener('mousemove', this._drag);
  }

  /*
   * This was copied over from media-time-range, we should have a way of making
   * this code shared between the two components
   */
  enableThumbnails(): void {
    /** @type {HTMLElement} */
    this.thumbnailPreview = this.shadowRoot.querySelector(
      'media-preview-thumbnail'
    );
    /** @type {HTMLElement} */
    const thumbnailContainer = this.shadowRoot.querySelector(
      '#thumbnailContainer'
    );
    thumbnailContainer.classList.add('enabled');

    let mouseMoveHandler;
    const trackMouse = () => {
      mouseMoveHandler = (evt) => {
        const duration = this.mediaDuration;

        // If no duration we can't calculate which time to show
        if (!duration) return;

        // Get mouse position percent
        const rangeRect = this.wrapper.getBoundingClientRect();
        const mousePercent = this.getMousePercent(evt);

        // Get thumbnail center position
        const leftPadding = rangeRect.left - this.getBoundingClientRect().left;
        const thumbnailLeft = leftPadding + mousePercent * rangeRect.width;

        this.thumbnailPreview.style.left = `${thumbnailLeft}px`;
        this.dispatchEvent(
          new globalThis.CustomEvent(MediaUIEvents.MEDIA_PREVIEW_REQUEST, {
            composed: true,
            bubbles: true,
            detail: mousePercent * duration,
          })
        );
      };
      globalThis.window?.addEventListener('mousemove', mouseMoveHandler, false);
    };

    const stopTrackingMouse = () => {
      globalThis.window?.removeEventListener('mousemove', mouseMoveHandler);
    };

    // Trigger when the mouse moves over the range
    let rangeEntered = false;
    const rangeMouseMoveHander = () => {
      if (!rangeEntered && this.mediaDuration) {
        rangeEntered = true;
        this.thumbnailPreview.style.display = 'block';
        trackMouse();

        const offRangeHandler = (evt) => {
          if (evt.target != this && !this.contains(evt.target)) {
            this.thumbnailPreview.style.display = 'none';
            globalThis.window?.removeEventListener(
              'mousemove',
              offRangeHandler
            );
            rangeEntered = false;
            stopTrackingMouse();
          }
        };
        globalThis.window?.addEventListener(
          'mousemove',
          offRangeHandler,
          false
        );
      }

      if (!this.mediaDuration) {
        this.thumbnailPreview.style.display = 'none';
      }
    };

    this.addEventListener('mousemove', rangeMouseMoveHander, false);
  }

  disableThumbnails(): void {
    const thumbnailContainer = this.shadowRoot.querySelector(
      '#thumbnailContainer'
    );
    thumbnailContainer.classList.remove('enabled');
  }
}

if (!globalThis.customElements.get('media-clip-selector')) {
  globalThis.customElements.define('media-clip-selector', MediaClipSelector);
}

export default MediaClipSelector;
