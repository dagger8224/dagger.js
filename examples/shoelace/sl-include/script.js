export const load = icons => Promise.all(['sl-include', 'sl-input', 'sl-switch'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  src: 'https://shoelace.style/assets/examples/include.html',
  mode: 'cors',
  allowScripts: false,
  eventType: "N/A"
}));