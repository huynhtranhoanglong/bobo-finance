"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface PrivacyContextType {
    isPrivacyMode: boolean;
    togglePrivacy: () => void;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
    const [isPrivacyMode, setIsPrivacyMode] = useState(true); // Default to true (safe by default)

    useEffect(() => {
        // Check localStorage on mount
        const savedMode = localStorage.getItem("bobo-privacy-mode");
        if (savedMode !== null) {
            setIsPrivacyMode(JSON.parse(savedMode));
        } else {
            // First visit: Default is already true, but let's save it explicitly
            localStorage.setItem("bobo-privacy-mode", JSON.stringify(true));
        }
    }, []);

    const togglePrivacy = () => {
        setIsPrivacyMode((prev) => {
            const newValue = !prev;
            localStorage.setItem("bobo-privacy-mode", JSON.stringify(newValue));
            return newValue;
        });
    };

    return (
        <PrivacyContext.Provider value={{ isPrivacyMode, togglePrivacy }}>
            {children}
        </PrivacyContext.Provider>
    );
}

export function usePrivacy() {
    const context = useContext(PrivacyContext);
    if (context === undefined) {
        throw new Error("usePrivacy must be used within a PrivacyProvider");
    }
    return context;
}
