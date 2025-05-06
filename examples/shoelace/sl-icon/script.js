export const load = icons => Promise.all(['sl-icon', 'sl-color-picker', 'sl-select', 'sl-input'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  name: 'gear',
  color: '#4a90e2ff',
  size: 20,
  icons: ['@invalid', ...icons.map((icon) => icon.name)],
  eventType: "N/A"
}));