export const load = () => Promise.all(['sl-color-picker', 'sl-button', 'sl-select', 'sl-switch'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  value: '#4a90e2ff',
  opacity: true,
  format: 'hex',
  focus: false,
  noFormatToggle: false,
  swatches: ['#d0021b', '#f5a623', '#f8e71c', '#8b572a', '#7ed321', '#417505', '#bd10e0', '#9013fe',
    '#4a90e2', '#50e3c2', '#b8e986', '#000', '#444', '#888', '#ccc', '#fff'],
  validity: true,
  size: 'medium',
  inline: false, // set true would cause validation error
  uppercase: false,
  disabled: false,
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
export const watchValue = (opacity, format, uppercase) => pickerElement.getFormattedValue(opacity ? format + 'a' : format); // lazy watch expression should be function instead of inline expression