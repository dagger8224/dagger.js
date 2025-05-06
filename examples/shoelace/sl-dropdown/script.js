export const load = () => Promise.all(['sl-dropdown', 'sl-popup', 'sl-button', 'sl-select', 'sl-input', 'sl-switch'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  open: false,
  disabled: false,
  stayOpenOnSelect: false,
  sync: undefined,
  placement: 'bottom-start',
  distance: 30,
  skidding: 30,
  eventType: "N/A"
}));
export const loaded = ($node, $scope) => {
  [
    "sl-show",
    "sl-after-show",
    "sl-hide",
    "sl-after-hide"
  ].forEach((eventName) =>
    $node.addEventListener(eventName, ($event) => {
      $scope.eventType = $event.type;
    })
  );
};