"use client";
import { LoadingComponent } from "@/components/LoadingComponent/LoadingComponent";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Root page component.
 * @returns {JSX.Element} The rendered component.
 */
export default function RootPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/login");
    }, [router]);

    return <LoadingComponent withBorder={false} />;
}
