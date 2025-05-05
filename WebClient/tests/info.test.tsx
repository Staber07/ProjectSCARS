import { expect, test } from "vitest";
import { Program, Connections } from "@/lib/info";

test("Validate project version", () => {
  // make sure version follows semantic versioning
  const version = Program.version;
  const semverRegex = /^\d+\.\d+\.\d+$/;
  expect(version).toMatch(semverRegex);
});

test("Validate central server endpoint", () => {
  // make sure central server endpoint is a valid URL
  const endpoint = Connections.CentralServer.endpoint;
  const urlRegex = /^(http|https):\/\/[^ "]+$/;
  expect(endpoint).toMatch(urlRegex);
});
