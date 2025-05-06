export const load = icons => Promise.all(['sl-progress-bar', 'sl-input', 'sl-switch'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  value: 50,
  height: 20,
  indeterminate: false
}));