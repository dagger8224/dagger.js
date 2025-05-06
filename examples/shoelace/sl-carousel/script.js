export const load = icons => Promise.all(['sl-carousel', 'sl-select', 'sl-input', 'sl-icon', 'sl-radio-group', 'sl-switch'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  items: [{
    src: 'https://shoelace.style/assets/examples/carousel/mountains.jpg',
    alt: 'The sun shines on the mountains and trees (by Adam Kool on Unsplash)',
  }, {
    src: 'https://shoelace.style/assets/examples/carousel/waterfall.jpg',
    alt: 'A waterfall in the middle of a forest (by Thomas Kelly on Unsplash)'
  }, {
    src: 'https://shoelace.style/assets/examples/carousel/sunset.jpg',
    alt: 'The sun is setting over a lavender field (by Leonard Cotte on Unsplash)'
  }, {
    src: 'https://shoelace.style/assets/examples/carousel/field.jpg',
    alt: 'A field of grass with the sun setting in the background (by Sapan Patel on Unsplash)'
  }, {
    src: 'https://shoelace.style/assets/examples/carousel/valley.jpg',
    alt: 'A scenic view of a mountain with clouds rolling in (by V2osk on Unsplash)'
  }],
  icons: icons.map((icon) => icon.name),
  pagination: true,
  navigation: true,
  loop: true,
  autoplay: true,
  mouseDragging: true,
  autoplayInterval: 3000,
  slidesPerPage: 1,
  slidesPerMove: 1,
  orientation: 'horizontal',
  ratio: '16/9',
  hint: '0',
  prevIcon: 'chevron-left',
  nextIcon: 'chevron-right',
  eventType: "N/A"
}));