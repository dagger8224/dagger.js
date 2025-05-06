export const load = icons => Promise.all(['sl-radio-group', 'sl-radio', 'sl-select', 'sl-input', 'sl-switch'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  value: '1',
  helpText: 'Choose the most appropriate option.',
  size: 'medium',
  required: true,
  eventType: "N/A"
}));