import { AuthenticationError } from "@/lib/error";
import { describe, expect, it } from "vitest";

describe("AuthenticationError", () => {
    it("creates an authentication error with message", () => {
        const message = "Authentication failed";
        const error = new AuthenticationError(message);

        expect(error.message).toBe(message);
        expect(error.name).toBe("AuthenticationError");
    });

    it("is an instance of Error", () => {
        const error = new AuthenticationError("test");

        expect(error instanceof Error).toBe(true);
        expect(error instanceof AuthenticationError).toBe(true);
    });

    it("has correct prototype chain", () => {
        const error = new AuthenticationError("test");

        expect(Object.getPrototypeOf(error)).toBe(AuthenticationError.prototype);
        expect(Object.getPrototypeOf(AuthenticationError.prototype)).toBe(Error.prototype);
    });

    it("can be caught as Error", () => {
        const message = "Authentication failed";

        expect(() => {
            throw new AuthenticationError(message);
        }).toThrow(Error);

        expect(() => {
            throw new AuthenticationError(message);
        }).toThrow(message);
    });

    it("can be caught as AuthenticationError", () => {
        const message = "Authentication failed";

        expect(() => {
            throw new AuthenticationError(message);
        }).toThrow(AuthenticationError);
    });
});
