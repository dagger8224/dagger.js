export const load = icons => Promise.all(['sl-progress-ring', 'sl-tooltip', 'sl-color-picker', 'sl-input'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  value: 50,
  size: 100,
  trackWidth: 8,
  indicatorWidth: 10,
  trackColor: 'pink',
  indicatorColor: 'deeppink'
}));