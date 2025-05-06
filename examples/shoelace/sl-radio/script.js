export const load = icons => Promise.all(['sl-radio', 'sl-radio-group', 'sl-select', 'sl-switch'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  value: '2',
  disabled: false,
  size: 'medium',
  focus: false,
  array: ['1', '2', '3'],
  eventType: "N/A"
}));