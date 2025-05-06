export const load = icons => Promise.all(['sl-format-date', 'sl-select', 'sl-radio-group'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  date: new Date(),
  weekday: 'short',
  era: 'short',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZoneName: 'short',
  timeZone: 'UTC',
  hourFormat: 'auto',
  lang: 'en',
  languages: ['ar', 'cs', 'da', 'de-ch', 'de', 'en-gb', 'en', 'es', 'fa', 'fi', 'fr', 'he', 'hr', 'hu', 'id', 'it', 'ja', 'nb', 'nl', 'nn', 'pl', 'pt', 'ru', 'sl', 'sv', 'tr', 'uk', 'zh-cn', 'zh-tw'],
  displays: ['narrow', 'short', 'long'],
  formats: ['numeric', '2-digit']
}));