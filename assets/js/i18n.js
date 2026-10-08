(function () {
  'use strict';

  /*
   * 4Divari i18n
   * Internationalization / Localization Core
   *
   * Responsibilities:
   * - Language registry
   * - RTL / LTR direction
   * - Locale loading
   * - Translation lookup
   * - Safe fallback
   * - Parameter interpolation
   * - Number / Date / Currency formatting
   * - Language persistence
   *
   * Important:
   * Translation files are loaded from:
   * ./locales/<locale>.json
   */

  const I18N_CONFIG = Object.freeze({

    /*
     * Default application language.
     * Persian is the safe fallback for the current 4Divari application.
     */
    defaultLocale: 'fa',

    /*
     * Storage key.
     * Changing this later will make existing users lose their saved language.
     */
    storageKey: '4divari_locale',

    /*
     * Available application languages.
     *
     * dir:
     *   rtl = Right To Left
     *   ltr = Left To Right
     *
     * intl:
     *   Locale used by Intl.NumberFormat / DateTimeFormat.
     *
     * Note:
     * Some regional languages do not have equally reliable Intl
     * implementation across all Android/WebView versions.
     * For those languages we intentionally use a stable fallback
     * Intl locale where appropriate.
     */
    locales: Object.freeze({

      fa: Object.freeze({
        name: 'فارسی',
        nativeName: 'فارسی',
        dir: 'rtl',
        intl: 'fa-IR',
        flag: null
      }),

      en: Object.freeze({
        name: 'English',
        nativeName: 'English',
        dir: 'ltr',
        intl: 'en-US',
        flag: null
      }),

      'ku-Arab': Object.freeze({
        name: 'کوردی سورانی',
        nativeName: 'کوردی سۆرانی',
        dir: 'rtl',
        intl: 'ku-Arab',
        flag: './assets/images/flags/kurdistan.png'
      }),

      'ku-Latn': Object.freeze({
        name: 'کوردی کرمانجی',
        nativeName: 'Kurdî Kurmancî',
        dir: 'ltr',
        intl: 'ku-Latn',
        flag: './assets/images/flags/kurdistan.png'
      }),

      hac: Object.freeze({
        name: 'کوردی هورامی',
        nativeName: 'کوردی هەورامی',
        dir: 'rtl',

        /*
         * Horami does not have a universally reliable Intl locale
         * across all target browsers/WebViews.
         * We therefore use Persian Intl formatting as the safe
         * formatting fallback while keeping the UI language independent.
         */
        intl: 'fa-IR',

        flag: './assets/images/flags/kurdistan.png'
      }),

      bal: Object.freeze({
        name: 'بلوچی',
        nativeName: 'بلوچی',
        dir: 'rtl',

        /*
         * Safe formatting fallback for environments where
         * Balochi Intl support may be incomplete.
         */
        intl: 'fa-IR',

        flag: null
      }),

      de: Object.freeze({
        name: 'آلمانی',
        nativeName: 'Deutsch',
        dir: 'ltr',
        intl: 'de-DE',
        flag: null
      }),

      fr: Object.freeze({
        name: 'فرانسه',
        nativeName: 'Français',
        dir: 'ltr',
        intl: 'fr-FR',
        flag: null
      }),

      tr: Object.freeze({
        name: 'ترکی',
        nativeName: 'Türkçe',
        dir: 'ltr',
        intl: 'tr-TR',
        flag: null
      }),

      hy: Object.freeze({
        name: 'ارمنی',
        nativeName: 'Հայերեն',
        dir: 'ltr',
        intl: 'hy-AM',
        flag: null
      }),

      glk: Object.freeze({
        name: 'فارسی گیلکی',
        nativeName: 'گیلکی',
        dir: 'rtl',

        /*
         * Safe Intl fallback.
         */
        intl: 'fa-IR',

        flag: null
      }),

      ar: Object.freeze({
        name: 'عربی',
        nativeName: 'العربية',
        dir: 'rtl',
        intl: 'ar',
        flag: null
      }),

      ru: Object.freeze({
        name: 'روسی',
        nativeName: 'Русский',
        dir: 'ltr',
        intl: 'ru-RU',
        flag: null
      }),

      zh: Object.freeze({
        name: 'چینی',
        nativeName: '中文',
        dir: 'ltr',
        intl: 'zh-CN',
        flag: null
      }),

      es: Object.freeze({
        name: 'اسپانیایی',
        nativeName: 'Español',
        dir: 'ltr',
        intl: 'es-ES',
        flag: null
      }),

      az: Object.freeze({
        name: 'آذری',
        nativeName: 'Azərbaycan dili',
        dir: 'ltr',
        intl: 'az-AZ',
        flag: null
      }),

      ka: Object.freeze({
        name: 'گرجی',
        nativeName: 'ქართული',
        dir: 'ltr',
        intl: 'ka-GE',
        flag: null
      }),

      uz: Object.freeze({
        name: 'ازبکی',
        nativeName: 'O‘zbekcha',
        dir: 'ltr',
        intl: 'uz-UZ',
        flag: null
      }),

      tk: Object.freeze({
        name: 'ترکمنی',
        nativeName: 'Türkmençe',
        dir: 'ltr',
        intl: 'tk-TM',
        flag: null
      }),

      tg: Object.freeze({
        name: 'تاجیکی',
        nativeName: 'Тоҷикӣ',
        dir: 'ltr',
        intl: 'tg-TJ',
        flag: null
      }),

      ps: Object.freeze({
        name: 'پشتو',
        nativeName: 'پښتو',
        dir: 'rtl',
        intl: 'ps-AF',
        flag: null
      })

    })
  });


  /*
   * Runtime state.
   */
  let currentLocale = I18N_CONFIG.defaultLocale;
  let translations = {};
  let isInitialized = false;


  /*
   * ---------------------------------------------------------
   * Utility functions
   * ---------------------------------------------------------
   */

  function hasOwn(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
  }


  function isSupportedLocale(locale) {
    return typeof locale === 'string' &&
      hasOwn(I18N_CONFIG.locales, locale);
  }


  function getLocaleConfig(locale) {
    if (isSupportedLocale(locale)) {
      return I18N_CONFIG.locales[locale];
    }

    return I18N_CONFIG.locales[I18N_CONFIG.defaultLocale];
  }


  function getNestedValue(object, path) {

    if (
      !object ||
      typeof object !== 'object' ||
      typeof path !== 'string' ||
      !path
    ) {
      return undefined;
    }

    return path.split('.').reduce(function (value, key) {

      if (
        value &&
        typeof value === 'object' &&
        hasOwn(value, key)
      ) {
        return value[key];
      }

      return undefined;

    }, object);
  }


  /*
   * Supports:
   *
   * t('home.hello')
   *
   * t('home.hello', {
   *   name: 'Yahya'
   * })
   *
   * Translation:
   *
   * "Hello {{name}}"
   */
  function interpolate(text, params) {

    if (
      typeof text !== 'string' ||
      !params ||
      typeof params !== 'object'
    ) {
      return text;
    }

    return text.replace(
      /\{\{(\w+)\}\}/g,
      function (match, key) {

        if (hasOwn(params, key)) {
          return String(params[key]);
        }

        /*
         * Keep missing placeholders visible rather than
         * silently deleting them.
         *
         * This makes translation errors easier to detect.
         */
        return match;
      }
    );
  }


  /*
   * ---------------------------------------------------------
   * Translation lookup
   * ---------------------------------------------------------
   */

  function translate(key, params) {

    if (typeof key !== 'string' || !key) {
      return '';
    }

    let value = getNestedValue(
      translations,
      key
    );

    /*
     * Missing translation in selected language:
     * fallback to Persian.
     *
     * The Persian dictionary is loaded separately when needed.
     * For the initial implementation we return the key here.
     *
     * This is intentional:
     * silently hiding missing translation keys makes auditing
     * much harder.
     */
    if (value === undefined || value === null) {

      if (
        typeof console !== 'undefined' &&
        typeof console.warn === 'function'
      ) {
        console.warn(
          '[4Divari i18n] Missing translation:',
          key,
          'locale:',
          currentLocale
        );
      }

      return key;
    }

    return interpolate(
      String(value),
      params
    );
  }


  /*
   * Public shorthand.
   */
  function t(key, params) {
    return translate(key, params);
  }


  /*
   * ---------------------------------------------------------
   * Document direction
   * ---------------------------------------------------------
   */

  function applyDocumentDirection() {

    const config = getLocaleConfig(
      currentLocale
    );

    if (!document.documentElement) {
      return;
    }

    /*
     * lang:
     * Used by browser, accessibility tools and text rendering.
     */
    document.documentElement.lang =
      config.intl || currentLocale;

    /*
     * dir:
     * Controls the global document direction.
     */
    document.documentElement.dir =
      config.dir;

    /*
     * body direction:
     * Kept synchronized for WebView compatibility.
     */
    if (document.body) {
      document.body.dir =
        config.dir;
    }

    /*
     * Useful CSS hook:
     *
     * html[data-locale="fa"]
     * html[data-direction="rtl"]
     */
    document.documentElement.dataset.locale =
      currentLocale;

    document.documentElement.dataset.direction =
      config.dir;
  }


  /*
   * ---------------------------------------------------------
   * Static DOM translations
   * ---------------------------------------------------------
   *
   * Supported attributes:
   *
   * data-i18n
   * data-i18n-placeholder
   * data-i18n-title
   * data-i18n-aria-label
   */

  function applyStaticTranslations() {

    /*
     * Text content
     */
    document
      .querySelectorAll('[data-i18n]')
      .forEach(function (element) {

        const key =
          element.getAttribute('data-i18n');

        element.textContent =
          t(key);
      });


    /*
     * Placeholder
     */
    document
      .querySelectorAll('[data-i18n-placeholder]')
      .forEach(function (element) {

        const key =
          element.getAttribute(
            'data-i18n-placeholder'
          );

        element.setAttribute(
          'placeholder',
          t(key)
        );
      });


    /*
     * Title
     */
    document
      .querySelectorAll('[data-i18n-title]')
      .forEach(function (element) {

        const key =
          element.getAttribute(
            'data-i18n-title'
          );

        element.setAttribute(
          'title',
          t(key)
        );
      });


    /*
     * Accessibility label
     */
    document
      .querySelectorAll('[data-i18n-aria-label]')
      .forEach(function (element) {

        const key =
          element.getAttribute(
            'data-i18n-aria-label'
          );

        element.setAttribute(
          'aria-label',
          t(key)
        );
      });
  }


  /*
   * ---------------------------------------------------------
   * Locale loading
   * ---------------------------------------------------------
   */

  async function loadLocale(locale) {

    if (!isSupportedLocale(locale)) {
      throw new Error(
        '[4Divari i18n] Unsupported locale: ' +
        locale
      );
    }

    const response = await fetch(
      './locales/' +
      encodeURIComponent(locale) +
      '.json',
      {
        cache: 'no-cache'
      }
    );

    if (!response.ok) {
      throw new Error(
        '[4Divari i18n] Failed to load locale "' +
        locale +
        '". HTTP status: ' +
        response.status
      );
    }

    const data =
      await response.json();

    if (
      !data ||
      typeof data !== 'object' ||
      Array.isArray(data)
    ) {
      throw new Error(
        '[4Divari i18n] Invalid translation file: ' +
        locale
      );
    }

    /*
     * Only update runtime state after the file
     * has been successfully downloaded and parsed.
     *
     * This prevents a failed language switch from
     * destroying the currently working language.
     */
    translations = data;
    currentLocale = locale;

    applyDocumentDirection();
    applyStaticTranslations();

    return getLocaleConfig(locale);
  }


  /*
   * ---------------------------------------------------------
   * Language switching
   * ---------------------------------------------------------
   */

  async function setLanguage(locale) {

    /*
     * Invalid requested language:
     * use default language.
     */
    if (!isSupportedLocale(locale)) {
      locale =
        I18N_CONFIG.defaultLocale;
    }

    const previousLocale =
      currentLocale;

    try {

      await loadLocale(locale);

      localStorage.setItem(
        I18N_CONFIG.storageKey,
        locale
      );

      /*
       * The current application already has a render()
       * function. If it exists, rerender dynamic UI
       * after language change.
       *
       * We deliberately do NOT require render() to exist.
       * This keeps i18n.js independently testable.
       */
      if (
        typeof window.render === 'function'
      ) {
        window.render();
      }

      return true;

    } catch (error) {

      console.error(
        '[4Divari i18n] Language switch failed:',
        error
      );

      /*
       * Keep previous language if loading failed.
       */
      currentLocale =
        previousLocale;

      applyDocumentDirection();

      return false;
    }
  }


  /*
   * ---------------------------------------------------------
   * Initialization
   * ---------------------------------------------------------
   */

  async function initI18n() {

    if (isInitialized) {
      return true;
    }

    let savedLocale = null;

    try {
      savedLocale =
        localStorage.getItem(
          I18N_CONFIG.storageKey
        );
    } catch (storageError) {

      /*
       * localStorage can theoretically be unavailable
       * in restricted browser/WebView contexts.
       */
      console.warn(
        '[4Divari i18n] localStorage unavailable:',
        storageError
      );
    }


    if (!isSupportedLocale(savedLocale)) {
      savedLocale =
        I18N_CONFIG.defaultLocale;
    }


    const success =
      await setLanguage(
        savedLocale
      );

    /*
     * If the saved language cannot load,
     * make one explicit attempt to load Persian.
     */
    if (
      !success &&
      savedLocale !==
        I18N_CONFIG.defaultLocale
    ) {

      const fallbackSuccess =
        await setLanguage(
          I18N_CONFIG.defaultLocale
        );

      isInitialized =
        fallbackSuccess;

      return fallbackSuccess;
    }

    isInitialized =
      success;

    return success;
  }


  /*
   * ---------------------------------------------------------
   * Public getters
   * ---------------------------------------------------------
   */

  function getCurrentLocale() {
    return currentLocale;
  }


  function getCurrentLanguage() {
    return getLocaleConfig(
      currentLocale
    );
  }


  function getDirection() {
    return getLocaleConfig(
      currentLocale
    ).dir;
  }


  function getIntlLocale() {
    return getLocaleConfig(
      currentLocale
    ).intl;
  }


  function getAvailableLocales() {

    return Object.keys(
      I18N_CONFIG.locales
    ).map(function (id) {

      const config =
        I18N_CONFIG.locales[id];

      return {
        id: id,
        name: config.name,
        nativeName: config.nativeName,
        dir: config.dir,
        intl: config.intl,
        flag: config.flag
      };
    });
  }


  /*
   * ---------------------------------------------------------
   * Intl formatting
   * ---------------------------------------------------------
   */

  function formatNumber(
    value,
    options
  ) {

    const numericValue =
      Number(value);

    if (!Number.isFinite(numericValue)) {
      return String(value);
    }

    try {

      return new Intl.NumberFormat(
        getIntlLocale(),
        options
      ).format(numericValue);

    } catch (error) {

      console.warn(
        '[4Divari i18n] Number formatting failed:',
        error
      );

      /*
       * Safe fallback.
       */
      return String(value);
    }
  }


  function formatDate(
    value,
    options
  ) {

    try {

      const date =
        value instanceof Date
          ? value
          : new Date(value);

      if (Number.isNaN(date.getTime())) {
        return String(value);
      }

      return new Intl.DateTimeFormat(
        getIntlLocale(),
        options
      ).format(date);

    } catch (error) {

      console.warn(
        '[4Divari i18n] Date formatting failed:',
        error
      );

      return String(value);
    }
  }


  function formatCurrency(
    value,
    currency,
    options
  ) {

    const numericValue =
      Number(value);

    if (
      !Number.isFinite(numericValue) ||
      typeof currency !== 'string' ||
      !currency
    ) {
      return String(value);
    }

    try {

      return new Intl.NumberFormat(
        getIntlLocale(),
        Object.assign(
          {},
          {
            style: 'currency',
            currency: currency
          },
          options || {}
        )
      ).format(numericValue);

    } catch (error) {

      console.warn(
        '[4Divari i18n] Currency formatting failed:',
        error
      );

      return String(value);
    }
  }


  /*
   * ---------------------------------------------------------
   * Public API
   * ---------------------------------------------------------
   */

  window.I18N_CONFIG =
    I18N_CONFIG;

  window.i18n = Object.freeze({

    t: t,

    setLanguage:
      setLanguage,

    init:
      initI18n,

    loadLocale:
      loadLocale,

    getCurrentLocale:
      getCurrentLocale,

    getCurrentLanguage:
      getCurrentLanguage,

    getDirection:
      getDirection,

    getIntlLocale:
      getIntlLocale,

    getAvailableLocales:
      getAvailableLocales,

    formatNumber:
      formatNumber,

    formatDate:
      formatDate,

    formatCurrency:
      formatCurrency,

    applyStaticTranslations:
      applyStaticTranslations,

    applyDocumentDirection:
      applyDocumentDirection

  });

})();
