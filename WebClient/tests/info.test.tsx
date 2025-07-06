import { Program } from "@/lib/info";
import { expect, test } from "vitest";

test("Validate project version", () => {
    // make sure version follows semantic versioning
    const version = Program.version;
    const semverRegex = /^\d+\.\d+\.\d+$/;
    expect(version).toMatch(semverRegex);
});
