export const load = icons => Promise.all(['sl-tab-group', 'sl-tab', 'sl-tab-panel', 'sl-input', 'sl-color-picker', 'sl-button', 'sl-switch', 'sl-radio-group'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  panel: 'N/A',
  placement: 'top',
  activation: 'auto',
  closable: true,
  disabled: false,
  noScrollControls: false,
  fixedScrollControls: false,
  indicatorColor: 'pink',
  trackColor: 'green',
  trackWidth: 3,
  padding: 5,
  tabs: [{
    name: 'tab1',
    active: false
  }, {
    name: 'tab2',
    active: false
  }, {
    name: 'tab3',
    active: true
  }, {
    name: 'tab4',
    active: false
  }, {
    name: 'tab5',
    active: false
  }, {
    name: 'tab6',
    active: false
  }, {
    name: 'tab7',
    active: false
  }, {
    name: 'tab8',
    active: false
  }],
  eventType: 'N/A'
}));
export const onTabShow = ($event, $scope) => {
  $scope.eventType = $event.type;
  $scope.panel = $event.detail.name;
  const { tabs } = $scope;
  const activeIndex = tabs.findIndex(tab => tab.name === $scope.panel);
  tabs.forEach((tab, index) => tab.active = activeIndex === index);
};
export const onClose = (index, $event, $scope) => {
  $scope.eventType = $event.type;
  const { tabs } = $scope;
  // Show the previous tab if the tab is currently active
  if (tabs[index].active) {
    tabs[(index > 0 ? index : tabs.length) - 1].active = true;
  }
  // Remove the tab + panel
  tabs.splice(index, 1);
};