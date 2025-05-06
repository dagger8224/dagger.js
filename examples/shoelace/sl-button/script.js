export const load = icons => Promise.all(['sl-button', 'sl-select', 'sl-switch'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
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
  labelIcon: 'gear',
  prefixIcon: '',
  suffixIcon: '',
  icons: icons.map((icon) => icon.name),
  eventType: "N/A"
}));