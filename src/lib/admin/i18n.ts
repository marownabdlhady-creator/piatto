/**
 * The dashboard's own interface language.
 *
 * This is only the chrome — headings, buttons, field labels, messages. It has
 * nothing to do with the menu being edited: an item carries an English name
 * and an Arabic name whichever language the person editing it prefers, and the
 * editor always shows both.
 *
 * next-intl runs the public site off message files and the URL. None of that
 * fits here: /admin sits outside the locale routing on purpose, and there is
 * one screen and one reader. A dictionary and a cookie are the whole feature.
 */

export const ADMIN_LOCALES = ["en", "ar"] as const;

export type AdminLocale = (typeof ADMIN_LOCALES)[number];

/** Scoped to /admin, so it never travels with a request for the public site. */
export const ADMIN_LOCALE_COOKIE = "piatto_admin_lang";

export const DEFAULT_ADMIN_LOCALE: AdminLocale = "en";

/** A year: the choice is a preference, not a session. */
export const ADMIN_LOCALE_MAX_AGE = 60 * 60 * 24 * 365;

export function isAdminLocale(value: string | undefined): value is AdminLocale {
  return value !== undefined && (ADMIN_LOCALES as readonly string[]).includes(value);
}

export function adminDir(locale: AdminLocale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

/** What each language calls itself, for the toggle. */
export const ADMIN_LOCALE_NAMES: Record<AdminLocale, string> = {
  en: "EN",
  ar: "ع",
};

/** A piece of the menu, ready to render: the text and how to set it. */
export type ContentField = {
  text: string;
  lang: AdminLocale;
  dir: "ltr" | "rtl";
};

/**
 * One bilingual field of the menu, in the language the dashboard is set to.
 *
 * The lists and headings follow the toggle so the menu can be reviewed in the
 * language it will be read in — but a name has to say something, so a missing
 * translation falls back to the other language rather than leaving a blank row
 * where a dish should be. `lang` and `dir` come back alongside the text
 * because they describe whichever language was actually chosen, which on a
 * fallback is not the interface language.
 *
 * This is only about display. The editor shows both languages of every field,
 * always, since editing them is the job.
 */
export function pickContent(
  en: string,
  ar: string,
  locale: AdminLocale,
): ContentField {
  const wanted = locale === "ar" ? ar : en;
  const other = locale === "ar" ? en : ar;
  const lang: AdminLocale = wanted ? locale : locale === "ar" ? "en" : "ar";

  return { text: wanted || other, lang, dir: adminDir(lang) };
}

/** The other language's version of the same field, for a secondary line. */
export function otherContent(
  en: string,
  ar: string,
  locale: AdminLocale,
): ContentField {
  return pickContent(en, ar, locale === "ar" ? "en" : "ar");
}

/**
 * Every string the dashboard shows. Written out as one type so a missing
 * Arabic translation is a type error rather than a hole on the screen.
 */
export type AdminStrings = {
  heading: string;
  intro: string;
  signOut: string;
  signingOut: string;
  language: string;

  galleryHeading: string;
  galleryIntro: string;
  uploadImages: string;
  uploading: string;
  /** Takes the size limit, so the hint and the limit cannot disagree. */
  uploadHint: (megabytes: number) => string;
  noImages: string;
  appendedNote: string;
  imagesAdded: (count: number) => string;
  imageDeleted: string;
  uploadNotAllowed: string;
  /** Take the file's name; several can fail at once and each says which. */
  fileNotImage: (name: string) => string;
  fileTooLarge: (name: string, megabytes: number) => string;
  uploadFailed: (name: string, reason: string) => string;

  food: string;
  drinks: string;
  updating: string;
  noSections: string;
  noItems: string;
  addItem: string;

  edit: string;
  delete: string;
  deleting: string;
  confirmDelete: string;
  cancel: string;
  hide: string;
  show: string;
  hiddenBadge: string;

  noPriceSet: string;
  noOptionsSet: string;

  newItem: string;
  editItem: string;
  appendNote: string;
  nameEn: string;
  nameAr: string;
  descEn: string;
  descAr: string;

  priceTypeLabel: string;
  priceTypeSimple: string;
  priceTypeOptions: string;
  priceTypeText: string;
  price: string;
  priceText: string;
  priceTextHint: string;
  options: string;
  labelEn: string;
  labelAr: string;
  addOption: string;
  removeOption: string;

  showOnPublicMenu: string;
  hiddenHint: string;
  save: string;
  saving: string;

  toastSaved: string;
  toastProblem: string;
  itemAdded: string;
  itemSaved: string;
  /** Take the item's name; the dashboard says which item it means. */
  itemDeleted: (name: string) => string;
  itemHidden: (name: string) => string;
  itemShown: (name: string) => string;
  nothingToSave: string;

  networkError: string;
  sessionExpired: string;
  unexpectedError: string;

  adminTitle: string;
  loginTitle: string;
  email: string;
  password: string;
  signIn: string;
  signingIn: string;
  invalidCredentials: string;
};

const en: AdminStrings = {
  heading: "Menu",
  intro: "Changes go live on the public menu as soon as they are saved.",
  signOut: "Sign out",
  signingOut: "Signing out…",
  language: "Interface language",

  galleryHeading: "Gallery",
  galleryIntro:
    "Photographs go live on the public gallery as soon as they are uploaded.",
  uploadImages: "Upload photographs",
  uploading: "Uploading…",
  uploadHint: (megabytes) => `JPG, PNG or WebP, up to ${megabytes} MB each.`,
  noImages: "No photographs yet.",
  appendedNote: "New photographs are added to the end of the gallery.",
  imagesAdded: (count) =>
    count === 1 ? "Photograph uploaded." : `${count} photographs uploaded.`,
  imageDeleted: "Photograph deleted.",
  uploadNotAllowed:
    "The server would not allow this upload. Sign in again if you have been signed out.",
  fileNotImage: (name) => `“${name}” is not a JPG, PNG or WebP image.`,
  fileTooLarge: (name, megabytes) =>
    `“${name}” is larger than ${megabytes} MB.`,
  uploadFailed: (name, reason) => `“${name}”: ${reason}`,

  food: "Food",
  drinks: "Drinks",
  updating: "Updating…",
  noSections: "This menu has no sections yet.",
  noItems: "No items in this section yet.",
  addItem: "Add item",

  edit: "Edit",
  delete: "Delete",
  deleting: "Deleting…",
  confirmDelete: "Delete for good?",
  cancel: "Cancel",
  hide: "Hide",
  show: "Show",
  hiddenBadge: "Hidden",

  noPriceSet: "No price set",
  noOptionsSet: "No options set",

  newItem: "New item",
  editItem: "Edit item",
  appendNote: "Added to the end of this section.",
  nameEn: "Name (EN)",
  nameAr: "Name (AR)",
  descEn: "Description (EN)",
  descAr: "Description (AR)",

  priceTypeLabel: "Price type",
  priceTypeSimple: "Single price",
  priceTypeOptions: "Options",
  priceTypeText: "Free text",
  price: "Price",
  priceText: "Price text",
  priceTextHint: "Printed exactly as written, without the currency.",
  options: "Options",
  labelEn: "Label (EN)",
  labelAr: "Label (AR)",
  addOption: "Add option",
  removeOption: "Remove",

  showOnPublicMenu: "Show on the public menu",
  hiddenHint: "Hidden items stay here and stay in the database.",
  save: "Save changes",
  saving: "Saving…",

  toastSaved: "Saved",
  toastProblem: "Problem",
  itemAdded: "Item added.",
  itemSaved: "Item saved.",
  itemDeleted: (name) => `“${name}” deleted.`,
  itemHidden: (name) => `“${name}” is hidden from the menu.`,
  itemShown: (name) => `“${name}” is back on the menu.`,
  nothingToSave: "Nothing to save.",

  networkError: "Could not reach the server. Check your connection and try again.",
  sessionExpired: "Your session has expired. Sign in again to keep editing.",
  unexpectedError: "Something went wrong. Try again.",

  adminTitle: "Admin",
  loginTitle: "Sign in",
  email: "Email",
  password: "Password",
  signIn: "Sign in",
  signingIn: "Signing in…",
  invalidCredentials: "Invalid email or password.",
};

const ar: AdminStrings = {
  heading: "القائمة",
  intro: "تظهر التعديلات في القائمة العامة فور حفظها.",
  signOut: "تسجيل الخروج",
  signingOut: "جارٍ تسجيل الخروج…",
  language: "لغة الواجهة",

  galleryHeading: "معرض الصور",
  galleryIntro: "تظهر الصور في المعرض العام فور رفعها.",
  uploadImages: "رفع صور",
  uploading: "جارٍ الرفع…",
  uploadHint: (megabytes) =>
    `JPG أو PNG أو WebP، حتى ${megabytes} ميغابايت للصورة.`,
  noImages: "لا توجد صور بعد.",
  appendedNote: "تُضاف الصور الجديدة إلى نهاية المعرض.",
  imagesAdded: (count) =>
    count === 1 ? "تم رفع الصورة." : `تم رفع ${count} صور.`,
  imageDeleted: "تم حذف الصورة.",
  uploadNotAllowed:
    "لم يسمح الخادم بهذا الرفع. سجّل الدخول مرة أخرى إذا انتهت جلستك.",
  fileNotImage: (name) => `«${name}» ليس صورة JPG أو PNG أو WebP.`,
  fileTooLarge: (name, megabytes) =>
    `«${name}» أكبر من ${megabytes} ميغابايت.`,
  uploadFailed: (name, reason) => `«${name}»: ${reason}`,

  food: "الطعام",
  drinks: "المشروبات",
  updating: "جارٍ التحديث…",
  noSections: "لا توجد أقسام في هذه القائمة بعد.",
  noItems: "لا توجد أصناف في هذا القسم بعد.",
  addItem: "إضافة صنف",

  edit: "تعديل",
  delete: "حذف",
  deleting: "جارٍ الحذف…",
  confirmDelete: "حذف نهائي؟",
  cancel: "إلغاء",
  hide: "إخفاء",
  show: "إظهار",
  hiddenBadge: "مخفي",

  noPriceSet: "لا يوجد سعر",
  noOptionsSet: "لا توجد خيارات",

  newItem: "صنف جديد",
  editItem: "تعديل صنف",
  appendNote: "يُضاف إلى نهاية هذا القسم.",
  nameEn: "الاسم (إنجليزي)",
  nameAr: "الاسم (عربي)",
  descEn: "الوصف (إنجليزي)",
  descAr: "الوصف (عربي)",

  priceTypeLabel: "نوع السعر",
  priceTypeSimple: "سعر واحد",
  priceTypeOptions: "خيارات",
  priceTypeText: "نص حر",
  price: "السعر",
  priceText: "نص السعر",
  priceTextHint: "يُطبع كما هو مكتوب، بدون رمز العملة.",
  options: "الخيارات",
  labelEn: "التسمية (إنجليزي)",
  labelAr: "التسمية (عربي)",
  addOption: "إضافة خيار",
  removeOption: "إزالة",

  showOnPublicMenu: "إظهار في القائمة العامة",
  hiddenHint: "الأصناف المخفية تبقى هنا وتبقى في قاعدة البيانات.",
  save: "حفظ التغييرات",
  saving: "جارٍ الحفظ…",

  toastSaved: "تم الحفظ",
  toastProblem: "خطأ",
  itemAdded: "تمت إضافة الصنف.",
  itemSaved: "تم حفظ الصنف.",
  itemDeleted: (name) => `تم حذف «${name}».`,
  itemHidden: (name) => `«${name}» مخفي من القائمة.`,
  itemShown: (name) => `«${name}» عاد إلى القائمة.`,
  nothingToSave: "لا يوجد ما يُحفظ.",

  networkError: "تعذّر الوصول إلى الخادم. تحقق من الاتصال وحاول مرة أخرى.",
  sessionExpired: "انتهت صلاحية الجلسة. سجّل الدخول مرة أخرى للمتابعة.",
  unexpectedError: "حدث خطأ ما. حاول مرة أخرى.",

  adminTitle: "لوحة التحكم",
  loginTitle: "تسجيل الدخول",
  email: "البريد الإلكتروني",
  password: "كلمة المرور",
  signIn: "تسجيل الدخول",
  signingIn: "جارٍ تسجيل الدخول…",
  invalidCredentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
};

const DICTIONARIES: Record<AdminLocale, AdminStrings> = { en, ar };

export function adminStrings(locale: AdminLocale): AdminStrings {
  return DICTIONARIES[locale];
}
