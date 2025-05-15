import { Center, Container, Image, Loader, Paper, Stack, Text } from "@mantine/core";

type LoadingComponentProps = {
    message?: string;  // The message to display below the title
    withBorder?: boolean; // Whether to show a border around the loading screen
};

/**
 * Show a loading screen
 */
export const LoadingComponent: React.FC<LoadingComponentProps> = ({
    message = null,
    withBorder = true,
}) => {
    console.debug("Returning LoadingComponent", { message });
    return (
        <Container size={420} my={40} style={{ paddingTop: "150px" }}>
            <Center>
                <Paper withBorder={withBorder} radius="md">
                    <Stack align="center" justify="center" gap="xs">
                        <Image src="/assets/BENTOLogo.svg" alt="BENTO Logo" width={100} height={100} />
                        {/*
                        <Title className={classes.title} data-testid="loading-title">
                            {Program.name}
                        </Title>
                        */}
                        {message && <Text data-testid="loading-message">{message}</Text>}
                        <Loader color="blue" type="bars" />
                    </Stack>
                </Paper>
            </Center>
        </Container>
    );
};
