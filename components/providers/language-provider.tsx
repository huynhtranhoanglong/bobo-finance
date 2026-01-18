"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { vi, en, type Language, type TranslationKeys, DEFAULT_LANGUAGE, LANGUAGE_NAMES, LANGUAGE_FLAGS } from "@/utils/i18n";

// Cookie name for storing language preference
const LANGUAGE_COOKIE_NAME = "language";

// Get translations based on language
const getTranslations = (lang: Language) => {
    return lang === "vi" ? vi : en;
};

// Context type
interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Record<TranslationKeys, string>;
    languageName: string;
    languageFlag: string;
}

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Helper to get language from cookie (client-side)
function getLanguageFromCookie(): Language {
    if (typeof document === "undefined") return DEFAULT_LANGUAGE;

    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split("=");
        if (name === LANGUAGE_COOKIE_NAME) {
            if (value === "vi" || value === "en") {
                return value;
            }
        }
    }
    return DEFAULT_LANGUAGE;
}

// Helper to set language in cookie
function setLanguageCookie(lang: Language) {
    if (typeof document === "undefined") return;

    // Set cookie with 1 year expiry
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `${LANGUAGE_COOKIE_NAME}=${lang};expires=${expires.toUTCString()};path=/`;
}

// Provider component
export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
    const [mounted, setMounted] = useState(false);

    // Initialize language from cookie on mount
    useEffect(() => {
        const savedLanguage = getLanguageFromCookie();
        setLanguageState(savedLanguage);
        setMounted(true);
    }, []);

    // Set language and save to cookie
    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        setLanguageCookie(lang);
    }, []);

    // Get translations for current language
    const t = getTranslations(language);

    // Don't render until mounted to avoid hydration mismatch
    if (!mounted) {
        // Return with default language to avoid flash
        return (
            <LanguageContext.Provider
                value={{
                    language: DEFAULT_LANGUAGE,
                    setLanguage,
                    t: vi,
                    languageName: LANGUAGE_NAMES[DEFAULT_LANGUAGE],
                    languageFlag: LANGUAGE_FLAGS[DEFAULT_LANGUAGE],
                }}
            >
                {children}
            </LanguageContext.Provider>
        );
    }

    return (
        <LanguageContext.Provider
            value={{
                language,
                setLanguage,
                t,
                languageName: LANGUAGE_NAMES[language],
                languageFlag: LANGUAGE_FLAGS[language],
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
}

// Hook to use language context
export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}

// Shorthand hook for translations only
export function useTranslation() {
    const { t, language } = useLanguage();
    return { t, language };
}
