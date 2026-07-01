import { createI18n } from 'vue-i18n'
import vi from './vi.js'
import en from './en.js'
import de from './de.js'
import sl from './sl.js'
import sv from './sv.js'

const messages = { vi, en, de, sl, sv }

const savedLang = localStorage.getItem('iris_lang') || 'vi'

export const i18n = createI18n({
  legacy: false,
  locale: savedLang,
  fallbackLocale: 'vi',
  messages
})

export function setLocale(locale) {
  i18n.global.locale.value = locale
  localStorage.setItem('iris_lang', locale)
}
