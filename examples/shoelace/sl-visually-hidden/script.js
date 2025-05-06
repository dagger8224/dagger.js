export const load = icons => Promise.all(['sl-visually-hidden', 'sl-switch'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  exist: true,
  content: 'opens in a new window'
}));