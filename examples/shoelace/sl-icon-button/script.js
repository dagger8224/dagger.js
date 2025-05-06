export const load = icons => Promise.all(['sl-icon-button', 'sl-color-picker', 'sl-button', 'sl-select', 'sl-input', 'sl-switch'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  name: 'gear',
  color: '#4a90e2ff',
  size: 40,
  focus: false,
  disabled: false,
  icons: icons.map((icon) => icon.name),
  eventType: "N/A"
}));