export const load = icons => Promise.all(['sl-divider', 'sl-input', 'sl-tooltip', 'sl-color-picker', 'sl-switch'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  width: 2,
  spacing: 1,
  color: '#999999',
  vertical: false
}));