export const load = icons => Promise.all(['sl-input', 'sl-button', 'sl-select', 'sl-switch'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  value: 'blabla...',
  date: new Date(),
  label: 'This is an input element:',
  helpText: 'This is the help text.',
  placeholder: 'Type something here.',
  pattern: '^[a-z]+$',
  minlength: 5,
  maxlength: 30,
  min: 1,
  max: 1000,
  step: 1,
  autocapitalize: 'off',
  autocorrect: 'off',
  autocomplete: 'off',
  clearable: true,
  passwordToggle: false,
  passwordVisible: false,
  noSpinButtons: false,
  autofocus: false,
  filled: false,
  disabled: false,
  readonly: false,
  size: 'medium',
  pill: false,
  required: false,
  type: 'text',
  enterkeyhint: 'enter',
  spellcheck: true,
  validity: true,
  inputmode: 'text',
  prefixIcon: 'plus-square',
  suffixIcon: 'dash-square',
  clearIcon: 'x-circle-fill',
  showPasswordIcon: '',
  hidePasswordIcon: '',
  icons: icons.map((icon) => icon.name),
  eventType: "N/A"
}));
export const loaded = ($node, $scope) => {
  [
    "sl-blur",
    "sl-change",
    "sl-clear",
    "sl-focus",
    "sl-input",
    "sl-invalid"
  ].forEach((eventName) =>
    $node.addEventListener(eventName, ($event) => {
      $scope.eventType = $event.type;
    })
  );
};