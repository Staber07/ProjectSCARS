import { animationConfig } from "@/lib/anim";
import { describe, expect, it } from "vitest";

describe("Animation configuration", () => {
    it("has button animation config", () => {
        expect(animationConfig.button).toBeDefined();
        expect(typeof animationConfig.button).toBe("object");
    });

    describe("Button animations", () => {
        it("has spring transition configuration", () => {
            const transition = animationConfig.button.transition;

            expect(transition.type).toBe("spring");
            expect(transition.stiffness).toBe(500);
            expect(transition.damping).toBe(30);
            expect(transition.mass).toBe(1);
        });

        it("has hover animation", () => {
            const whileHover = animationConfig.button.whileHover;

            expect(whileHover.scale).toBe(1.05);
        });

        it("has tap animation", () => {
            const whileTap = animationConfig.button.whileTap;

            expect(whileTap.scale).toBe(0.95);
        });

        it("has all required animation properties", () => {
            const buttonConfig = animationConfig.button;

            expect(buttonConfig).toHaveProperty("transition");
            expect(buttonConfig).toHaveProperty("whileHover");
            expect(buttonConfig).toHaveProperty("whileTap");
        });

        it("uses reasonable animation values", () => {
            const { transition, whileHover, whileTap } = animationConfig.button;

            // Stiffness should be reasonable for UI interactions
            expect(transition.stiffness).toBeGreaterThan(0);
            expect(transition.stiffness).toBeLessThan(2000);

            // Damping should prevent excessive oscillation
            expect(transition.damping).toBeGreaterThan(0);
            expect(transition.damping).toBeLessThan(100);

            // Scale values should be subtle for good UX
            expect(whileHover.scale).toBeGreaterThan(1);
            expect(whileHover.scale).toBeLessThan(1.2);
            expect(whileTap.scale).toBeGreaterThan(0.8);
            expect(whileTap.scale).toBeLessThan(1);
        });
    });
});
