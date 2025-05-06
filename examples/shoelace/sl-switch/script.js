export const load = () => Promise.all(['sl-switch', 'sl-button', 'sl-select', 'sl-input'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  checked: false,
  disabled: false,
  focus: false,
  validity: true,
  size: 'medium',
  helpText: 'Click the switcher to toggle!',
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