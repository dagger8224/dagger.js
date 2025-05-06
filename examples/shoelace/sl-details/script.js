export const load = icons => Promise.all(['sl-details', 'sl-button', 'sl-select', 'sl-input', 'sl-switch'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  open: false,
  disabled: false,
  expandIcon: 'plus-square',
  collapseIcon: 'dash-square',
  summary: 'Toggle Me',
  icons: icons.map((icon) => icon.name),
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