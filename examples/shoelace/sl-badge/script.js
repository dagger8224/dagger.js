export const load = () => Promise.all(['sl-badge', 'sl-button', 'sl-input', 'sl-select', 'sl-switch'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  variant: 'primary',
  content: 'badge',
  pill: false,
  pulse: false
}));