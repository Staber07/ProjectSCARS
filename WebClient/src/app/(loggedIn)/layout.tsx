"use client";

import { Navbar } from '@/components/Navbar';
import { AuthProvider, useAuth } from '@/lib/providers/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AppShell, Text } from '@mantine/core';

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
        <AppShell> 
            <AppShell.Navbar p="md"><Navbar/></AppShell.Navbar>
            <AppShell.Main> 
                {children}
            </AppShell.Main>
        </AppShell>
    );
}
