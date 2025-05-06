export const load = icons => Promise.all(['sl-resize-observer', 'sl-switch'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  disabled: false,
  entry: '',
  eventType: "N/A"
}));
export const onResize = ($event, $scope) => {
  $scope.eventType = $event.type;
  const resizeObserverEntry = $event.detail.entries[0];
  console.log(resizeObserverEntry);
  const { borderBoxSize, contentBoxSize, contentRect, devicePixelContentBoxSize } = resizeObserverEntry;
  $scope.entry = `{
    borderBoxSize: {
      blockSize: ${ borderBoxSize[0].blockSize },
      inlineSize: ${ borderBoxSize[0].inlineSize }
    },
    contentBoxSize: {
      blockSize: ${ contentBoxSize[0].blockSize },
      inlineSize: ${ contentBoxSize[0].inlineSize }
    },
    contentRect: {
      bottom: ${ contentRect.bottom },
      height: ${ contentRect.height },
      left: ${ contentRect.left },
      right: ${ contentRect.right },
      top: ${ contentRect.top },
      width: ${ contentRect.width },
      x: ${ contentRect.x },
      y: ${ contentRect.y }
    },
    devicePixelContentBoxSize: {
      blockSize: ${ devicePixelContentBoxSize[0].blockSize },
      inlineSize: ${ devicePixelContentBoxSize[0].inlineSize }
    }
  }`;
};