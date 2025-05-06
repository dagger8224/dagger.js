export const load = icons => Promise.all(['sl-qr-code', 'sl-input', 'sl-tooltip', 'sl-color-picker', 'sl-radio-group'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  value: 'https://shoelace.style/',
  fill: 'blue',
  background: 'transparent',
  size: 80,
  radius: 0.5,
  errorCorrection: 'H'
}));