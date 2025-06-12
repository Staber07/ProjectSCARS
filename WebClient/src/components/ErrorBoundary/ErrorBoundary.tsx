import React from "react";
import { Text, Button, Stack } from "@mantine/core";

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Dashboard Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Stack align="center" mt="xl">
                    <Text>Something went wrong loading the dashboard.</Text>
                    <Button onClick={() => this.setState({ hasError: false })} variant="light">
                        Try again
                    </Button>
                </Stack>
            );
        }

        return this.props.children;
    }
}
