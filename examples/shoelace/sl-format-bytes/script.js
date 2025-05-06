export const load = icons => Promise.all(['sl-format-bytes', 'sl-select', 'sl-input', 'sl-radio-group'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  value: 10000,
  unit: 'byte',
  display: 'short',
  lang: 'en',
  languages: ['ar', 'cs', 'da', 'de-ch', 'de', 'en-gb', 'en', 'es', 'fa', 'fi', 'fr', 'he', 'hr', 'hu', 'id', 'it', 'ja', 'nb', 'nl', 'nn', 'pl', 'pt', 'ru', 'sl', 'sv', 'tr', 'uk', 'zh-cn', 'zh-tw']
}));