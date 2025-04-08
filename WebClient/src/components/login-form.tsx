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

/**
 * A login form component that allows users to enter their username and password to log in.
 */
export function LoginForm({ className }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const userLoginHandler = () => {
    console.log(`username: ${username}`);
    console.log(`password: ${password}`);
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
          <form onSubmit={userLoginHandler}>
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
