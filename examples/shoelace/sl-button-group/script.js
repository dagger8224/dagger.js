export const load = () => Promise.all(['sl-button-group', 'sl-button', 'sl-select', 'sl-switch'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  variant: 'primary',
  size: 'medium',
  type: 'button',
  outline: false,
  pill: false,
  circle: false,
  caret: false,
  loading: false,
  disabled: false,
  focus: false,
  eventType: "N/A"
}));