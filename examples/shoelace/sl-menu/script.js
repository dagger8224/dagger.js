export const load = icons => Promise.all(['sl-menu', 'sl-menu-item', 'sl-menu-label', 'sl-divider', 'sl-dropdown', 'sl-icon'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  selectedValue: null,
  textLabel: '',
  showPrefixIcon: true,
  showSuffixIcon: true,
  checked: true,
  disabled: true,
  loading: true,
  eventType: "N/A"
}));