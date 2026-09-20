import { i18n, TOptions } from 'i18next';
import { LanguageType, en, resources } from './locales';
import { getLanguage } from 'obsidian';

declare global {
  var i18next: {
    createInstance: () => i18n;
  }
}

export class PluginTranslator {
  // Создаем изолированный экземпляр i18next для нашего плагина
  private i18nInstance = window.i18next.createInstance();

  constructor(initialLang: LanguageType) {
    void this.i18nInstance.init({
      lng: this.getResolveLang(initialLang),
      fallbackLng: 'en',
      resources: resources,
      interpolation: {
        escapeValue: false
      }
    });
  }

  // Логика автоопределения языка Obsidian
  private getResolveLang(lang: LanguageType): string {
    if (lang === 'auto') {
      return getLanguage();
    }
    return lang;
  }

  // Метод динамического переключения языка без перезагрузки Obsidian
  async changeLanguage(lang: LanguageType) {
    await this.i18nInstance.changeLanguage(this.getResolveLang(lang));
  }

  // Метод перевода (со строгой типизацией ключей)
  t(key: keyof typeof en, options?: TOptions): string {
    return this.i18nInstance.t(key, options);
  }
}
