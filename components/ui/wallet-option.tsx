import React from 'react';

interface WalletOptionProps {
    name: string;
    balance?: number; // Optional, kept for backward compatibility but not displayed
}

/**
 * Simplified wallet option for dropdown selects.
 * Only displays wallet name for cleaner UI.
 * v1.8.2: Removed balance display per user feedback.
 */
export function WalletOption({ name }: WalletOptionProps) {
    return <span>{name}</span>;
}
