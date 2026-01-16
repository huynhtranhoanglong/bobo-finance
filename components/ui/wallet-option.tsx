import React from 'react';

interface WalletOptionProps {
    name: string;
    balance: number;
}

export function WalletOption({ name, balance }: WalletOptionProps) {
    // Safe number conversion to avoid NaN
    const safeBalance = Number(balance) || 0;

    const formattedBalance = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(safeBalance);

    return (
        <span>
            {name} ({formattedBalance})
        </span>
    );
}
