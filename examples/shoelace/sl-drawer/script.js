export const load = icons => Promise.all(['sl-drawer', 'sl-button', 'sl-select', 'sl-input', 'sl-switch', 'sl-icon-button'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  label: 'Drawer',
  contained: false,
  open: false,
  variant: 'primary',
  placement: 'start',
  size: '40',
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