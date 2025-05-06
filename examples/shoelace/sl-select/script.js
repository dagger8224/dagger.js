const getTag = (option, index) => {
  // multiple only
  // Use the same icon used in the <sl-option>
  // You can return a string, a Lit Template, or an HTMLElement here
  return `
    <sl-tag removable index="${index}">
      CustomTag-${option.getTextLabel()}
    </sl-tag>
  `;
};
export const load = (icons) =>
  Promise.all(
    ["sl-select", "sl-input", "sl-icon", "sl-radio-group", "sl-switch"].map(
      (tagName) => customElements.whenDefined(tagName)
    )
  ).then(() => ({
    options: [4, 5, 6],
    icons: icons.map((icon) => icon.name),
    name: "select",
    value: "option_7",
    label: "Label Content",
    helpText: "Help Text Content",
    placeholder: "Placeholder Content",
    clearable: true,
    filled: true,
    pill: true,
    disabled: false,
    focus: false,
    multiple: false,
    validity: false,
    focus: false,
    maxOptionsVisible: 0,
    open: false,
    size: "medium",
    placement: "top",
    prefix: "",
    suffix: "suffix",
    clearIcon: "",
    expandIcon: "",
    eventType: "N/A",
  }));
export const loaded = ($node, $scope) => {
  $node.getTag = getTag;
  [
    "sl-change",
    "sl-clear",
    "sl-input",
    "sl-focus",
    "sl-blur",
    "sl-show",
    "sl-after-show",
    "sl-hide",
    "sl-after-hide",
    "sl-invalid",
  ].forEach((eventName) =>
    $node.addEventListener(eventName, ($event) => {
      $scope.eventType = $event.type;
    })
  );
};
let index = 4;
export const addOption = (options) => options.push(index++);
export const clearOptions = (options) => {
  index = 4;
  options.length = 0;
};
