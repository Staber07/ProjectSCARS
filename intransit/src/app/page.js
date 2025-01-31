"use client";

import "./page.css";
import { Button, Input, Stack } from "@chakra-ui/react";
import { Field } from "@/app/components/field";
import { PasswordInput } from "@/app/components/password-input";

export default function Home() {
    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
                <h1 className="text-4xl font-bold text-center sm:text-left">
                    Welcome to <span className="emphasis">inTransit</span>
                </h1>
                <h2 className="text-2xl text-center sm:text-left">School Canteen Automated Reporting System</h2>
                <form onSubmit={(e) => e.preventDefault()}>
                    <Stack>
                        <Field>
                            <Input placeholder="Username" />
                        </Field>
                        <Field>
                            <PasswordInput placeholder="Password" />
                        </Field>

                        <Button type="submit" size="lg">
                            Log In
                        </Button>
                    </Stack>
                </form>
            </main>
        </div>
    );
}
