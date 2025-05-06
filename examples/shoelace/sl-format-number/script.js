export const load = icons => Promise.all(['sl-format-number', 'sl-select', 'sl-input', 'sl-switch', 'sl-radio-group'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  value: 1000,
  type: 'decimal',
  lang: 'en',
  noGrouping: false,
  currency: 'USD',
  currencyDisplay: 'symbol',
  minimumIntegerDigits: 1,
  minimumFractionDigits: 10,
  maximumFractionDigits: 10,
  minimumSignificantDigits: 10,
  maximumSignificantDigits: 10,
  languages: ['ar', 'cs', 'da', 'de-ch', 'de', 'en-gb', 'en', 'es', 'fa', 'fi', 'fr', 'he', 'hr', 'hu', 'id', 'it', 'ja', 'nb', 'nl', 'nn', 'pl', 'pt', 'ru', 'sl', 'sv', 'tr', 'uk', 'zh-cn', 'zh-tw']
}));