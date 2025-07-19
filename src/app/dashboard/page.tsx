'use client';

import { useState, useEffect } from 'react';
import Dashboard from '@/components/game/Dashboard';
import StarterPackModal from '@/components/game/StarterPackModal';

export default function DashboardPage() {
    const [showStarterPack, setShowStarterPack] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const hasSeenStarterPack = localStorage.getItem('faaji_starter_pack_claimed');
        if (!hasSeenStarterPack) {
            setShowStarterPack(true);
        }
    }, []);

    const handleClaim = () => {
        localStorage.setItem('faaji_starter_pack_claimed', 'true');
        setShowStarterPack(false);
    }

    if (!isClient) {
        return null; // Or a loading spinner
    }

    return (
        <>
            <StarterPackModal isOpen={showStarterPack} onClaim={handleClaim} />
            <Dashboard />
        </>
    );
}
