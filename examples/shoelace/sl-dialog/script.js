export const load = icons => Promise.all(['sl-dialog', 'sl-button', 'sl-select', 'sl-input', 'sl-switch'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  open: false,
  label: 'Dialog',
  variant: 'primary',
  noHeader: false,
  autofocus: false,
  headerActions: ['box-arrow-up-right', 'gear'],
  icons: icons.map((icon) => icon.name),
  eventType: "N/A"
}));
export const loaded = ($node, $scope) => {
  [
    "sl-show",
    "sl-after-show",
    "sl-hide",
    "sl-after-hide",
    "sl-initial-focus",
    "sl-request-close"
  ].forEach((eventName) =>
    $node.addEventListener(eventName, ($event) => {
      $scope.eventType = $event.type;
    })
  );
};