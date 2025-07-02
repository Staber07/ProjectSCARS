import { Connections, LocalStorage, Program, randomLoadingMessages } from "@/lib/info";
import { describe, expect, it } from "vitest";

describe("Program information", () => {
    it("has correct program details", () => {
        expect(Program.name).toBe("BENTO");
        expect(Program.description).toBe("Baliuag's Enhanced Network for School Canteen Tracking Operations");
        expect(Program.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it("has all required program properties", () => {
        expect(Program).toHaveProperty("name");
        expect(Program).toHaveProperty("description");
        expect(Program).toHaveProperty("version");
    });
});

describe("Connections configuration", () => {
    it("has central server endpoint", () => {
        expect(Connections.CentralServer.endpoint).toMatch(/^https?:\/\//);
    });

    it("has valid URL format for central server", () => {
        const url = Connections.CentralServer.endpoint;
        expect(() => new URL(url)).not.toThrow();
    });
});

describe("LocalStorage keys", () => {
    it("has all required storage keys", () => {
        expect(LocalStorage).toHaveProperty("accessToken");
        expect(LocalStorage).toHaveProperty("userData");
        expect(LocalStorage).toHaveProperty("userPermissions");
        expect(LocalStorage).toHaveProperty("userAvatar");
        expect(LocalStorage).toHaveProperty("userPreferences");
        expect(LocalStorage).toHaveProperty("setupCompleteDismissed");
    });

    it("all storage keys are strings", () => {
        Object.values(LocalStorage).forEach((key) => {
            expect(typeof key).toBe("string");
        });
    });
});

describe("Random loading messages", () => {
    it("is an array with multiple messages", () => {
        expect(Array.isArray(randomLoadingMessages)).toBe(true);
        expect(randomLoadingMessages.length).toBeGreaterThan(0);
    });

    it("all messages are strings", () => {
        randomLoadingMessages.forEach((message) => {
            expect(typeof message).toBe("string");
            expect(message.length).toBeGreaterThan(0);
        });
    });

    it("contains school/canteen themed messages", () => {
        const hasSchoolTheme = randomLoadingMessages.some(
            (message) =>
                message.toLowerCase().includes("school") ||
                message.toLowerCase().includes("canteen") ||
                message.toLowerCase().includes("budget") ||
                message.toLowerCase().includes("peso")
        );
        expect(hasSchoolTheme).toBe(true);
    });

    it("messages end with ellipsis or period", () => {
        randomLoadingMessages.forEach((message) => {
            expect(message).toMatch(/[.]{3}$/);
        });
    });
});
