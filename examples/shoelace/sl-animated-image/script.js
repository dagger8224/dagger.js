export const load = (icons) =>
  Promise.all(
    ["sl-animated-image", "sl-select", "sl-switch"].map((tagName) =>
      customElements.whenDefined(tagName)
    )
  ).then(() => ({
    sourceName: "",
    sourceList: {
      walk: {
        src: "https://shoelace.style/assets/images/walk.gif",
        alt: "Animation of untied shoes walking on pavement",
      },
      tie: {
        src: "https://shoelace.style/assets/images/tie.webp",
        alt: "Animation of a shoe being tied",
      },
      invalid: {
        src: "invalid",
        alt: "invalid image source",
      },
    },
    play: false,
    playIcon: "play",
    pauseIcon: "pause",
    icons: icons.map((icon) => icon.name),
    eventType: "N/A",
  }));
