"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import ky from "ky";

import { useAuth } from "@/lib/providers/auth";
import { MainLoginComponent } from "@/components/MainLoginComponent";

export default function LoginPage() {
  // const { isAuthenticated } = useAuth();
  // const router = useRouter();
  //
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     router.push("/");
  //   }
  // }, [isAuthenticated, router]);

  return <MainLoginComponent />;
}
