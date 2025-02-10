import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { contactFunction } from "./firebase";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export async function checkServerStatus() {
    return (await contactFunction("healthcheck", { method: "GET" })) === "OK";
}
