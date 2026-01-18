/**
 * i18n Module - Bobo Finance
 * v1.4.1
 * 
 * Exports translations and types for multi-language support.
 */

export { vi, type TranslationKeys } from "./vi";
export { en } from "./en";

export type Language = "vi" | "en";

export const LANGUAGE_NAMES: Record<Language, string> = {
    vi: "Tiếng Việt",
    en: "English",
};

export const LANGUAGE_FLAGS: Record<Language, string> = {
    vi: "🇻🇳",
    en: "🇬🇧",
};

export const DEFAULT_LANGUAGE: Language = "vi";
