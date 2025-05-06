export const load = icons => Promise.all(['sl-breadcrumb', 'sl-breadcrumb-item', 'sl-icon', 'sl-dropdown', 'sl-select', 'sl-input'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  breadcrumbItems: [{
    href: 'panel1',
    text: 'Catalog'
  }, {
    href: 'panel2',
    text: 'Clothing'
  }, {
    href: 'panel3',
    text: 'Women\'s'
  }, {
    href: 'panel4',
    text: 'Shirts & Tops'
  }],
  label: 'label content',
  separatorIcon: 'chevron-right',
  icons: icons.map((icon) => icon.name)
}));