export const load = icons => Promise.all(['sl-option', 'sl-select', 'sl-input', 'sl-switch'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  disabled: false,
  prefixIcon: 'telephone',
  suffixIcon: 'gear',
  valuePrefix: 'optionValue',
  textLabelPrefix: 'textLabel',
  value: '',
  textLabel: '',
  icons: icons.map((icon) => icon.name)
}));