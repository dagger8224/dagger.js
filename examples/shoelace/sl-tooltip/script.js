export const load = icons => Promise.all(['sl-tooltip', 'sl-button', 'sl-select', 'sl-input', 'sl-switch'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  open: false,
  disabled: false,
  hoist: false,
  content: 'This is a tooltip.',
  placement: 'top',
  trigger: ['hover'],
  arrowSize: 5,
  maxWidth: 120,
  hideDelay: 500,
  showDelay: 0,
  distance: 8,
  skidding: 0,
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