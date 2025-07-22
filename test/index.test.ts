import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock playwright before importing the server
vi.mock("playwright", () => {
  const mockPage = {
    goto: vi.fn(),
    waitForSelector: vi.fn(),
    $eval: vi.fn().mockResolvedValue("<tr><td>prop</td></tr>"),
    close: vi.fn(),
  };

  const mockBrowser = {
    newPage: vi.fn().mockResolvedValue(mockPage),
    close: vi.fn(),
  };

  return {
    chromium: {
      launch: vi.fn().mockResolvedValue(mockBrowser),
    },
  };
});

import { StorybookMCPServer } from "../src/server.js";

// mock fetch
import fetch from "node-fetch";
globalThis.fetch = fetch as any;

describe("StorybookMCPServer", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...OLD_ENV,
      STORYBOOK_URL: "http://localhost:6006/index.json",
    };
    // Reset all mocks
    vi.clearAllMocks();
  });

  it("should throw if STORYBOOK_URL is not set", () => {
    process.env.STORYBOOK_URL = "";
    expect(() => new StorybookMCPServer()).toThrow(/STORYBOOK_URL/);
  });

  it("should instantiate with STORYBOOK_URL", () => {
    expect(() => new StorybookMCPServer()).not.toThrow();
  });

  it("getComponentList should return unique sorted components", async () => {
    const mockData = {
      entries: {
        a: { type: "docs", title: "Button" },
        b: { type: "docs", title: "Input" },
        c: { type: "docs", title: "Button" },
        d: { type: "story", title: "Other" },
      },
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as any);
    const server = new StorybookMCPServer();
    const result = await (server as any).getComponentList();
    expect(result.content[0].text).toContain("Button");
    expect(result.content[0].text).toContain("Input");
    expect(result.content[0].text).not.toContain("Other");
  });

  it("getComponentPropsType should return props table html", async () => {
    const mockData = {
      entries: {
        a: { type: "docs", title: "Button", id: "button--docs" },
      },
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as any);

    const server = new StorybookMCPServer();
    const result = await (server as any).getComponentPropsType("Button");
    expect(result.content[0].text).toContain("<tr><td>prop</td></tr>");
  });
});
