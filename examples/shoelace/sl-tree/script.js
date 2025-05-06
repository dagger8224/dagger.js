export const load = icons => Promise.all(['sl-tree', 'sl-tree-item', 'sl-icon', 'sl-button', 'sl-select', 'sl-input', 'sl-switch'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  // tree fields:
  selection: 'single',
  indentSize: 16,
  indentGuideWidth: 0,
  indentGuideOffset: 0,
  indentGuideColor: 'hsl(240 5.9% 90%)',
  indentGuideStyle: 'solid',
  expandIcon: 'plus-square',
  collapseIcon: 'dash-square',
  // tree item fields:
  selected: false,
  expanded: false,
  lazy: false,
  includeDisabled: false,
  disabled: false,
  selectedItems: [],
  icons: icons.map((icon) => icon.name),
  eventType: "N/A"
}));
export const loaded = ($node, $scope) => {
  [
    "sl-expand",
    "sl-after-expand",
    "sl-collapse",
    "sl-after-collapse",
    "sl-lazy-change",
    "sl-lazy-load"
  ].forEach((eventName) =>
    $node.addEventListener(eventName, ($event) => {
      $scope.eventType = $event.type;
      if ($scope.eventType === 'sl-lazy-load') {
        setTimeout(() => {
          const treeItem = document.createElement('sl-tree-item');
          treeItem.innerText = 'async Item';
          $node.append(treeItem);
          $scope.lazy = false;
        }, 1000);
      }
    })
  );
};
export const onSelectionChange = (selection, $scope) => {
  $scope.selectedItems = selection.map(item => item.textContent).join(', ');
};