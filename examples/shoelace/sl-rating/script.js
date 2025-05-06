export const load = icons => Promise.all(['sl-rating', 'sl-tooltip', 'sl-icon', 'sl-button', 'sl-input', 'sl-switch'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  value: 3,
  max: 5,
  precision: 1,
  size: 2,
  readonly: false,
  disabled: false,
  useCustomIcon: false,
  customIcon: 'star-fill',
  content: '',
  icons: icons.map((icon) => icon.name),
  eventType: "N/A"
}));
export const loaded = ($node, $scope) => {
  [
    "sl-change",
    "sl-hover"
  ].forEach((eventName) =>
    $node.addEventListener(eventName, ($event) => {
      $scope.eventType = $event.type;
    })
  );
};
const terms = ['No rating', 'Terrible', 'Bad', 'OK', 'Good', 'Excellent'];
export const onHover = ($event, $scope) => {
  $scope.content = event.detail.phase === 'end' ? '' : terms[Math.min(terms.length - 1, Math.floor($event.detail.value))];
};
const icons = ['emoji-angry', 'emoji-frown', 'emoji-expressionless', 'emoji-smile', 'emoji-laughing'];
export const watchIcon = (useCustomIcon, customIcon, $node) => {
  if (useCustomIcon) {
    $node.getSymbol = value => customIcon ? `<sl-icon name='${customIcon}'></sl-icon>` : `<sl-icon name="${icons[value - 1]}"></sl-icon>`;
  } else {
    $node.getSymbol = () => '<sl-icon name="star-fill" library="system"></sl-icon>';
  }
};