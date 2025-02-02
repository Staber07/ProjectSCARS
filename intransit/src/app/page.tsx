"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Eye, EyeClosed } from "lucide-react";

import { Program } from "@/lib/info";

const formSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
});

export function ProfileForm() {
    // 1. Define your form.
    // 2. Define a submit handler.
}

export default function Home() {
    const [passwordHiddenState, setPasswordHiddenState] = useState(true);
    function submitUserLogin(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values);
        toast("User `" + values.username + "` is logging in with password `" + values.password + "`");
    }

    function togglePasswordVisibility(e) {
        e.preventDefault();
        // console.log("Toggling password visibility");
        const passwordInput = document.getElementById("form-login-password") as HTMLInputElement;
        console.log(passwordInput);
        // FIXME: If setPasswordHiddenState is called here, passwordInput.type is not updated.
        passwordInput.type = passwordInput.type === "password" ? "text" : "password";
        // setPasswordHiddenState(!passwordHiddenState);
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
                <h1 className="text-4xl font-bold text-center sm:text-left">
                    Welcome to <span>{Program.name}</span>
                </h1>
                <h2 className="text-2xl text-center sm:text-left">{Program.description}</h2>
                <div className="w-full max-w-sm">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(submitUserLogin)} className="space-y-5">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        {/* <FormLabel>Username</FormLabel> */}
                                        <FormControl>
                                            <Input
                                                id="form-login-username"
                                                type="text"
                                                placeholder="Username"
                                                {...field}
                                            />
                                        </FormControl>
                                        {/* <FormDescription></FormDescription> */}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* TODO: Adjust alignment */}
                            <div className="flex justify-between">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            {/* <FormLabel>Password</FormLabel> */}
                                            <FormControl>
                                                <Input
                                                    id="form-login-password"
                                                    type="password"
                                                    placeholder="Password"
                                                    {...field}
                                                />
                                            </FormControl>
                                            {/* <FormDescription></FormDescription> */}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button onClick={togglePasswordVisibility}>
                                    {passwordHiddenState ? <Eye /> : <EyeClosed />}
                                </Button>
                            </div>
                            <Button type="submit">Submit</Button>
                        </form>
                    </Form>
                </div>
            </main>
        </div>
    );
}
