export const load = icons => Promise.all(['sl-mutation-observer', 'sl-button', 'sl-select', 'sl-input', 'sl-switch'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  childList: true,
  attr: ['variant', 'title', 'class'],
  attrOldValue: false,
  charData: true,
  charDataOldValue: false,
  title: 'This is the button title.',
  variant: 'primary',
  textContent: 'Button',
  detail: null,
  disabled: false,
  eventType: "N/A"
}));
export const detailUpdater = ($event, $scope) => {
  // Where is the attr-old-value & char-data-old-value?
  $scope.eventType = $event.type;
  const mutationRecord = $event.detail.mutationList[0];
  console.log('mutationRecord: ', mutationRecord);
  $scope.detail = `{
    type: ${ mutationRecord.type },
    attributeName: ${ mutationRecord.attributeName },
    variant: ${ mutationRecord.target.variant },
    title: ${ mutationRecord.target.title },
    textContent: ${ mutationRecord.target.textContent },
    oldValue: ${ mutationRecord.oldValue }
  }`;
};