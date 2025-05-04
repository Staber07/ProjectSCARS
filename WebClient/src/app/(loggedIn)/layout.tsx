"use client";

import { Navbar } from '@/components/Navbar';
import { AuthProvider, useAuth } from '@/lib/providers/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function rootLayout({
    children,
}: {
    children: React.ReactNode
}) {


    return (
        <AuthProvider>
            <RootContent children={children} />
        </AuthProvider>
    );
}

export function RootContent({
    children,
}: {
    children: React.ReactNode
}) {



    const { isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/");
        }
    }, [isAuthenticated, router]);

    return (
        <div>
            <Navbar />
            {children}
        </div>
    );
}
