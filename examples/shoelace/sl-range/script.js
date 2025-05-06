export const load = icons => Promise.all(['sl-range', 'sl-button', 'sl-input', 'sl-color-picker', 'sl-switch', 'sl-radio-group'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  label: 'Range',
  helpText: 'Controls the volume of the current song.',
  value: 50,
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
  focus: false,
  tooltip: 'top',
  trackColorActive: '#0284c7',
  trackColorInactive: '#d0ebf9',
  trackActiveOffset: 0,
  eventType: "N/A"
}));
export const loaded = ($node, $scope) => {
  $node.tooltipFormatter = value => `Total - ${value}%`;
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