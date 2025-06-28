import { AnimationGeneratorType } from "motion/react";

export const animationConfig = {
    button: {
        transition: { type: "spring" as AnimationGeneratorType, stiffness: 500, damping: 30, mass: 1 },
        whileHover: { scale: 1.05 },
        whileTap: { scale: 0.95 },
    },
};
