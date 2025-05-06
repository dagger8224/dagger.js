export const load = icons => Promise.all(['sl-spinner', 'sl-tooltip', 'sl-color-picker', 'sl-input'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  size: 50,
  width: 6,
  speed: 1000,
  indicatorColor: 'deeppink',
  trackColor: 'pink'
}));