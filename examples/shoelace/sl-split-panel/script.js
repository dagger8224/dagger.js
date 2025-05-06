export const load = icons => Promise.all(['sl-split-panel', 'sl-select', 'sl-input', 'sl-switch', 'sl-radio-group'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  position: 50,
  positionInPixels: 200,
  min: 150,
  max: 80,
  dividerWidth: 12,
  snapThreshold: 8,
  vertical: false,
  disabled : false,
  primary: '',
  snap: ['repeat(200px)', '50%'],
  icon: 'grip-vertical',
  icons: icons.map((icon) => icon.name),
  eventType: "N/A"
}));
export const loaded = $node => {
  // $node.snap = ({ pos, size }) => (pos < size / 2 ? 100 : size - 100);
};