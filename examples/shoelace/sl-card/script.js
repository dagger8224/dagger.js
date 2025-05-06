export const load = () => Promise.all(['sl-card', 'sl-select', 'sl-icon', 'sl-switch'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  number: '0',
  images: [{
    src: 'https://images.unsplash.com/photo-1559209172-0ff8f6d49ff7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80',
    alt: 'A kitten sits patiently between a terracotta pot and decorative grasses.'
  }, {
    src: 'https://images.unsplash.com/photo-1547191783-94d5f8f6d8b1?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=80',
    alt: 'A kitten walks towards camera on top of pallet.'
  }],
  showImage: true,
  showHeader: true,
  showFooter: true
}));