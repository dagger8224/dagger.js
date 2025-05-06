export const load = icons => Promise.all(['sl-checkbox', 'sl-button', 'sl-select', 'sl-input', 'sl-switch'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  checked: false,
  indeterminate: false,
  disabled: false,
  focus: false,
  validity: true,
  size: 'medium',
  helpText: 'It is a checkbox.',
  eventType: "N/A"
}));
export const loaded = ($node, $scope) => {
  [
    "sl-change",
    "sl-input",
    "sl-focus",
    "sl-blur",
    "sl-invalid"
  ].forEach((eventName) =>
    $node.addEventListener(eventName, ($event) => {
      $scope.eventType = $event.type;
    })
  );
};