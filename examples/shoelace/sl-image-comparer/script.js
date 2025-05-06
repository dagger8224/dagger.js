export const load = icons => Promise.all(['sl-image-comparer', 'sl-select', 'sl-input'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  position: 50,
  name: 'grip-vertical',
  icons: icons.map((icon) => icon.name),
  eventType: "N/A"
}));