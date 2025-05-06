export const load = icons => Promise.all(['sl-relative-time', 'sl-input', 'sl-switch', 'sl-radio-group'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  date: new Date(),
  format: 'long',
  numeric: 'auto',
  lang: 'en-US',
  sync: true
}));