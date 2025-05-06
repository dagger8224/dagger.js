export const load = icons => Promise.all(['sl-tag', 'sl-select', 'sl-switch', 'sl-radio-group'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  variant: 'primary',
  size: 'medium',
  pill: false,
  removable: false,
  eventType: "N/A"
}));
export const onRemove = ($event, $node, $scope) => {
  $scope.eventType = $event.type;
  $node.remove();
};