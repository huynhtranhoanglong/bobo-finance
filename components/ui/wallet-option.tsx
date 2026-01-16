import React from 'react';
import { formatCurrency } from '@/utils/format';

interface WalletOptionProps {
    name: string;
    balance: number;
}

export function WalletOption({ name, balance }: WalletOptionProps) {
    return (
        <span>
            {name} ({formatCurrency(balance)})
        </span>
    );
}
