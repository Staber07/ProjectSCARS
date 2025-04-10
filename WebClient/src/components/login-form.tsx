"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import ky, { HTTPError } from "ky";
import { toast } from "sonner";
import { Connections, LocalStorage } from "@/lib/info";
import { useRouter } from "next/navigation";

/**
 * A login form component that allows users to enter their username and password to log in.
 */
export function LoginForm({ className }: { className?: string }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const userLoginHandler = async () => {
    const loginSonnerPromise = new Promise<{ detail: string }>(
      async (resolve, reject) => {
        try {
          const loginFormData = new URLSearchParams();
          loginFormData.set("grant_type", "password");
          loginFormData.set("username", username);
          loginFormData.set("password", password);

          const resp = await ky.post(
            `${Connections.CentralServer.endpoint}/auth/token`,
            { body: loginFormData },
          );
          const token: { [idx: string]: string } = await resp.json();
          localStorage.setItem(LocalStorage.jwt_name, token["access_token"]);
          resolve({ detail: "You have successfully logged in!" });
          router.push("/");
        } catch (error) {
          if (error instanceof HTTPError) {
            const err = await error.response.json();
            reject({ detail: `Login failed: ${err["detail"]}` });
            return;
          }

          console.error("Login failed.");
          reject({ detail: "Login failed." });
        }
      },
    );
    toast.promise(loginSonnerPromise, {
      loading: "Logging in...",
      success: (data: { detail: string }) => {
        return { message: `${data.detail}` };
      },
      error: (data: { detail: string }) => {
        return `${data.detail}`;
      },
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your credentials below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              userLoginHandler();
            }}
          >
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  onChange={(event) => setUsername(event.target.value)}
                  // placeholder="Enter your username"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  {/* TODO: implement password reset */}
                  {/* <a  */}
                  {/*   href="#"  */}
                  {/*   className="ml-auto inline-block text-sm underline-offset-4 hover:underline"  */}
                  {/* >  */}
                  {/*   Forgot your password?  */}
                  {/* </a>  */}
                </div>
                <Input
                  id="password"
                  type="password"
                  onChange={(event) => setPassword(event.target.value)}
                  // placeholder="Enter your passwoerd"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
              {/* TODO: Google SSO */}
              {/* <Button variant="outline" className="w-full"> */}
              {/*   Login with Google */}
              {/* </Button> */}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
