export const load = icons => Promise.all(['sl-textarea', 'sl-input', 'sl-button', 'sl-select', 'sl-switch'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  value: 'blabla...',
  label: 'This is a textarea element:',
  helpText: 'This is the help text.',
  placeholder: 'Type something here.',
  rows: 4,
  resize: 'vertical',
  minlength: 5,
  maxlength: 30,
  autocapitalize: 'off',
  autocorrect: 'off',
  autocomplete: 'off',
  autofocus: false,
  filled: false,
  disabled: false,
  readonly: false,
  size: 'medium',
  inputmode: 'text',
  required: false,
  enterkeyhint: 'enter',
  spellcheck: true,
  validity: true,
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