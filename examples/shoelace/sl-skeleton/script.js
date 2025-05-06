export const load = icons => Promise.all(['sl-skeleton', 'sl-tooltip', 'sl-color-picker', 'sl-radio-group'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  effect: 'none',
  radius: 10,
  color: 'tomato',
  sheenColor: '#ffb094'
}));