export const load = icons => Promise.all(['sl-radio-button', 'sl-radio-group', 'sl-select', 'sl-switch'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  value: '2',
  disabled: false,
  prefixIcon: 'telephone',
  suffixIcon: 'gear',
  size: 'medium',
  focus: false,
  pill: false,
  useIcon: false,
  array: ['1', '2', '3'],
  icons: icons.map((icon) => icon.name),
  eventType: "N/A"
}));