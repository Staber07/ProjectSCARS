"use client";

import { Navbar } from '@/components/Navbar';


export default function rootLayout({
    children,
}: {
    children: React.ReactNode
}) {



    return (
        <Navbar />

    );
}