"use client";

import { ErrorComponent } from "@/components/ErrorComponent";

interface ErrorPageProps {
    error: Error & { digest?: string }; // The error object can include a digest for debugging
    reset: () => void; // Function to reset the error state
}

/**
 * ErrorPage component to display when an error occurs in the application.
 * It provides a user-friendly message and options to retry or go back.
 * @param {ErrorPageProps} props - The properties for the ErrorPage component.
 * @return {JSX.Element} The rendered ErrorPage component.
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
    return <ErrorComponent error={error} reset={reset} />;
}
