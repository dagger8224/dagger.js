export const load = icons => Promise.all(['sl-copy-button', 'sl-select', 'sl-input', 'sl-switch'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  from: 'value',
  sourceValue: 'This is the value of my-input',
  value: '',
  disabled: false,
  feedbackDuration: '250',
  copyIcon: 'clipboard',
  successIcon: 'clipboard-check',
  errorIcon: 'clipboard-x',
  copyLabel: 'Click to copy',
  successLabel: 'You did it!',
  errorLabel: 'Whoops, your browser doesn\'t support this!',
  tooltipPlacement: 'top',
  icons: icons.map((icon) => icon.name),
  eventType: "N/A"
}));